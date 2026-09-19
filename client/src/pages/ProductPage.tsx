import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ShieldCheck, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api, getErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/useCart';

type Product = { 
  _id: string; 
  id?: string;
  name: string; 
  description?: string; 
  price: number; 
  mrp: number; 
  stock: number; 
  images?: string[]; 
  sizes?: string[];
  category?: { name: string };
};

export default function ProductPage() { 
  const { slug } = useParams(); 
  const [product, setProduct] = useState<Product | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [authPrompt, setAuthPrompt] = useState(false); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => { 
    let live = true; 
    api.get(`/products/${encodeURIComponent(slug || '')}`)
       .then(({ data }) => { 
         if (live) {
           setProduct(data.data);
           if ((data.data.sizes || []).length > 0) setSelectedSize(data.data.sizes[0]);
         }
       })
       .catch(() => { if (live) setProduct(null); })
       .finally(() => { if (live) setLoading(false); }); 
    return () => { live = false; }; 
  }, [slug]);

  const isLoggedIn = !!localStorage.getItem("token");

  const add = () => { 
    if (!isLoggedIn) {
      setAuthPrompt(true);
      return;
    }
    if (!product) return; 
    const formattedProduct = { ...product, id: product._id };
    addItem(formattedProduct as any, 1);
    toast({ title: 'Added to bag' }); 
  };

  const nextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % (product.images || []).length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + (product.images || []).length) % (product.images || []).length);
  };

  if (loading) return <Layout><div className="min-h-[70vh] grid place-items-center"><Loader2 className="animate-spin text-primary"/></div></Layout>;
  
  if (!product) return <Layout><div className="container py-36 text-center"><h1 className="font-serif text-4xl">Product unavailable</h1><p className="mt-3 text-muted-foreground">It may no longer be in our collection.</p><Button asChild className="mt-8 rounded-full"><Link to="/products">Return to shop</Link></Button></div></Layout>;
  
  const images = product.images || [];

  return (
    <Layout>
      <main className="container-full pt-28 pb-16 md:pb-24">
        <Link to="/products" className="text-xs uppercase tracking-[.2em] text-muted-foreground hover:text-primary">
          ← Back to shop
        </Link>
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 mt-7">
          
          {/* Images Carousel */}
          <section className="relative overflow-hidden rounded-3xl group select-none bg-slate-50">
            {images.length > 0 ? (
              <div className="aspect-[4/5] md:aspect-square relative flex items-center justify-center">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`${product.name} - View ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Dots indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-[4/5] md:aspect-square grid place-items-center text-muted-foreground bg-slate-100">
                Image unavailable
              </div>
            )}
          </section>

          {/* Product Details */}
          <section className="lg:pt-10 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs uppercase tracking-[.25em] text-primary">{product.category?.name || 'Spiritual collection'}</p>
            <h1 className="font-serif text-4xl md:text-6xl mt-4">{product.name}</h1>
            
            <div className="mt-6 flex items-baseline gap-3">
              {isLoggedIn && product.price !== undefined ? (
                <>
                  {(() => {
                    const discount = product.discount || 0;
                    const finalPrice = Math.round(product.price * (1 - discount / 100));
                    return (
                      <>
                        <span className="text-2xl font-semibold">₹{finalPrice.toLocaleString('en-IN')}</span>
                        {discount > 0 && <span className="text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>}
                      </>
                    );
                  })()}
                </>
              ) : (
                <span className="text-xl font-semibold text-muted-foreground">Login to view price</span>
              )}
            </div>
            
            <p className="mt-8 leading-8 text-muted-foreground">{product.description || 'A thoughtfully selected piece for your personal practice.'}</p>
            
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-medium mb-3 uppercase tracking-wider text-slate-500 text-xs">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${
                        selectedSize === size 
                          ? 'border-slate-900 bg-slate-900 text-white' 
                          : 'border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 flex gap-3 shadow-sm">
                <ShieldCheck className="text-primary shrink-0 w-6 h-6"/>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Secure Checkout</p>
                  <p className="text-xs text-slate-500 mt-1 leading-5">Stock and prices are confirmed securely by our servers.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold mb-1">Availability</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <p className="font-medium text-slate-800">{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <Button onClick={add} disabled={product.stock < 1} variant="outline" className="w-full rounded-full h-14 text-sm font-semibold tracking-wide uppercase transition-all duration-300">
                {product.stock < 1 ? 'Unavailable' : <><ShoppingBag className="mr-2 w-5 h-5"/> Add to Bag</>}
              </Button>
              <Button 
                onClick={() => {
                  if (!isLoggedIn) {
                    setAuthPrompt(true);
                    return;
                  }
                  if (!product) return;
                  if (product.stock < 1) return;
                  const formattedProduct = { ...product, id: product._id };
                  addItem(formattedProduct as any, 1);
                  window.location.href = '/checkout';
                }} 
                disabled={product.stock < 1} 
                className="w-full rounded-full h-14 text-sm font-semibold tracking-wide uppercase shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                {product.stock < 1 ? 'Out of stock' : (isLoggedIn && product.price !== undefined ? (
                  (() => {
                    const discount = product.discount || 0;
                    const finalPrice = Math.round(product.price * (1 - discount / 100));
                    return `Buy Now — ₹${finalPrice.toLocaleString('en-IN')}`;
                  })()
                ) : 'Buy Now')}
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={authPrompt} onOpenChange={setAuthPrompt}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-2xl">Save your selection</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Sign in to add this piece to your secure bag.</p>
          <div className="flex gap-3 mt-2">
            <Button asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild variant="outline"><Link to="/signup">Create account</Link></Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  ); 
}
