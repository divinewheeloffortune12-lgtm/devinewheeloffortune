import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle, ExternalLink, Mail, Phone, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const AdminReports = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/admin/feedback");
      setMessages(data.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching reports" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/feedback/${id}`, { status });
      toast({ title: `Marked as ${status}` });
      fetchMessages();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update status" });
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this report?")) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      toast({ title: "Report deleted successfully" });
      if (selectedMessage?._id === id) setIsDialogOpen(false);
      fetchMessages();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const handleView = (msg: any) => {
    if (msg.status === 'new') {
      updateStatus(msg._id, 'read');
      msg.status = 'read';
    }
    setSelectedMessage(msg);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-slate-800 font-medium tracking-tight">User Reports & Messages</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage contact form submissions and user feedback.</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500">No reports or messages found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-800 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m: any) => (
                <tr key={m._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleView(m)}>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{m.subject}</td>
                  <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      m.status === 'read' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {m.status !== 'resolved' && (
                      <Button variant="ghost" size="icon" onClick={() => updateStatus(m._id, 'resolved')} className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" title="Mark as resolved">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteMessage(m._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete message">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mt-4">
                  <DialogTitle className="font-serif text-2xl text-slate-800">{selectedMessage.subject}</DialogTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedMessage.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      selectedMessage.status === 'read' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Sender Details Card */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sender Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{selectedMessage.name}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Mail className="w-3 h-3" /> <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary transition-colors">{selectedMessage.email}</a>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Phone className="w-3 h-3" /> <a href={`tel:${selectedMessage.phone}`} className="hover:text-primary transition-colors">{selectedMessage.phone}</a>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between items-end">
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {new Date(selectedMessage.createdAt).toLocaleString()}
                      </div>
                      <Link to={`/admin/users?search=${encodeURIComponent(selectedMessage.email)}`}>
                        <Button variant="outline" size="sm" className="mt-4 gap-2 text-xs h-8">
                          See User Profile <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Message Content</h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => updateStatus(selectedMessage._id, 'resolved')} disabled={selectedMessage.status === 'resolved'}>
                    <CheckCircle className="w-4 h-4" /> {selectedMessage.status === 'resolved' ? 'Resolved' : 'Mark as Resolved'}
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-2" onClick={() => deleteMessage(selectedMessage._id)}>
                    <Trash2 className="w-4 h-4" /> Delete Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
