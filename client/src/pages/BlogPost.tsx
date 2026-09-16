import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Layout } from "@/components/Layout";
import { blogs } from "@/data/blogs";
import { useEffect } from "react";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const post = blogs.find(b => b.slug === slug);

  useEffect(() => {
    if (!post) {
      navigate('/blog', { replace: true });
    }
  }, [post, navigate]);

  if (!post) return null;

  return (
    <Layout>
      <article className="pb-20">
        <header className="pt-32 pb-16 bg-[#f6f0e6]">
          <div className="container-narrow">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-8 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4" /> Back to Journal
            </Link>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-8">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>
          </div>
        </header>

        <div className="container-narrow mt-16">
          <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-xl">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-3xl mx-auto space-y-6">
             {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-muted-foreground leading-8" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
             ))}
          </div>

          <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-2">
            {post.keywords.map((keyword, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-slate-100 text-sm text-slate-600 font-medium">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  );
}
