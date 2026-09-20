import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Blog() { 
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await api.get('/blogs');
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <section className="pt-32 pb-20 bg-[#f6f0e6]">
        <div className="container-full">
          <p className="text-xs uppercase tracking-[.3em] text-primary">The journal</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 max-w-3xl">Notes for an intentional life.</h1>
        </div>
      </section>
      
      <section className="container-full py-16 md:py-24">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
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
          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map((article: any) => (
              <article key={article._id} className="group rounded-3xl border bg-card p-7 md:p-9 min-h-72 flex flex-col">
                {article.image && (
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative bg-slate-50">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                )}
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
