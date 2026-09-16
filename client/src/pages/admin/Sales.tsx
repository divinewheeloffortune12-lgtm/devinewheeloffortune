import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Receipt, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/sales", {
        withCredentials: true
      });
      setSales(data.data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching sales",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">Sales & Orders</h2>
        <p className="text-slate-500 mt-1 text-sm">View transaction history and order details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-3xl font-semibold text-slate-800">{sales.length}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Revenue</p>
            <h3 className="text-3xl font-semibold text-slate-800">
              ₹{sales.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0).toLocaleString()}
            </h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500">No sales records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-800 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s: any) => (
                <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">#{s._id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">{s.user?.name || "Unknown"}</td>
                  <td className="p-4 font-medium text-slate-800">₹{s.totalAmount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      s.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {s.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
