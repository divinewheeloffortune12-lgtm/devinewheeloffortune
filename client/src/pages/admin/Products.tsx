import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Image as ImageIcon, Eye, EyeOff, Edit } from "lucide-react";
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
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(1),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100).default(0),
  stock: z.coerce.number().min(0),
  description: z.string().optional(),
  sizes: z.string().optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean().default(false),
  availability: z.boolean().default(true),
  isShippingRequired: z.boolean().default(true),
  shippingType: z.string().default("standard"),
  shippingCharge: z.coerce.number().min(0).default(0),
  freeShipping: z.boolean().default(false),
  estimatedDeliveryTime: z.string().optional(),
  weight: z.coerce.number().optional(),
  dimensions_length: z.coerce.number().optional(),
  dimensions_width: z.coerce.number().optional(),
  dimensions_height: z.coerce.number().optional(),
});

import { useNavigate } from "react-router-dom";

export const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      price: 0,
      discount: 0,
      stock: 0,
      description: "",
      sizes: "",
      tags: "",
      isFeatured: false,
      availability: true,
      isShippingRequired: true,
      shippingType: "standard",
      shippingCharge: 0,
      freeShipping: false,
      estimatedDeliveryTime: "",
    },
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/admin/products");
      setProducts(data.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching products",
        description: error.response?.data?.message || "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching categories",
        description: error.response?.data?.message || "Please try again later."
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });
      
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast({ title: "Product created successfully" });
      setIsDialogOpen(false);
      form.reset();
      setSelectedFiles([]);
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create product",
        description: error.response?.data?.error?.message || error.response?.data?.message || "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Failed to delete product",
        description: error.response?.data?.message || "Please try again."
      });
    }
  };

  const toggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      const intendedState = !currentAvailability;
      const response = await api.patch(`/admin/products/${id}/availability`, { availability: intendedState });
      
      // Update local state using the authoritative server response
      if (response.data?.success && response.data?.data) {
        setProducts(prevProducts => prevProducts.map((p: any) => 
          p._id === id ? { ...p, availability: response.data.data.availability } : p
        ));
      }
      
      toast({ title: "Product visibility updated" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Update failed",
        description: error.response?.data?.message || "Please try again."
      });
      // Fallback fetch in case of failure to ensure UI consistency
      fetchProducts();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-slate-900">Products</h2>
          <p className="text-slate-500 mt-1">Manage inventory and product details.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                          <option value="">Select a category</option>
                          {categories.map((c: any) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sizes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes (comma separated)</FormLabel>
                      <FormControl><Input placeholder="e.g. S, M, L, XL" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="discount" render={({ field }) => (
                    <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl><Input placeholder="e.g. healing, new, trending" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                {/* Shipping Section */}
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Shipping Information</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <FormField control={form.control} name="isShippingRequired" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requires Shipping</FormLabel>
                          <div className="text-[0.8rem] text-muted-foreground">Does this need physical delivery?</div>
                        </div>
                        <FormControl>
                          <input type="checkbox" className="w-5 h-5 accent-primary" checked={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="freeShipping" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Free Shipping</FormLabel>
                          <div className="text-[0.8rem] text-muted-foreground">Override shipping charges?</div>
                        </div>
                        <FormControl>
                          <input type="checkbox" className="w-5 h-5 accent-primary" checked={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <FormField control={form.control} name="shippingType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Type</FormLabel>
                        <FormControl>
                          <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                            <option value="standard">Standard</option>
                            <option value="express">Express</option>
                            <option value="digital">Digital (No shipping)</option>
                            <option value="pickup">Local Pickup</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="shippingCharge" render={({ field }) => (
                      <FormItem><FormLabel>Shipping Charge (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="estimatedDeliveryTime" render={({ field }) => (
                      <FormItem><FormLabel>Est. Delivery Time</FormLabel><FormControl><Input placeholder="e.g. 3-5 days" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                     <FormField control={form.control} name="weight" render={({ field }) => (
                      <FormItem><FormLabel>Weight (g)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dimensions_length" render={({ field }) => (
                      <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dimensions_width" render={({ field }) => (
                      <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dimensions_height" render={({ field }) => (
                      <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-6 grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="availability" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Availability</FormLabel>
                        <div className="text-[0.8rem] text-muted-foreground">Is this product available?</div>
                      </div>
                      <FormControl>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-primary cursor-pointer"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <div className="text-[0.8rem] text-muted-foreground">Highlight on homepage?</div>
                      </div>
                      <FormControl>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-primary cursor-pointer"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <div className="text-[0.8rem] text-muted-foreground">Highlight on homepage?</div>
                      </div>
                      <FormControl>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-primary cursor-pointer"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                
                <div>
                  <FormLabel className="mb-2 block">Product Images (up to 5)</FormLabel>
                  <div className="mt-2 flex flex-col gap-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Click to upload images</p>
                        <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF</p>
                      </div>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
                          }
                        }}
                      />
                    </label>

                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-5 gap-4">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="preview" 
                              className="w-full h-full object-cover"
                            />
                            <button 
                              type="button"
                              onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {selectedFiles.length} / 5 file(s) selected
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Product
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200 shadow-sm">
          <p className="text-slate-500">No products found. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="p-4 font-medium w-16">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-900">{p.name}</td>
                  <td className="p-4">{p.category?.name || "Uncategorized"}</td>
                  <td className="p-4">
                    <div>₹{p.price}</div>
                    {p.discount > 0 && <div className="text-xs text-green-600 font-medium">{p.discount}% OFF</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleAvailability(p._id, p.availability !== false)} 
                      className={p.availability === false ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:text-primary hover:bg-primary/5"}
                      title={p.availability === false ? "Hidden from website - Click to show" : "Visible on website - Click to hide"}
                    >
                      {p.availability === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/products/${p._id}/edit`)} className="text-slate-400 hover:text-primary hover:bg-primary/5">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProduct(p._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
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
