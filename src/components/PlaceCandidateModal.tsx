import { useEffect, useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { JobCombobox } from '@/components/JobCombobox';
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

  // Prefill agreed salary from the candidate's expected salary, or fall back
  // to the midpoint of the selected job's range — saves staff re-typing.
  useEffect(() => {
    if (!open) return;
    if (agreedSalary) return;
    if (candidate?.expected_salary) {
      setAgreedSalary(String(candidate.expected_salary));
    } else if (selectedJob) {
      const mid = Math.round(((selectedJob.salary_min || 0) + (selectedJob.salary_max || 0)) / 2);
      if (mid) setAgreedSalary(String(mid));
    }
  }, [open, candidate, selectedJob, agreedSalary]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setJobId('');
      setAgreedSalary('');
      setRemarks('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!candidate || !jobId || !agreedSalary) return;
    onSubmit({
      candidateId: candidate.id,
      jobId,
      placedAt: selectedJob ? `${selectedJob.company_name} - ${selectedJob.role_title}` : '',
      agreedSalary: parseFloat(agreedSalary),
      remarks,
    });
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
            <Label>Placed at — search company / role *</Label>
            <JobCombobox
              jobs={openJobs}
              value={jobId}
              onChange={setJobId}
              placeholder="Type to search placement..."
              statuses={['Open', 'Filled']}
            />
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

