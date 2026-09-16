import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";

export const CartIcon = () => {
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <Link
      to="/cart"
      className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="w-5 h-5" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
          >
            {itemCount > 9 ? "9+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};
