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

  const chartData = stats?.chartData || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif text-slate-800 font-semibold tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 mt-2 text-sm">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white/80 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-50 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Users</p>
            <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats?.totals?.users || 0}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white/80 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm border border-purple-50 group-hover:scale-110 transition-transform duration-500">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Products</p>
            <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats?.totals?.products || 0}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white/80 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm border border-amber-50 group-hover:scale-110 transition-transform duration-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Orders</p>
            <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats?.totals?.sales || 0}</h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="h-12 w-12 bg-white/80 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50 group-hover:scale-110 transition-transform duration-500">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Revenue</p>
            <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">₹{stats?.totals?.revenue?.toLocaleString("en-IN") || "0"}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-6 text-lg tracking-tight">Revenue Overview (Last 6 Months)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} dx={-15} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex-1 flex flex-col">
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/20">
              <h3 className="font-semibold text-slate-800 text-lg tracking-tight">Recent Orders</h3>
            </div>
            <div className="divide-y divide-white/40 flex-1 overflow-y-auto">
              {stats?.recentSales?.map((order: any) => (
                <div key={order._id} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors group cursor-default">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{order.user?.name || 'Guest User'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5 ${
                      ['CANCELLED', 'REFUNDED'].includes(order.status) ? 'text-rose-500' :
                      order.status === 'DELIVERED' ? 'text-emerald-500' :
                      order.status === 'SHIPPED' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {order.status?.replace('_', ' ') || order.paymentStatus}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentSales || stats.recentSales.length === 0) && (
                <p className="p-8 text-center text-sm text-slate-400 font-medium">No recent orders.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
