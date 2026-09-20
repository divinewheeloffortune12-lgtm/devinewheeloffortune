import { useState, useEffect } from "react";
import { Users, Package, ShoppingBag, ArrowUpRight, Loader2, TrendingUp, IndianRupee } from "lucide-react";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const DashboardHome = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const chartData = stats?.chartData || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif text-slate-800 font-semibold tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 mt-2 text-sm">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-50">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Total Users</p>
            <h3 className="text-4xl font-bold text-slate-800">{stats?.totals?.users || 0}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white text-purple-600 rounded-xl flex items-center justify-center shadow-sm border border-purple-50">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">Total Products</p>
            <h3 className="text-4xl font-bold text-slate-800">{stats?.totals?.products || 0}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white text-amber-600 rounded-xl flex items-center justify-center shadow-sm border border-amber-50">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-4xl font-bold text-slate-800">{stats?.totals?.sales || 0}</h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-50">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-4xl font-bold text-slate-800">₹{stats?.totals?.revenue?.toLocaleString("en-IN") || "0"}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-6">Revenue Overview (Last 6 Months)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">Recent Orders</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {stats?.recentSales?.map((order: any) => (
                <div key={order._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{order.user?.name || 'Guest User'}</p>
                    <p className="text-xs text-slate-500">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-700">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${
                      ['CANCELLED', 'REFUNDED'].includes(order.status) ? 'text-red-500' :
                      order.status === 'DELIVERED' ? 'text-emerald-500' :
                      order.status === 'SHIPPED' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {order.status?.replace('_', ' ') || order.paymentStatus}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentSales || stats.recentSales.length === 0) && (
                <p className="p-6 text-center text-sm text-slate-400">No recent orders.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
