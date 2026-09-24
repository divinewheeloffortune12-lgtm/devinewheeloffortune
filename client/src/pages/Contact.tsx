import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [sending, setSending] = useState(false);
  
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      setSending(true);
      const res = await api.post('/contact', Object.fromEntries(form));
      if (res.data?.success) {
        formElement.reset();
        toast.success('Message received. Our team will reply as soon as possible.');
      } else {
        throw new Error(res.data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(getErrorMessage(error, 'Message not sent. Please try again shortly.'));
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <section className="bg-[#15121d] text-white pt-32 pb-20">
        <div className="container-full">
          <p className="text-xs uppercase tracking-[.3em] text-primary mb-4">A conversation, whenever you need it</p>
          <h1 className="font-serif text-5xl md:text-7xl max-w-3xl">We’re here to help you find your way.</h1>
        </div>
      </section>
      <section className="container-full grid lg:grid-cols-[1fr_1.2fr] gap-12 py-16 md:py-24">
        <div className="space-y-8">
          <aside className="space-y-6">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <Mail className="w-6 h-6 text-primary mb-4"/>
              <h2 className="font-serif text-2xl text-slate-800">Get in touch</h2>
              <p className="mt-2 text-slate-500 mb-6 leading-relaxed">For orders, products, and spiritual guidance, leave a thoughtful note or reach out directly.</p>
              
              <div className="space-y-4">
                <a className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-primary transition-colors" href="mailto:nattashasharrma1278@gmail.com">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm"><Mail className="w-4 h-4"/></div>
                  nattashasharrma1278@gmail.com
                </a>
                <a className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-primary transition-colors" href="https://wa.me/919876978500?text=Hello%20Divine%20Wheel" target="_blank" rel="noreferrer">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm"><MessageCircle className="w-4 h-4"/></div>
                  +91 98769 78500 (Serious Inquiries Only)
                </a>
                <a className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-primary transition-colors" href="https://www.youtube.com/@Natasshasharrma_says" target="_blank" rel="noreferrer">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </div>
                  @Natasshasharrma_says
                </a>
                <a className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-primary transition-colors" href="https://www.instagram.com/divine_wheel_of_fortune" target="_blank" rel="noreferrer">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  @divine_wheel_of_fortune
                </a>
              </div>
            </div>
          </aside>
        </div>
        <form onSubmit={submit} className="rounded-3xl border bg-card p-6 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.05)] space-y-5 h-fit">
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="text-sm font-medium text-slate-700">Name<Input required name="name" minLength={2} className="mt-2 bg-slate-50 border-slate-200"/></label>
            <label className="text-sm font-medium text-slate-700">Email<Input required name="email" type="email" className="mt-2 bg-slate-50 border-slate-200"/></label>
          </div>
          <label className="text-sm font-medium text-slate-700 block">Phone <span className="text-slate-400 font-normal">optional</span><Input name="phone" className="mt-2 bg-slate-50 border-slate-200"/></label>
          <label className="text-sm font-medium text-slate-700 block">Subject<Input required name="subject" minLength={3} className="mt-2 bg-slate-50 border-slate-200"/></label>
          <label className="text-sm font-medium text-slate-700 block">How can we help?<Textarea required name="message" minLength={10} maxLength={3000} rows={6} className="mt-2 bg-slate-50 border-slate-200 resize-none"/></label>
          <Button disabled={sending} className="w-full sm:w-auto rounded-xl px-10 py-6 text-sm tracking-wide bg-slate-900 hover:bg-primary hover:text-primary-foreground transition-all">{sending ? 'Sending…' : 'Send message'}<Send className="ml-2 w-4 h-4"/></Button>
        </form>
      </section>
    </Layout>
  );
}
