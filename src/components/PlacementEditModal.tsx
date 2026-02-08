import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PlacementDB } from '@/hooks/usePlacements';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface PlacementEditModalProps {
  placement: PlacementDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<PlacementDB> & { id: string }) => void;
  isPending: boolean;
}

export function PlacementEditModal({ placement, open, onOpenChange, onSave, isPending }: PlacementEditModalProps) {
  const [formData, setFormData] = useState({
    candidate_name: '',
    job_title: '',
    employer_name: '',
    agreed_salary: '',
    commission_amount: '',
    commission_paid: false,
    placed_date: '',
    follow_up_date: '',
    notes: '',
  });

  useEffect(() => {
    if (placement) {
      setFormData({
        candidate_name: placement.candidate_name || '',
        job_title: placement.job_title || '',
        employer_name: placement.employer_name || '',
        agreed_salary: String(placement.agreed_salary || 0),
        commission_amount: String(placement.commission_amount || 0),
        commission_paid: placement.commission_paid,
        placed_date: placement.placed_date || '',
        follow_up_date: placement.follow_up_date || '',
        notes: placement.notes || '',
      });
    }
  }, [placement]);

  const handleSave = () => {
    if (!placement) return;
    if (!formData.agreed_salary || !formData.commission_amount) {
      toast.error('Please fill in salary and commission fields');
      return;
    }

    onSave({
      id: placement.id,
      candidate_name: formData.candidate_name || null,
      job_title: formData.job_title || null,
      employer_name: formData.employer_name || null,
      agreed_salary: parseFloat(formData.agreed_salary),
      commission_amount: parseFloat(formData.commission_amount),
      commission_paid: formData.commission_paid,
      placed_date: formData.placed_date,
      follow_up_date: formData.follow_up_date || null,
      notes: formData.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Placement</DialogTitle>
        </DialogHeader>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Candidate Name</Label>
                <Input
                  value={formData.candidate_name}
                  onChange={(e) => setFormData(p => ({ ...p, candidate_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Employer</Label>
                <Input
                  value={formData.employer_name}
                  onChange={(e) => setFormData(p => ({ ...p, employer_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData(p => ({ ...p, job_title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agreed Salary (NPR)</Label>
                <Input
                  type="number"
                  value={formData.agreed_salary}
                  onChange={(e) => setFormData(p => ({ ...p, agreed_salary: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Commission (NPR)</Label>
                <Input
                  type="number"
                  value={formData.commission_amount}
                  onChange={(e) => setFormData(p => ({ ...p, commission_amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placed Date</Label>
                <Input
                  type="date"
                  value={formData.placed_date}
                  onChange={(e) => setFormData(p => ({ ...p, placed_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData(p => ({ ...p, follow_up_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="commission-paid" className="cursor-pointer">Commission Paid</Label>
              <Switch
                id="commission-paid"
                checked={formData.commission_paid}
                onCheckedChange={(checked) => setFormData(p => ({ ...p, commission_paid: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
