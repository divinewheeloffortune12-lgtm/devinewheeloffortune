import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center bg-[#f9f9f9]">
        <div className="container-narrow text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white p-12 md:p-20 rounded-3xl shadow-xl shadow-black/5 border border-black/5"
          >
            <p className="text-8xl md:text-9xl font-serif text-primary/20 mb-6 drop-shadow-sm">404</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Lost in the stars.
            </h1>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg leading-relaxed">
              The page you're looking for doesn't exist or has moved. Let's guide you back to the right path.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full shadow-md hover:shadow-lg transition-all">
                <Link to="/">Return Home</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/products">Browse Shop</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
