import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const Cart = () => {
  const { items, updateQuantity, removeItem, getSubtotal, syncCart } = useCart();
  useEffect(() => {
    if (items.length > 0) {
      const itemIds = items.map(item => item.product.id);
      api.post("/products/validate-cart", { items: itemIds }).then(({ data }) => {
        if (data?.success) {
          syncCart(data.data);
        }
      }).catch(console.error);
    }
  }, []);

  const subtotal = Math.max(0, Number(getSubtotal()) || 0);
  
  const shipping = items.reduce((total, item) => {
    if (item.product.isShippingRequired && !item.product.freeShipping) {
      return total + (item.product.shippingCharge || 0) * item.quantity;
    }
    return total;
  }, 0);

  const total = Math.max(0, subtotal + shipping);

  const hasUnavailableItems = items.some(item => !item.product.availability || item.product.isDeleted || item.product.stock < item.quantity);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-narrow py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
            <h1 className="font-serif text-4xl mb-4">Your Bag is Empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Discover our curated collection of handcrafted home goods and find
              pieces that speak to you.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium"
            >
              <Link to="/products">
                Start Shopping
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container-full py-6 border-b border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Your Bag</span>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl mb-12"
          >
            Your Bag
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-7">
              <div className="space-y-0">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex gap-6 py-8 border-b border-border"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="w-28 h-32 md:w-36 md:h-44 flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-100 rounded-xl group"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif text-lg md:text-xl hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.product.description}
                        </p>
                        <div className="font-medium text-foreground">
                          {(() => {
                            const discount = item.product.discount || 0;
                            const finalPrice = Math.round(item.product.price * (1 - discount / 100));
                            return (
                              <div className="flex flex-col items-end">
                                <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                                {discount > 0 && (
                                  <span className="text-xs line-through text-muted-foreground">
                                    ₹{item.product.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        {((!item.product.availability) || (item.product.isDeleted) || item.product.stock < item.quantity) && (
                          <div className="mt-2 text-xs font-medium text-destructive">
                            {(!item.product.availability || item.product.isDeleted) ? "Product Not Available" : 
                             item.product.stock === 0 ? "Out of Stock" : 
                             `Only ${item.product.stock} available`}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <QuantitySelector
                          quantity={item.quantity}
                          onQuantityChange={(qty) =>
                            updateQuantity(item.product.id, qty)
                          }
                        />
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 mt-8 text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-linen p-8 lg:sticky lg:top-28">
                <h2 className="font-serif text-2xl mb-8">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">
                      {shipping === 0 ? "₹0" : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between font-serif text-xl">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  disabled={hasUnavailableItems}
                  className={`w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase ${hasUnavailableItems ? 'bg-muted text-muted-foreground pointer-events-none' : 'btn-premium'}`}
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </Link>
                </Button>
                {hasUnavailableItems && (
                  <p className="text-xs text-destructive text-center mt-3">
                    Please remove or update unavailable items to proceed.
                  </p>
                )}

                {/* Trust signals */}
                <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">
                      Shipping
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Worldwide delivery
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">
                      Returns
                    </p>
                    <p className="text-xs text-muted-foreground">
                      14-day policy
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
