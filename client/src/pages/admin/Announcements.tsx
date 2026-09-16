import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(3).max(1000),
  type: z.enum(["info", "sale", "warning"]),
  status: z.enum(["draft", "published", "archived"]),
});

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "info",
      status: "published",
    },
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/announcements/admin", {
        withCredentials: true
      });
      setAnnouncements(data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching announcements",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    form.reset({
      title: item.title,
      content: item.content,
      type: item.type,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    form.reset({
      title: "",
      content: "",
      type: "info",
      status: "published",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/announcements/admin/${editingId}`, values, {
          withCredentials: true
        });
        toast({ title: "Announcement updated successfully" });
      } else {
        await axios.post("http://localhost:5000/api/announcements/admin", values, {
          withCredentials: true
        });
        toast({ title: "Announcement created successfully" });
      }
      
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save announcement",
        description: error.response?.data?.message || "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/announcements/admin/${id}`, {
        withCredentials: true
      });
      toast({ title: "Announcement deleted" });
      fetchAnnouncements();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-slate-900">Announcements</h2>
          <p className="text-slate-500 mt-1">Manage public notices, sales, and alerts.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleCreateNew}>
              <Plus className="w-4 h-4" /> Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                          <option value="info">Info</option>
                          <option value="sale">Sale</option>
                          <option value="warning">Warning</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingId ? "Save Changes" : "Create Announcement"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200 shadow-sm">
          <p className="text-slate-500">No announcements found. Add your first announcement to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a: any) => (
                <tr key={a._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{a.title}</td>
                  <td className="p-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      a.type === 'sale' ? 'bg-purple-100 text-purple-700' :
                      a.type === 'warning' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="p-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      a.status === 'published' ? 'bg-green-100 text-green-700' :
                      a.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(a)} className="text-slate-400 hover:text-primary hover:bg-primary/5">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(a._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
