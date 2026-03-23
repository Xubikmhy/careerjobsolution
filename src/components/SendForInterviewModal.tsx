import { useState } from 'react';
import { Send, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onSubmit: (data: { candidateId: string; jobId: string; placedAt: string; remarks: string }) => void;
  isPending?: boolean;
}

export function SendForInterviewModal({ candidate, jobs, open, onOpenChange, onSubmit, isPending }: Props) {
  const [jobId, setJobId] = useState('');
  const [remarks, setRemarks] = useState('');

  const openJobs = jobs.filter(j => j.status === 'Open');
  const selectedJob = openJobs.find(j => j.id === jobId);

  const handleSubmit = () => {
    if (!candidate || !jobId) return;
    onSubmit({
      candidateId: candidate.id,
      jobId,
      placedAt: selectedJob ? `${selectedJob.company_name} - ${selectedJob.role_title}` : '',
      remarks,
    });
    setJobId('');
    setRemarks('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-warning" />
            Send for Interview - {candidate?.full_name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Send to which Job/Company? *</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select job vacancy" />
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
                {selectedJob.location || selectedJob.employer_location} • NPR {selectedJob.salary_min.toLocaleString()} - {selectedJob.salary_max.toLocaleString()}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Remarks (why this candidate?)</Label>
            <Textarea
              placeholder="Why are you sending this candidate? Skills match, employer preference..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!jobId || isPending} className="gap-2">
            <Send className="h-4 w-4" />
            {isPending ? 'Sending...' : 'Send for Interview'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
