import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, Trash2, Edit2, MapPin, Search, UserPlus, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SkillTagList } from '@/components/SkillTag';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useVisitors, VisitorDB } from '@/hooks/useVisitors';
import { useCandidates } from '@/hooks/useCandidates';
import { useCandidateActivities } from '@/hooks/useCandidateActivities';
import { exportToCSV } from '@/utils/exportData';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Visitors = () => {
  const { visitors, isLoading, addVisitor, updateVisitor, deleteVisitor } = useVisitors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<VisitorDB | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [remarks, setRemarks] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return visitors;
    const q = searchQuery.toLowerCase();
    return visitors.filter(v =>
      v.full_name.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      (v.address?.toLowerCase().includes(q)) ||
      (v.skills || []).some(s => s.toLowerCase().includes(q)) ||
      (v.preferred_work_location?.toLowerCase().includes(q))
    );
  }, [visitors, searchQuery]);

  const resetForm = () => {
    setFullName(''); setPhone(''); setAddress('');
    setSkills(''); setPreferredLocation(''); setRemarks('');
    setEditingVisitor(null);
  };

  const openAdd = () => { resetForm(); setIsFormOpen(true); };

  const openEdit = (v: VisitorDB) => {
    setEditingVisitor(v);
    setFullName(v.full_name);
    setPhone(v.phone);
    setAddress(v.address || '');
    setSkills((v.skills || []).join(', '));
    setPreferredLocation(v.preferred_work_location || '');
    setRemarks(v.remarks || '');
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!fullName || !phone) return;
    const payload = {
      full_name: fullName,
      phone,
      address: address || null,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      preferred_work_location: preferredLocation || null,
      remarks: remarks || null,
    };

    if (editingVisitor) {
      updateVisitor.mutate({ id: editingVisitor.id, ...payload });
    } else {
      addVisitor.mutate(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Visitors" description="Walk-in visitor registry" icon={UserCheck} />
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Visitors"
        description="Register walk-in visitors with their details and job preferences"
        icon={UserCheck}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, skills, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Visitor
        </Button>
      </div>

      <div className="mb-4">
        <Badge variant="secondary" className="text-sm">
          {filtered.length} visitor{filtered.length !== 1 ? 's' : ''} registered
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No visitors yet</p>
          <p className="text-sm">Add walk-in visitors to keep track of everyone</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden lg:table-cell">Skills</TableHead>
                <TableHead className="hidden md:table-cell">Wants to Work</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v.id} className="hover:bg-muted/50">
                  <TableCell>
                    <p className="font-medium">{v.full_name}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">{v.phone}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{v.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{v.address || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <SkillTagList skills={v.skills || []} max={3} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {v.preferred_work_location ? (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {v.preferred_work_location}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {v.created_at ? format(new Date(v.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteVisitor.mutate(v.id)} title="Delete" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVisitor ? 'Edit Visitor' : 'Add Visitor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Visitor's full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contact number" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Home address" />
            </div>
            <div className="space-y-2">
              <Label>Skills (comma separated)</Label>
              <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Cooking, Driving, Cleaning..." />
            </div>
            <div className="space-y-2">
              <Label>Where do they want to work?</Label>
              <Input value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} placeholder="Pokhara, Kathmandu, Abroad..." />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any notes about this visitor..." className="min-h-[60px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!fullName || !phone}>
              {editingVisitor ? 'Update' : 'Add Visitor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Visitors;
