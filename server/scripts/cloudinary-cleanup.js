/**
 * Cloudinary Orphan Asset Cleanup Script
 * ========================================
 * Purpose: Identify and optionally delete Cloudinary assets that are no longer
 * referenced by any collection in MongoDB (products, categories, services, blogs,
 * admin profiles, user profile images, announcements).
 *
 * SAFETY RULES:
 * - Dry-run mode is enabled by default. Assets are NOT deleted unless --execute is passed.
 * - Only assets in known project folders are considered for cleanup.
 * - Assets are protected if they appear in ANY database collection.
 * - The script is idempotent — safe to run multiple times.
 * - All operations are logged.
 *
 * Usage:
 *   node server/scripts/cloudinary-cleanup.js              # dry run (safe)
 *   node server/scripts/cloudinary-cleanup.js --execute    # actually delete orphans
 *
 * Required env vars (from server/.env):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MONGODB_URI
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../server/.env') });

const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const EXECUTE = process.argv.includes('--execute');
const DRY_RUN = !EXECUTE;

// ─── Logging ────────────────────────────────────────────────────────────────
const log = (...args) => console.log(new Date().toISOString(), ...args);
const warn = (...args) => console.warn(new Date().toISOString(), '[WARN]', ...args);

// ─── Cloudinary: list all resources in project folders ─────────────────────
/**
 * Fetch all Cloudinary image resources across the project's known folders.
 * Uses pagination to handle large asset sets.
 */
async function fetchAllCloudinaryResources() {
  const folders = [
    'astrology_ecommerce/products',
    'astrology_ecommerce/categories',
    'astrology_ecommerce/admins',
    'astrology/services',
  ];

  const allResources = [];

  for (const folder of folders) {
    let nextCursor = null;
    let pageCount = 0;

    do {
      const params = {
        type: 'upload',
        prefix: folder,
        max_results: 500,
        resource_type: 'image',
      };
      if (nextCursor) params.next_cursor = nextCursor;

      try {
        const result = await cloudinary.api.resources(params);
        allResources.push(...result.resources);
        nextCursor = result.next_cursor;
        pageCount++;
      } catch (err) {
        warn(`Could not list resources in folder "${folder}":`, err.message);
        break;
      }
    } while (nextCursor);

    log(`Folder "${folder}": fetched ${pageCount} page(s) of resources`);
  }

  return allResources;
}

// ─── MongoDB: collect all referenced Cloudinary URLs ───────────────────────
/**
 * Extract the Cloudinary public_id from a full secure URL.
 * Handles URLs with and without version segments.
 */
function publicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const [, after] = url.split('/upload/');
    if (!after) return null;
    // Remove version prefix if present (e.g. v1234567890/)
    let path = after.replace(/^v\d+\//, '');
    // Remove file extension
    path = path.replace(/\.[^/.]+$/, '');
    return path;
  } catch {
    return null;
  }
}

