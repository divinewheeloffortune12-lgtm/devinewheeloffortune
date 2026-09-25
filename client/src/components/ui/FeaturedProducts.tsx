import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const tabsData = [
  {
    value: "new-arrivals",
    label: "New Arrivals",
    products: [
      { id: 1, name: "Purification Sage Bundle", category: "Botanicals", price: "$24", image: "/images/featured_product_1.png" },
      { id: 2, name: "Luminous Quartz Cluster", category: "Crystals", price: "$85", image: "/images/featured_product_2.png" },
      { id: 3, name: "Celestial Journey Journal", category: "Stationery", price: "$32", image: "/images/featured_product_3.png" },
      { id: 4, name: "Aura Cleansing Mist", category: "Apothecary", price: "$28", image: "/images/featured_product_4.png" },
    ]
  },
  {
    value: "best-sellers",
    label: "Best Sellers",
    products: [
      { id: 5, name: "Aura Cleansing Mist", category: "Apothecary", price: "$28", image: "/images/featured_product_4.png" },
      { id: 6, name: "Purification Sage Bundle", category: "Botanicals", price: "$24", image: "/images/featured_product_1.png" },
      { id: 7, name: "Luminous Quartz Cluster", category: "Crystals", price: "$85", image: "/images/featured_product_2.png" },
      { id: 8, name: "Celestial Journey Journal", category: "Stationery", price: "$32", image: "/images/featured_product_3.png" },
    ]
  },
  {
    value: "ritual-kits",
    label: "Ritual Kits",
    products: [
      { id: 9, name: "Celestial Journey Journal", category: "Stationery", price: "$32", image: "/images/featured_product_3.png" },
      { id: 10, name: "Luminous Quartz Cluster", category: "Crystals", price: "$85", image: "/images/featured_product_2.png" },
      { id: 11, name: "Aura Cleansing Mist", category: "Apothecary", price: "$28", image: "/images/featured_product_4.png" },
      { id: 12, name: "Purification Sage Bundle", category: "Botanicals", price: "$24", image: "/images/featured_product_1.png" },
    ]
  }
];

export const FeaturedProducts = () => {
  return (
    <section className="py-20 md:py-32 bg-background border-t border-border">
      <div className="container-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-editorial text-primary">Curated selection</p>
            <h2 className="text-4xl leading-tight md:text-5xl font-serif">Featured Offerings</h2>
          </div>
          <Button variant="link" className="text-primary p-0 hidden md:flex items-center gap-2">
            View all products <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="new-arrivals" className="w-full">
          <TabsList className="mb-12 bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
            {tabsData.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-base font-medium text-muted-foreground data-[state=active]:text-foreground uppercase tracking-widest transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {tab.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative cursor-pointer block h-full bg-white rounded-[2rem] p-3 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[#F5F5F7] mb-4">
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-8 mix-blend-multiply drop-shadow-sm transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Buy Button Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <Button className="w-full bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md transition-colors shadow-lg">
                          <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 px-3 pb-2">
                      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">{product.category}</p>
                      <h3 className="font-serif text-xl text-foreground transition-colors duration-300 group-hover:text-primary leading-snug line-clamp-1">{product.name}</h3>
                      <p className="text-sm font-medium pt-1">{product.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
