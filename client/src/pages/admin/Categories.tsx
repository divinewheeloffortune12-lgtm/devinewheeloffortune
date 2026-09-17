import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  note: z.string().min(2, "Note is required"),
});

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      note: "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching categories",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setSelectedImage(null);
    setPreviewUrl(item.image || null);
    form.reset({
      name: item.name,
      slug: item.slug || "",
      description: item.description || "",
      note: item.note || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setSelectedImage(null);
    setPreviewUrl(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      note: "",
    });
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!editingId && !selectedImage) {
        toast({ variant: "destructive", title: "Image is required" });
        return;
      }

      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      if (values.description) formData.append("description", values.description);
      formData.append("note", values.note);
      if (selectedImage) formData.append("image", selectedImage);
      
      if (editingId) {
        const { data } = await api.patch(`/admin/categories/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Category updated successfully" });
        setCategories(prev => prev.map((c: any) => c._id === editingId ? data.data : c));
      } else {
        const { data } = await api.post("/admin/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Category created successfully" });
        setCategories(prev => [...prev, data.data]);
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save category",
        description: error.response?.data?.error?.message || error.response?.data?.message || "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this category? All associated products will also be deleted.")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast({ title: "Category and associated products deleted." });
      fetchCategories();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to archive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">Categories</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage product categories.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6" onClick={handleCreateNew}>
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{editingId ? "Edit Category" : "Create New Category"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="note" render={({ field }) => (
                  <FormItem><FormLabel>Note (e.g. "Sacred living")</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="space-y-2">
                  <FormLabel>Category Image</FormLabel>
                  <div className="flex items-center gap-4">
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                  </div>
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="rounded-full px-8">
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingId ? "Save Changes" : "Create Category"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500">No categories found. Add your first category to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-800 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold w-16">Image</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Slug & Note</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c: any) => (
                <tr key={c._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <img src={c.image || 'https://via.placeholder.com/150'} alt={c.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200" />
                  </td>
                  <td className="p-4 font-medium text-slate-800">{c.name}</td>
                  <td className="p-4">
                    <div className="text-slate-500 text-xs font-mono">{c.slug}</div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">{c.note}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="text-slate-400 hover:text-primary hover:bg-primary/5">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCategory(c._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
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
