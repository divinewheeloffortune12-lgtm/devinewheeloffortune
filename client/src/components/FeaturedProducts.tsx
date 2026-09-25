import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { optimizeImage } from "@/lib/utils";

type Product = { 
  _id: string; 
  name: string; 
  slug: string;
  price: number;
  mrp: number;
  stock: number;
  images?: string[]; 
  category?: { name: string } 
};

export const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await api.get('/products?limit=4');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex flex-col rounded-[2rem] border border-border/60 bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-[4/5] bg-slate-100"></div>
            <div className="p-5 sm:p-6 flex flex-col flex-1 mt-2">
              <div className="h-3 w-1/3 bg-slate-100 rounded mb-4"></div>
              <div className="h-6 w-3/4 bg-slate-100 rounded mb-3"></div>
              <div className="mt-auto pt-5 border-t border-slate-50 flex gap-2">
                <div className="h-6 w-24 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <div className="text-slate-500 py-10">No products available at the moment.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product: Product) => (
        <Link key={product._id} to={`/product/${product.slug}`} className="group relative block h-full bg-white rounded-[2rem] p-3 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50">
          <div className="aspect-[4/5] bg-[#F5F5F7] rounded-3xl relative overflow-hidden mb-4">
            {product.images && product.images[0] ? (
              <img src={optimizeImage(product.images[0], { width: 400 })} alt={product.name} loading="lazy" className="w-full h-full object-contain p-8 mix-blend-multiply drop-shadow-sm transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
            )}
           {(() => {
            const discount = product.discount || 0;
            const finalPrice = Math.round(product.price * (1 - discount / 100));
            return discount > 0 ? (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discount}%
              </span>
            ) : null;
          })()}  {/* Quick add overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
              <div className="bg-white text-slate-900 w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg hover:bg-slate-50 transition-colors">
                <ShoppingBag className="w-4 h-4" /> View Details
              </div>
            </div>
          </div>
          
          <div className="space-y-1 px-3 pb-2">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">{product.category?.name || "Shop"}</p>
            <h3 className="font-serif text-xl text-foreground transition-colors duration-300 group-hover:text-primary leading-snug">{product.name}</h3>
            <div className="flex items-center gap-2 pt-1">
              {(() => {
                const discount = product.discount || 0;
                const finalPrice = Math.round(product.price * (1 - discount / 100));
                return (
                  <>
                    <span className="font-semibold text-lg text-slate-900">₹{finalPrice.toLocaleString('en-IN')}</span>
                    {discount > 0 && <span className="text-sm text-slate-500 line-through">₹{product.price.toLocaleString('en-IN')}</span>}
                  </>
                );
              })()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
