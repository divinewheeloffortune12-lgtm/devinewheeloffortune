import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Trash2, ArchiveRestore } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const AdminDeleted = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeleted();
  }, []);

  const fetchDeleted = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/products/deleted/all", {
        withCredentials: true
      });
      setProducts(data.data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching deleted products",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    // Currently, backend does not have a restore endpoint, we would need to add one.
    // Assuming we patch isDeleted: false if we add one.
    toast({
      title: "Restore functionality to be implemented",
      description: "Backend requires an endpoint to un-delete products."
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">Deleted Products</h2>
        <p className="text-slate-500 mt-1 text-sm">View soft-deleted products.</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No deleted products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-800 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold w-16">Image</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Deleted By</th>
                <th className="p-4 font-semibold">Deleted Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{p.name}</td>
                  <td className="p-4">{p.deletedBy?.email || "Unknown"}</td>
                  <td className="p-4 text-slate-500">{new Date(p.deletedAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRestore(p._id)} className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Restore">
                      <ArchiveRestore className="w-4 h-4" />
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
