import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Product, collections } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Tilt from "react-parallax-tilt";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large";
}

export const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const collection = collections.find((c) => c.id === product.collection);
  const hasSecondImage = (product.images || []).length > 1;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} transitionSpeed={2500} scale={1.02} className="relative mb-5" glareEnable={true} glareMaxOpacity={0.1} glarePosition="all" glareBorderRadius="0">
          <div
            className={cn(
              "relative overflow-hidden bg-slate-50 border border-slate-100 rounded-t-2xl",
              variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]"
            )}
          >
          {hasSecondImage ? (
            <Swiper
              modules={[Pagination, EffectFade]}
              effect="fade"
              pagination={{ clickable: true }}
              className="w-full h-full [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet-active]:bg-white"
            >
              {(product.images || []).map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={img}
                    alt={`${product.name} - view ${i + 1}`}
                    className="w-full h-full object-contain p-4 mix-blend-multiply transition-all duration-[1s] ease-out group-hover:scale-105"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <img
              src={(product.images || [])[0]}
              alt={product.name}
              className="w-full h-full object-contain p-4 mix-blend-multiply transition-all duration-[1s] ease-out group-hover:scale-105"
            />
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-5 right-5 p-2.5 rounded-full transition-all duration-500",
              "bg-background/90 backdrop-blur-md hover:bg-background shadow-sm",
              "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
              inWishlist && "opacity-100 translate-y-0"
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                inWishlist ? "fill-primary text-primary scale-110" : "text-foreground"
              )}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-5 left-5 flex flex-col gap-2">
            {product.new && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-foreground text-background"
              >
                New
              </motion.span>
            )}
            {product.featured && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground"
              >
                Featured
              </motion.span>
            )}
          </div>

          {/* Quick View Indicator */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span className="px-6 py-2.5 text-xs font-medium tracking-[0.15em] uppercase bg-background/95 backdrop-blur-md text-foreground shadow-lg">
              View Details
            </span>
          </div>
        </div>
        </Tilt>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Collection label */}
          {collection && (
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">
              {collection.name}
            </p>
          )}

          <h3 className="font-serif text-xl text-foreground transition-colors duration-300 group-hover:text-primary leading-snug">
            {product.name}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-3 pt-1">
            {isLoggedIn && product.price !== undefined ? (
              <div className="flex items-center gap-2">
                <p className="text-base font-medium text-foreground tracking-wide">
                  {(() => {
                    const discount = product.discount || 0;
                    const finalPrice = Math.round(product.price * (1 - discount / 100));
                    return `₹${finalPrice.toLocaleString('en-IN')}`;
                  })()}
                </p>
                {(product.discount || 0) > 0 && (
                  <p className="text-xs text-muted-foreground line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground tracking-wide">
                Login to view price
              </p>
            )}
            {product.materials && (
              <>
                <span className="w-px h-3 bg-border" />
                <p className="text-xs text-muted-foreground/60 tracking-wide">
                  {product.materials.split(",")[0]}
                </p>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
