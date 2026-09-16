import { useEffect, useState } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { 
  LogOut, 
  LayoutDashboard, 
  Loader2, 
  Users, 
  Package, 
  Flag, 
  Megaphone, 
  Trash2, 
  LineChart,
  Grid,
  Menu,
  Clock,
  UserRound
} from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdminSession = async () => {
      try {
        const { data } = await api.get("/auth/admin/me");
        setAdminData(data.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please login to access the admin panel.",
        });
        navigate("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminSession();
  }, [navigate, toast]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/admin/logout");
      localStorage.removeItem("admin_token");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} transition-all duration-300 ease-in-out bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 relative z-20 overflow-hidden`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between min-w-[256px]">
          <div>
            <h2 className="text-white font-serif text-xl">Divine Wheel</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Admin Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-w-[256px]">
          <NavLink to="/admin" end className={getNavLinkClass}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={getNavLinkClass}>
            <Users className="w-5 h-5" />
            Users
          </NavLink>
          <NavLink to="/admin/products" className={getNavLinkClass}>
            <Package className="w-5 h-5" />
            Products
          </NavLink>
          <NavLink to="/admin/categories" className={getNavLinkClass}>
            <Grid className="w-5 h-5" />
            Categories
          </NavLink>
          <NavLink to="/admin/reports" className={getNavLinkClass}>
            <Flag className="w-5 h-5" />
            Reports
          </NavLink>
          <NavLink to="/admin/announcements" className={getNavLinkClass}>
            <Megaphone className="w-5 h-5" />
            Announcements
          </NavLink>
          <NavLink to="/admin/sales" className={getNavLinkClass}>
            <LineChart className="w-5 h-5" />
            Sales
          </NavLink>
          <NavLink to="/admin/service-bookings" className={getNavLinkClass}>
            <Clock className="w-5 h-5" />
            Bookings
          </NavLink>
          <NavLink to="/admin/deleted" className={getNavLinkClass}>
            <Trash2 className="w-5 h-5" />
            Last Deleted
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 min-w-[256px]">
          <div className="mb-4 px-4">
            <p className="text-xs text-slate-500">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{adminData?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen w-full relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600">
                  <UserRound className="w-4 h-4" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-700 leading-none">Admin</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Super User</p>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