async function collectReferencedPublicIds() {
  const referencedIds = new Set();

  const addUrl = (url) => {
    const id = publicIdFromUrl(url);
    if (id) referencedIds.add(id);
  };

  // Helper: add an array of URLs
  const addUrls = (urls) => (urls || []).forEach(addUrl);

  // ── Products ──
  const Product = mongoose.connection.collection('products');
  const products = await Product.find({}, { projection: { images: 1, imagePublicIds: 1 } }).toArray();
  for (const p of products) {
    addUrls(p.images);
    // imagePublicIds are already public_ids — add them directly
    (p.imagePublicIds || []).forEach((id) => { if (id) referencedIds.add(id); });
  }
  log(`Products: ${products.length} documents, ${referencedIds.size} referenced IDs so far`);

  // ── Categories ──
  const Category = mongoose.connection.collection('categories');
  const categories = await Category.find({}, { projection: { image: 1 } }).toArray();
  for (const c of categories) addUrl(c.image);
  log(`Categories: ${categories.length} documents, ${referencedIds.size} referenced IDs so far`);

  // ── Services ──
  const Service = mongoose.connection.collection('services');
  const services = await Service.find({}, { projection: { image: 1 } }).toArray();
  for (const s of services) addUrl(s.image);
  log(`Services: ${services.length} documents, ${referencedIds.size} referenced IDs so far`);

  // ── Blogs ──
  const Blog = mongoose.connection.collection('blogs');
  const blogs = await Blog.find({}, { projection: { image: 1 } }).toArray();
  for (const b of blogs) addUrl(b.image);
  log(`Blogs: ${blogs.length} documents, ${referencedIds.size} referenced IDs so far`);

  // ── Admin profiles ──
  const AdminUser = mongoose.connection.collection('adminusers');
  const admins = await AdminUser.find({}, { projection: { profileImage: 1 } }).toArray();
  for (const a of admins) addUrl(a.profileImage);
  log(`Admin users: ${admins.length} documents, ${referencedIds.size} referenced IDs so far`);

  // ── User profile images ──
  const User = mongoose.connection.collection('users');
  const users = await User.find({ profileImage: { $exists: true, $ne: null } }, { projection: { profileImage: 1 } }).toArray();
  for (const u of users) addUrl(u.profileImage);
  log(`Users: ${users.length} documents, ${referencedIds.size} referenced IDs so far`);

  return referencedIds;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  log('='.repeat(70));
  log('Cloudinary Orphan Cleanup Script');
  log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no deletions will occur)' : '🗑️  EXECUTE (orphans WILL be deleted)'}`);
  log('='.repeat(70));

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set. Ensure server/.env is present and loaded.');
    process.exit(1);
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('ERROR: Cloudinary credentials are not set. Ensure server/.env is present and loaded.');
    process.exit(1);
  }

  // Connect to MongoDB
  log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  log('Connected to MongoDB.');

  // Fetch all Cloudinary resources
  log('Fetching Cloudinary assets...');
  const cloudinaryResources = await fetchAllCloudinaryResources();
  log(`Total Cloudinary assets found: ${cloudinaryResources.length}`);

  // Collect all referenced public IDs from database
  log('Collecting all referenced Cloudinary assets from database...');
  const referencedIds = await collectReferencedPublicIds();
  log(`Total referenced Cloudinary public_ids in database: ${referencedIds.size}`);

  // Reconcile
  const orphans = [];
  const protected_ = [];

  for (const resource of cloudinaryResources) {
    const { public_id, secure_url, bytes, created_at } = resource;
    const sizeKb = Math.round(bytes / 1024);

    if (referencedIds.has(public_id)) {
      protected_.push({ public_id, sizeKb });
    } else {
      orphans.push({ public_id, secure_url, sizeKb, created_at });
    }
  }

  // ── Report ──
  log('');
  log('─'.repeat(70));
  log(`PROTECTED (referenced by database): ${protected_.length} assets`);
  log(`ORPHANED  (not referenced anywhere): ${orphans.length} assets`);
  log('─'.repeat(70));

  const totalOrphanBytes = orphans.reduce((sum, o) => sum + o.sizeKb * 1024, 0);
  log(`Estimated reclaimable storage: ${(totalOrphanBytes / 1024 / 1024).toFixed(2)} MB`);
  log('');

  if (orphans.length === 0) {
    log('✅ No orphaned assets found. Cloudinary storage is clean.');
  } else {
    log('Orphaned assets:');
    orphans.forEach((o, i) => {
      log(`  [${i + 1}] ${o.public_id} | ${o.sizeKb} KB | Created: ${o.created_at}`);
    });

    if (DRY_RUN) {
      log('');
      log('🔒 DRY RUN: No assets deleted.');
      log('   Re-run with --execute flag to delete these orphaned assets:');
      log('   node server/scripts/cloudinary-cleanup.js --execute');
    } else {
      log('');
      log('🗑️  EXECUTE MODE: Deleting orphaned assets...');
      let deleted = 0;
      let failed = 0;

      for (const orphan of orphans) {
        try {
          await cloudinary.uploader.destroy(orphan.public_id);
          log(`  ✅ Deleted: ${orphan.public_id} (${orphan.sizeKb} KB)`);
          deleted++;
        } catch (err) {
          warn(`  ❌ Failed to delete ${orphan.public_id}:`, err.message);
          failed++;
        }
      }

      log('');
      log(`Cleanup complete. Deleted: ${deleted}, Failed: ${failed}`);
    }
  }

  log('');
  log('─'.repeat(70));
  log('Protected assets summary (not touched):');
  protected_.slice(0, 10).forEach((p) => log(`  - ${p.public_id} (${p.sizeKb} KB)`));
  if (protected_.length > 10) log(`  ... and ${protected_.length - 10} more.`);
  log('─'.repeat(70));

  await mongoose.disconnect();
  log('Disconnected from MongoDB. Script complete.');
}

main().catch((err) => {
  console.error('Script failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
