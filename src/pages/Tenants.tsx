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
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenants } from '@/hooks/useTenants';
import { toast } from '@/hooks/use-toast';

const Tenants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tenants, isLoading, addTenant, deleteTenant } = useTenants();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    preferredLocation: '', 
    budgetMax: '', 
    typeNeeded: 'Any' as string,
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

  const filteredTenants = tenants.filter((t) => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.preferred_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleAdd = () => {
    if (!formData.fullName || !formData.phone) {
      toast({ title: 'Missing Fields', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    addTenant.mutate({
      full_name: formData.fullName,
      phone: formData.phone,
      preferred_location: formData.preferredLocation || null,
      budget_max: parseInt(formData.budgetMax) || 0,
      type_needed: formData.typeNeeded,
      remarks: formData.remarks || null,
    });

    setIsFormOpen(false);
    setFormData({ fullName: '', phone: '', preferredLocation: '', budgetMax: '', typeNeeded: 'Any', remarks: '' });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Tenants" description="Manage rental seekers" icon={Users} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Tenants" description="Manage rental seekers" icon={Users} action={{ label: 'Add Tenant', onClick: () => setIsFormOpen(true), icon: Plus }} />
      <SearchFilterBar searchPlaceholder="Search tenants..." searchValue={searchQuery} onSearchChange={setSearchQuery} className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No tenants found
          </div>
        ) : (
          filteredTenants.map((tenant) => (
            <div key={tenant.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">{tenant.full_name}</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTenant.mutate(tenant.id)} 
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{tenant.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Prefers: {tenant.preferred_location || 'Any'}</div>
                <p className="font-medium text-primary">Budget: NPR {tenant.budget_max.toLocaleString()} • {tenant.type_needed}</p>
                {tenant.remarks && (
                  <p className="text-xs text-muted-foreground mt-2 italic">Remarks: {tenant.remarks}</p>
                )}
              </div>
            </div>
          ))
        )}
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
              <div><Label>Type Needed</Label><Select value={formData.typeNeeded} onValueChange={(v) => setFormData((p) => ({ ...p, typeNeeded: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Room">Room</SelectItem><SelectItem value="Flat">Flat</SelectItem><SelectItem value="Shutter">Shutter</SelectItem></SelectContent></Select></div>
            </div>
            <div>
              <Label>Remarks (Internal Notes)</Label>
              <Textarea 
                placeholder="Any internal notes about this tenant..." 
                value={formData.remarks} 
                onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={addTenant.isPending}>
                {addTenant.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Tenants;
