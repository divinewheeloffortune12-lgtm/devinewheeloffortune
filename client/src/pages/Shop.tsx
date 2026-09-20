import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/hooks/useCart";
import { useLikes } from "@/hooks/useLikes";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

type Category = { _id: string; name: string; image?: string; note?: string };
type Product = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  description?: string;
  images: string[];
  category?: Category;
};
export default function Shop() {
  const [params, setParams] = useSearchParams();
  const queryString = params.toString();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("q") || "");
  const [authPrompt, setAuthPrompt] = useState(false);
  const { toast } = useToast();
  const category = params.get("category") || "";
  const { addItem } = useCart();
  const { likedProducts, toggleLike } = useLikes();
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    const current = new URLSearchParams(queryString);
    api
      .get("/products", {
        params: {
          category: category || undefined,
          q: current.get("q") || undefined,
          limit: 24,
        },
      })
      .then(({ data }) => {
        if (live) {
          const validProducts = data.data.filter((p: any) => p.availability !== false && p.isDeleted !== true);
          setProducts(validProducts);
        }
      })
      .catch((error) =>
        toast({
          variant: "destructive",
          title: "Could not load products",
          description: getErrorMessage(error, "Please try again."),
        }),
      )
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [category, queryString, toast]);
  const chooseCategory = (id = "") => {
    const next = new URLSearchParams(params);
    if (id) next.set("category", id);
    else next.delete("category");
    setParams(next);
  };
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (search.trim()) next.set("q", search.trim());
    else next.delete("q");
    setParams(next);
  };

  const addToCart = (product: Product) => {
    const formattedProduct = { ...product, id: product._id };
    addItem(formattedProduct as any, 1);
    toast({ title: "Added to bag" });
  };

  const buyNow = (product: Product) => {
    const formattedProduct = { ...product, id: product._id };
    addItem(formattedProduct as any, 1);
    window.location.href = "/checkout";
  };

  return (
    <Layout>
      <section className="pt-28 pb-10 bg-[#181422] text-white">
        <div className="container-full">
          <p className="text-xs tracking-[.28em] uppercase text-primary">
            Find what resonates
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mt-3">
            Shop the collection
          </h1>
          <form onSubmit={submitSearch} className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search crystals, malas, rituals…"
              className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/45 rounded-full"
            />
          </form>
        </div>
      </section>
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container-full flex gap-2 overflow-x-auto py-4">
          <Button
            onClick={() => chooseCategory()}
            variant={!category ? "default" : "outline"}
            className="rounded-full whitespace-nowrap"
          >
            All
          </Button>
          {categories.map((item) => (
            <Button
              key={item._id}
              onClick={() => chooseCategory(item._id)}
              variant={category === item._id ? "default" : "outline"}
              className="rounded-full whitespace-nowrap"
            >
              {item.name}
            </Button>
          ))}
        </div>
      </section>
      <main className="container-full py-10 md:py-16">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="mx-auto text-primary w-9 h-9" />
            <h2 className="font-serif text-3xl mt-4">No products found</h2>
            <p className="text-muted-foreground mt-2">
              Try another category or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <article
                key={product._id}
                className="group flex flex-col rounded-[2rem] border border-border/60 bg-white shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                <div
                  className="relative block aspect-[4/5] overflow-hidden bg-slate-50"
                >
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                  
                  {product.images.length > 1 ? (
                    <Swiper
                      modules={[Pagination, EffectFade]}
                      effect="fade"
                      pagination={{ clickable: true }}
                      className="w-full h-full [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet-active]:bg-white"
                    >
                      {product.images.map((img, i) => (
                        <SwiperSlide key={i}>
                          <Link to={`/product/${product.slug}`} className="block w-full h-full">
                            <img
                              src={img}
                              alt={`${product.name} - view ${i + 1}`}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : product.images[0] ? (
                    <Link to={`/product/${product.slug}`} className="block w-full h-full">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  ) : (
                    <Link to={`/product/${product.slug}`} className="block w-full h-full">
                      <div className="h-full grid place-items-center text-muted-foreground">
                        Image unavailable
                      </div>
                    </Link>
                  )}

                  {product.stock < 1 && (
                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-sm pointer-events-none">
                      Sold Out
                    </div>
                  )}
                </div>
                <div className="relative p-5 sm:p-6 flex flex-col flex-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(product._id);
                    }}
                    className={cn(
                      "absolute top-5 right-5 p-2 rounded-full transition-all duration-300 z-20 hover:bg-slate-100",
                      likedProducts.includes(product._id)
                        ? "text-red-500"
                        : "text-slate-400",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5",
                        likedProducts.includes(product._id)
                          ? "fill-current"
                          : "",
                      )}
                    />
                  </button>
                  <p className="text-[10px] uppercase tracking-[.2em] text-primary font-medium mb-2">
                    {product.category?.name || "Spiritual collection"}
                  </p>
                  <Link
                    to={`/product/${product.slug}`}
                    className="font-serif text-xl sm:text-2xl text-slate-900 hover:text-primary transition-colors line-clamp-1 pr-8"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed flex-1">
                    {product.description ||
                      "Selected with intention for your spiritual journey."}
                  </p>
                  <div className="flex items-baseline gap-2 mt-5 pt-5 border-t border-slate-50">
                    {(() => {
                      const discount = product.discount || 0;
                      const finalPrice = Math.round(product.price * (1 - discount / 100));
                      return (
                        <>
                          <span className="text-lg font-semibold text-slate-900">
                            ₹{finalPrice.toLocaleString("en-IN")}
                          </span>
                          {discount > 0 && (
                            <span className="text-xs line-through text-slate-400">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <Button
                      disabled={product.stock < 1}
                      onClick={() => addToCart(product)}
                      variant="outline"
                      className="w-full rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Cart
                    </Button>
                    <Button
                      disabled={product.stock < 1}
                      onClick={() => buyNow(product)}
                      className="w-full rounded-full shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Dialog open={authPrompt} onOpenChange={setAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Save your selection
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Please sign in or create an account to keep your bag secure across
            devices.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
