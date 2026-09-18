import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

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
      <div className="flex space-x-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-1/4 h-80 bg-slate-200 rounded-3xl animate-pulse"></div>
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
        <Link key={product._id} to={`/product/${product.slug}`} className="group relative block overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
          
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">{product.category?.name || "Shop"}</p>
            <h3 className="font-serif text-xl text-slate-900 group-hover:text-primary transition-colors">{product.name}</h3>
            <div className="flex items-center gap-2 mt-2">
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
