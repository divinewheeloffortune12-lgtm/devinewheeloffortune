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
      <section className="container-full grid lg:grid-cols-[.8fr_1.2fr] gap-12 py-16 md:py-24">
        <aside className="space-y-7">
          <div>
            <Mail className="w-5 h-5 text-primary mb-3"/>
            <h2 className="font-serif text-2xl">Write to us</h2>
            <p className="mt-2 text-muted-foreground">For orders, products, and spiritual guidance, leave a thoughtful note.</p>
          </div>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href="mailto:hello@divinewheel.example">
            <Mail className="w-4 h-4"/>hello@divinewheel.example
          </a>
          <a className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" href="https://wa.me/919999999999?text=Hello%20Divine%20Wheel" target="_blank" rel="noreferrer">
            <MessageCircle className="w-4 h-4"/>Chat on WhatsApp
          </a>
        </aside>
        <form onSubmit={submit} className="rounded-3xl border bg-card p-6 md:p-10 shadow-sm space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="text-sm font-medium">Name<Input required name="name" minLength={2} className="mt-2"/></label>
            <label className="text-sm font-medium">Email<Input required name="email" type="email" className="mt-2"/></label>
          </div>
          <label className="text-sm font-medium block">Phone <span className="text-muted-foreground">optional</span><Input name="phone" className="mt-2"/></label>
          <label className="text-sm font-medium block">Subject<Input required name="subject" minLength={3} className="mt-2"/></label>
          <label className="text-sm font-medium block">How can we help?<Textarea required name="message" minLength={10} maxLength={3000} rows={6} className="mt-2"/></label>
          <Button disabled={sending} className="rounded-full px-7">{sending ? 'Sending…' : 'Send message'}<Send className="ml-2 w-4 h-4"/></Button>
        </form>
      </section>
    </Layout>
  );
}
