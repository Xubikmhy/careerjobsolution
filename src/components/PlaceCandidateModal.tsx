import { useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CandidateDB } from '@/hooks/useCandidates';
import { JobDB } from '@/hooks/useJobs';

interface Props {
  candidate: CandidateDB | null;
  jobs: JobDB[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    candidateId: string;
    jobId: string;
    placedAt: string;
    agreedSalary: number;
    remarks: string;
  }) => void;
  isPending?: boolean;
}

export function PlaceCandidateModal({ candidate, jobs, open, onOpenChange, onSubmit, isPending }: Props) {
  const [jobId, setJobId] = useState('');
  const [agreedSalary, setAgreedSalary] = useState('');
  const [remarks, setRemarks] = useState('');

  const openJobs = jobs.filter(j => j.status === 'Open' || j.status === 'Filled');
  const selectedJob = openJobs.find(j => j.id === jobId);

  const handleSubmit = () => {
    if (!candidate || !jobId || !agreedSalary) return;
    onSubmit({
      candidateId: candidate.id,
      jobId,
      placedAt: selectedJob ? `${selectedJob.company_name} - ${selectedJob.role_title}` : '',
      agreedSalary: parseFloat(agreedSalary),
      remarks,
    });
    setJobId('');
    setAgreedSalary('');
    setRemarks('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Place Candidate - {candidate?.full_name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Placed at which Job/Company? *</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {openJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.role_title} - {j.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedJob && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {selectedJob.location || selectedJob.employer_location}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Agreed Salary (NPR) *</Label>
            <Input
              type="number"
              placeholder="e.g., 20000"
              value={agreedSalary}
              onChange={(e) => setAgreedSalary(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Placement Remarks</Label>
            <Textarea
              placeholder="Terms agreed, start date, special conditions..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!jobId || !agreedSalary || isPending} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {isPending ? 'Placing...' : 'Confirm Placement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
