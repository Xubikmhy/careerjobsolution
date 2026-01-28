import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Plus, Trash2, Phone, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTenants } from '@/data/mockData';
import { Tenant } from '@/types';
import { toast } from '@/hooks/use-toast';

const Tenants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    preferredLocation: '', 
    budgetMax: '', 
    typeNeeded: 'Any' as Tenant['typeNeeded'],
    remarks: '',
  });

  // Auto-open form when action=add is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredTenants = tenants.filter((t) => t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || t.preferredLocation.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    if (!formData.fullName || !formData.phone) {
      toast({ title: 'Missing Fields', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    setTenants([{ 
      id: String(Date.now()), 
      ...formData, 
      budgetMax: parseInt(formData.budgetMax) || 0, 
      remarks: formData.remarks || undefined,
      createdAt: new Date() 
    }, ...tenants]);
    setIsFormOpen(false);
    setFormData({ fullName: '', phone: '', preferredLocation: '', budgetMax: '', typeNeeded: 'Any', remarks: '' });
    toast({ title: 'Tenant Added', description: 'Successfully added.' });
  };

  return (
    <DashboardLayout>
      <PageHeader title="Tenants" description="Manage rental seekers" icon={Users} action={{ label: 'Add Tenant', onClick: () => setIsFormOpen(true), icon: Plus }} />
      <SearchFilterBar searchPlaceholder="Search tenants..." searchValue={searchQuery} onSearchChange={setSearchQuery} className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.map((tenant) => (
          <div key={tenant.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground">{tenant.fullName}</h3>
              <Button variant="ghost" size="icon" onClick={() => setTenants(tenants.filter((t) => t.id !== tenant.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{tenant.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Prefers: {tenant.preferredLocation}</div>
              <p className="font-medium text-primary">Budget: NPR {tenant.budgetMax.toLocaleString()} • {tenant.typeNeeded}</p>
              {tenant.remarks && (
                <p className="text-xs text-muted-foreground mt-2 italic">Remarks: {tenant.remarks}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Tenant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name *</Label><Input value={formData.fullName} onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))} /></div>
            <div><Label>Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Preferred Location</Label><Input placeholder="e.g., Lakeside" value={formData.preferredLocation} onChange={(e) => setFormData((p) => ({ ...p, preferredLocation: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Max Budget (NPR)</Label><Input type="number" value={formData.budgetMax} onChange={(e) => setFormData((p) => ({ ...p, budgetMax: e.target.value }))} /></div>
              <div><Label>Type Needed</Label><Select value={formData.typeNeeded} onValueChange={(v) => setFormData((p) => ({ ...p, typeNeeded: v as Tenant['typeNeeded'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Room">Room</SelectItem><SelectItem value="Flat">Flat</SelectItem><SelectItem value="Shutter">Shutter</SelectItem></SelectContent></Select></div>
            </div>
            <div>
              <Label>Remarks (Internal Notes)</Label>
              <Textarea 
                placeholder="Any internal notes about this tenant..." 
                value={formData.remarks} 
                onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t"><Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button onClick={handleAdd}>Add</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Tenants;
