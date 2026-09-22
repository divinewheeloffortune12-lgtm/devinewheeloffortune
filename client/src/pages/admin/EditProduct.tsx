import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useParams, useNavigate } from "react-router-dom";

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

export const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Images can be existing URLs from Cloudinary or new Files
  const [existingImages, setExistingImages] = useState<string[]>([]);
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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const catRes = await api.get("/admin/categories");
      setCategories(catRes.data.data);

      const prodRes = await api.get(`/admin/products/${id}`);
      const product = prodRes.data.data;
      
      form.reset({
        name: product.name,
        slug: product.slug,
        category: product.category?._id || "",
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        description: product.description || "",
        sizes: product.sizes?.join(", ") || "",
        tags: product.tags?.join(", ") || "",
        isFeatured: product.isFeatured || false,
        availability: product.availability !== false,
        isShippingRequired: product.isShippingRequired !== false,
        shippingType: product.shippingType || "standard",
        shippingCharge: product.shippingCharge || 0,
        freeShipping: product.freeShipping || false,
        estimatedDeliveryTime: product.estimatedDeliveryTime || "",
        weight: product.weight,
        dimensions_length: product.dimensions?.length,
        dimensions_width: product.dimensions?.width,
        dimensions_height: product.dimensions?.height,
      });

      if (product.images) {
        setExistingImages(product.images);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: error.response?.data?.message || "Please try again later."
      });
      navigate("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (existingImages.length === 0 && selectedFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Images Required",
          description: "Please provide at least one image."
        });
        return;
      }

      setIsSubmitting(true);
      
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Pass retained existing images
      formData.append("existingImages", JSON.stringify(existingImages));

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast({ title: "Product updated successfully" });
      navigate("/admin/products");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update product",
        description: error.response?.data?.error?.message || error.response?.data?.message || "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  if (isLoading) {
        return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-4 w-64 bg-slate-200 animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="bg-white/60 rounded-3xl border border-slate-100 p-6 space-y-4">
          <div className="h-12 w-full bg-slate-200 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-200 animate-pulse rounded"></div>
          <div className="h-16 w-full bg-slate-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-serif text-slate-900">Edit Product</h2>
          <p className="text-slate-500 mt-1">Update product details and shipping information.</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
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
          
          <div className="grid grid-cols-3 gap-6">
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
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          {/* Shipping Section */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
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

            <div className="grid grid-cols-3 gap-6 mb-4">
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

            <div className="grid grid-cols-4 gap-6">
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

          <div className="border-t border-slate-200 pt-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Availability</FormLabel>
                    <div className="text-[0.8rem] text-muted-foreground">Is this product available?</div>
                  </div>
                  <FormControl>
                    <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" checked={field.value} onChange={field.onChange} />
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
                    <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" checked={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
          </div>
          
          <div>
            <FormLabel className="mb-2 block">Product Images (Max 5)</FormLabel>
            <div className="mt-2 flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload new images</p>
                </div>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      const totalAllowed = 5 - existingImages.length;
                      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, totalAllowed));
                    }
                  }}
                />
              </label>

              <div className="grid grid-cols-5 gap-4">
                {existingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={url} alt="existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">Existing</div>
                  </div>
                ))}

                {selectedFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-amber-200 group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-[10px] text-center py-0.5">New</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {existingImages.length + selectedFiles.length} / 5 file(s) selected
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="button" variant="outline" className="mr-3" onClick={() => navigate("/admin/products")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
