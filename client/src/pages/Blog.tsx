import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { blogs } from "@/data/blogs";

export default function Blog() { 
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-[#f6f0e6]">
        <div className="container-full">
          <p className="text-xs uppercase tracking-[.3em] text-primary">The journal</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 max-w-3xl">Notes for an intentional life.</h1>
        </div>
      </section>
      
      <section className="container-full py-16 md:py-24 grid md:grid-cols-3 gap-6">
        {blogs.map((article) => (
          <article key={article.id} className="group rounded-3xl border bg-card p-7 md:p-9 min-h-72 flex flex-col">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
               <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="text-xs uppercase tracking-[.2em] text-primary">{article.date} · {article.author}</p>
            <h2 className="font-serif text-2xl mt-4 leading-tight group-hover:text-primary transition-colors">{article.title}</h2>
            <p className="mt-4 text-muted-foreground leading-7 line-clamp-3">{article.excerpt}</p>
            <Link to={`/blog/${article.slug}`} className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-semibold group-hover:text-primary transition-colors">
              Read article <ArrowRight className="w-4 h-4"/>
            </Link>
          </article>
        ))}
      </section>
    </Layout>
  ); 
}
