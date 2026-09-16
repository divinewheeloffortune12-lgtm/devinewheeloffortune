import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, UserX, Clock, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/users", {
        withCredentials: true
      });
      setUsers(data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: "Could not load user data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${id}/status`, { status: newStatus }, {
        withCredentials: true
      });
      toast({
        title: "Status updated",
        description: `User is now ${newStatus.replace('_', ' ')}.`
      });
      fetchUsers();
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

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">User Management</h2>
        <p className="text-slate-500 mt-1 text-sm">Manage registered customers and their access.</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No users found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-800 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Mobile</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const tempBlocked = isBlocked24h(user);
                return (
                  <tr key={user._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{user.name || "Not Filled"}</td>
                    <td className="p-4 text-slate-500">{user.email || "Not Filled"}</td>
                    <td className="p-4 text-slate-500">{user.mobile || "Not Filled"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        tempBlocked ? 'bg-orange-100 text-orange-700' :
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        user.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
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
                      
                      {user.status === 'active' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleStatus(user._id, 'blocked_24h')}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 font-medium text-xs h-8"
                          >
                            <Clock className="w-3 h-3 mr-1" /> 24h Block
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleStatus(user._id, 'blocked')}
                            className="text-red-600 border-red-200 hover:bg-red-50 font-medium text-xs h-8"
                          >
                            Block
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleStatus(user._id, 'active')}
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-medium text-xs h-8"
                        >
                          Unblock
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
