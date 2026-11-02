import { Link } from "react-router-dom";
import { blogs as localBlogs } from "@/data/blogs";
import { ArrowRight, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { optimizeImage } from "@/lib/utils";

export default function Blog() { 
  const { data: blogs = localBlogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/blogs', { timeout: 3000 });
        const blogsToUse = data.length > 0 ? data : localBlogs;
        return blogsToUse.map(b => {
          if (b.slug === 'dragon-reiki-healing-awaken-ancient-power') {
            return { ...b, image: "/images/dragon_reiki_healing.png" };
          }
          if (b.slug === 'what-is-dragon-reiki') {
            return { ...b, image: "/images/dragon_reiki_guide.png" };
          }
          return b;
        });
      } catch (error) {
        return localBlogs;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <SectionHeader 
        overline="The journal"
        title="Notes for an intentional life."
      />
      
      <section className="container-full py-16 md:py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-3xl border bg-card p-7 md:p-9 min-h-72 flex flex-col animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 mb-6"></div>
                <div className="h-3 w-32 bg-slate-200 rounded mb-4"></div>
                <div className="h-6 w-full bg-slate-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 w-24 bg-slate-200 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p>No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-0">
            {blogs.map((article: any) => (
              <article key={article._id} className="group rounded-3xl border bg-card p-7 md:p-9 min-h-72 flex flex-col">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative bg-slate-50">
                  <img 
                    src={optimizeImage(article.image || "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&q=80&w=800", { width: 800 })} 
                    alt={article.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <p className="text-xs uppercase tracking-[.2em] text-primary">
                  {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {article.author}
                </p>
                <h2 className="font-serif text-2xl mt-4 leading-tight group-hover:text-primary transition-colors">{article.title}</h2>
                <p className="mt-4 text-muted-foreground leading-7 line-clamp-3">{article.excerpt}</p>
                <Link to={`/blog/${article.slug}`} className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-semibold group-hover:text-primary transition-colors">
                  Read article <ArrowRight className="w-4 h-4"/>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  ); 
}
