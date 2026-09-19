import { useEffect, useState } from 'react';
import { Bell, Loader2, Sparkles, Megaphone, Tag, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';

type Announcement = { 
  _id: string; 
  title: string; 
  content: string; 
  type: 'info' | 'sale' | 'warning'; 
  createdAt: string 
};

export default function Announcements() { 
  const [items, setItems] = useState<Announcement[]>([]); 
  const [loading, setLoading] = useState(true); 
  
  useEffect(() => { 
    api.get('/announcements')
       .then(({ data }) => setItems(data.data))
       .finally(() => setLoading(false)); 
  }, []); 
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'sale': return <Tag className="w-5 h-5 text-purple-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <Megaphone className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'sale': return "bg-purple-100 text-purple-700 border-purple-200";
      case 'warning': return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <Layout>
      <section className="relative min-h-[50vh] flex items-center pt-32 pb-24 overflow-hidden bg-black text-white">
        {/* Proper Video Layer */}
        <video 
          className="absolute inset-0 h-full w-full object-cover contrast-125 saturate-110 brightness-110 filter" 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="metadata"
          poster="/images/placeholder.png"
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay Layer to ensure text readability */}
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-0" />

        {/* Content Layer */}
        <div className="container-full relative z-10">
          <div className="max-w-2xl drop-shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs uppercase tracking-[.2em] font-semibold text-white shadow-sm">Latest Updates</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl drop-shadow-md">Announcements</h1>
            <p className="mt-6 text-lg text-white/90 leading-relaxed drop-shadow">Stay up to date with our newest products, exclusive sales, and important community alerts.</p>
          </div>
        </div>
      </section>
      
      <main className="container max-w-4xl py-16 -mt-10">
        {loading ? (
          <div className="flex justify-center p-20 bg-white rounded-3xl shadow-xl">
            <Loader2 className="w-10 h-10 animate-spin text-primary" /> 
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-xl">
            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-slate-400"/>
            </div>
            <h2 className="font-serif text-2xl">All caught up!</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">There are no new announcements right now. Check back later for more updates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, i) => (
              <article 
                key={item._id} 
                className="group rounded-3xl border border-slate-100 bg-white p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className={`absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${
                  item.type === 'sale' ? 'bg-purple-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="shrink-0 pt-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                      {getIcon(item.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getBadgeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="text-sm font-medium text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <h2 className="font-serif text-2xl md:text-3xl text-slate-900 leading-tight">
                      {item.title}
                    </h2>
                    
                    <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </Layout>
  ); 
}
