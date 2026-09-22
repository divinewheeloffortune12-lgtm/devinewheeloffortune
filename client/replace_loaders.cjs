const fs = require('fs');
const path = require('path');

const dir = 'd:/Freelancing work/Astrology/client/src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const skeletonCode = `    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-4 w-64 bg-slate-200 animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="bg-white/60 rounded-3xl border border-slate-100 p-6 space-y-4">
          <div className="h-12 w-full bg-slate-200 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-200 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-200 animate-pulse rounded"></div>
        </div>
      </div>
    );`;

for (const file of files) {
  if (file === 'Users.tsx') continue;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    /return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin .*?" \/><\/div>;/g,
    skeletonCode
  );

  content = content.replace(
    /return \(\s*<div className="flex justify-center py-20">\s*<Loader2 className="w-8 h-8 animate-spin text-primary" \/>\s*<\/div>\s*\);/g,
    skeletonCode
  );
  
  fs.writeFileSync(filePath, content);
}
console.log('Replaced loaders');
