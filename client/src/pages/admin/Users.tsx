import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserX, Clock, Eye, Download, MoreVertical, Trash2, ShieldBan, ShieldAlert, CheckCircle, Receipt, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const AdminUsers = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedUserSales, setSelectedUserSales] = useState<any>(null);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users${debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ''}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const users = usersData || [];

  const toggleStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      toast({
        title: "Status updated",
        description: `User is now ${newStatus.replace('_', ' ')}.`
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not change user status."
      });
    }
  };

  const isBlocked24h = (user: any) => {
    if (user.status === 'blocked' && user.blockedUntil) {
      return new Date(user.blockedUntil) > new Date();
    }
    return false;
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast({ title: "User Deleted" });
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-users'] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "Could not delete user."
      });
    }
  };

  const fetchUserSales = async (user: any) => {
    setIsSalesLoading(true);
    setSelectedUserSales({ user, orders: [] }); // Set initially to show dialog loader
    try {
      const { data } = await api.get(`/admin/sales?user=${user._id}`);
      setSelectedUserSales({ user, orders: data.data || [] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch user purchases."
      });
      setSelectedUserSales(null);
    } finally {
      setIsSalesLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 border-b border-slate-200">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
        </div>
        <div className="bg-white/60 rounded-3xl border border-white/60 p-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage registered customers and their access.</p>
        </div>
        <Button 
          variant="outline"
          className="gap-2"
          onClick={() => {
            window.open(`${import.meta.env.VITE_API_URL}/admin/users/export?token=${localStorage.getItem('admin_token') || ''}`, '_blank');
          }}
        >
          <Download className="w-4 h-4" /> Download Users
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[18px] ${
              activeTab === "active"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Active / Blocked
          </button>
          <button
            onClick={() => setActiveTab("deleted")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[18px] ${
              activeTab === "deleted"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Deleted Users
          </button>
        </div>
        <div className="relative w-full sm:w-72 mt-2 sm:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search name, email, or number..." 
            className="pl-9 bg-white border-slate-200 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {users.filter(u => activeTab === "active" ? u.status !== 'deleted' : u.status === 'deleted').length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No users found.</p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead className="bg-white/40 text-slate-800 border-b border-white/40 backdrop-blur-md">
              <tr>
                <th className="p-5 font-bold uppercase tracking-widest text-[11px] text-slate-500">Name</th>
                <th className="p-5 font-bold uppercase tracking-widest text-[11px] text-slate-500">Email</th>
                <th className="p-5 font-bold uppercase tracking-widest text-[11px] text-slate-500">Mobile</th>
                <th className="p-5 font-bold uppercase tracking-widest text-[11px] text-slate-500">Status</th>
                <th className="p-5 font-bold uppercase tracking-widest text-[11px] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter((u: any) => activeTab === "active" ? u.status !== 'deleted' : u.status === 'deleted').map((user: any) => {
                const tempBlocked = isBlocked24h(user);
                return (
                  <tr key={user._id} className="border-b border-white/40 last:border-0 hover:bg-white/60 transition-colors">
                    <td className="p-5 font-semibold text-slate-800">{user.name || "Not Filled"}</td>
                    <td className="p-5 text-slate-600">{user.email || "Not Filled"}</td>
                    <td className="p-5 text-slate-600">{user.mobile || "Not Filled"}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ${
                        tempBlocked ? 'bg-orange-50 text-orange-600 ring-orange-500/20' :
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' : 
                        user.status === 'blocked' ? 'bg-rose-50 text-rose-600 ring-rose-500/20' : 'bg-slate-50 text-slate-600 ring-slate-500/20'
                      }`}>
                        {tempBlocked ? 'Blocked (24h)' : user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="text-slate-500 hover:text-primary hover:bg-primary/5"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchUserSales(user)}
                        className="text-slate-500 hover:text-primary hover:bg-primary/5"
                        title="View Purchases & Money Details"
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {user.status === 'active' ? (
                            <>
                              <DropdownMenuItem onClick={() => toggleStatus(user._id, 'blocked_24h')} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 cursor-pointer">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>24h Block</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(user._id, 'blocked')} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                <ShieldBan className="mr-2 h-4 w-4" />
                                <span>Block</span>
                              </DropdownMenuItem>
                            </>
                          ) : user.status !== 'deleted' ? (
                            <DropdownMenuItem onClick={() => toggleStatus(user._id, 'active')} className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Unblock</span>
                            </DropdownMenuItem>
                          ) : null}
                          
                          {user.status !== 'deleted' && (
                            <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer mt-1 border-t border-slate-100 pt-2">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-slate-800">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-4 text-sm">
              <div className="col-span-2 flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{selectedUser.name || "Not Filled"}</h3>
                  <p className="text-slate-500">{selectedUser.email || "Not Filled"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mobile</p>
                <p className="font-medium text-slate-700">{selectedUser.mobile || "Not Filled"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Auth Provider</p>
                <p className="font-medium text-slate-700 capitalize">{selectedUser.authProvider || "Not Filled"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <p className="font-medium text-slate-700 capitalize">
                  {isBlocked24h(selectedUser) ? 'Blocked (24h)' : selectedUser.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Joined On</p>
                <p className="font-medium text-slate-700">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "Not Filled"}
                </p>
              </div>
              
              <div className="col-span-2 mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address Information</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-slate-400">Address Line 1</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.addressLine1 || "Not Filled"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-slate-400">Address Line 2</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.addressLine2 || "Not Filled"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-slate-400">Landmark</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.landmark || "Not Filled"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">City</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.city || "Not Filled"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">State</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.state || "Not Filled"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Pincode</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.pincode || "Not Filled"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Country</p>
                    <p className="font-medium text-slate-700">{selectedUser.address?.country || "Not Filled"}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Details</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Email Verified</p>
                    <p className="font-medium text-slate-700">{selectedUser.emailVerified ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Role</p>
                    <p className="font-medium text-slate-700 capitalize">{selectedUser.role || "user"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Liked Products</p>
                    <p className="font-medium text-slate-700">{selectedUser.likedProducts?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Profile Updates</p>
                    <p className="font-medium text-slate-700">{selectedUser.profileUpdates?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Purchases Modal */}
      <Dialog open={!!selectedUserSales} onOpenChange={() => setSelectedUserSales(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-slate-800">
              Purchases - {selectedUserSales?.user?.name || "User"}
            </DialogTitle>
          </DialogHeader>
          
          {isSalesLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : selectedUserSales?.orders?.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No purchases found for this user.</div>
          ) : (
            <div className="space-y-4 py-4">
              {selectedUserSales?.orders?.map((order: any) => (
                <div key={order._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{order.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-slate-800">₹{order.totalAmount?.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {order.products?.map((p: any) => p.product?.name).join(', ') || 'Items'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
