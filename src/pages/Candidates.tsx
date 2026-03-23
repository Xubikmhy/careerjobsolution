import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Eye, Trash2, Plus, Send, RotateCcw, MessageSquare, CheckCircle2, History } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { CandidateFormModal } from '@/components/CandidateFormModal';
import { CandidateTimeline } from '@/components/CandidateTimeline';
import { SendForInterviewModal } from '@/components/SendForInterviewModal';
import { PlaceCandidateModal } from '@/components/PlaceCandidateModal';
import { FollowUpReminders } from '@/components/FollowUpReminders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useCandidates, CandidateDB } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { usePlacements } from '@/hooks/usePlacements';
import { useCandidateActivities } from '@/hooks/useCandidateActivities';
import { Candidate, FEES } from '@/types';
import { generateCandidateCV } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ──────────────────────────────────────────────
function groupBySkill(candidates: CandidateDB[]) {
  const groups: Record<string, CandidateDB[]> = {};
  candidates.forEach((c) => {
    const skills = c.skills?.length ? c.skills : ['Uncategorized'];
    const primary = skills[0];
    if (!groups[primary]) groups[primary] = [];
    groups[primary].push(c);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

// ── Candidate Table ─────────────────────────────────────
function CandidateTable({
  candidates,
  onView,
  onGenerateCV,
  onDelete,
  onSendInterview,
  onReturnInterview,
  onPlace,
  onViewTimeline,
}: {
  candidates: CandidateDB[];
  onView: (c: CandidateDB) => void;
  onGenerateCV: (c: CandidateDB) => void;
  onDelete: (id: string) => void;
  onSendInterview: (c: CandidateDB) => void;
  onReturnInterview: (c: CandidateDB) => void;
  onPlace: (c: CandidateDB) => void;
  onViewTimeline: (c: CandidateDB) => void;
}) {
  if (candidates.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No candidates found</p>;
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">Skills</TableHead>
            <TableHead className="hidden sm:table-cell">Exp</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{candidate.full_name}</p>
                  <p className="text-sm text-muted-foreground md:hidden">{candidate.address}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{candidate.address}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <SkillTagList skills={candidate.skills || []} max={3} />
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{candidate.experience_years} yrs</TableCell>
              <TableCell className="font-medium">NPR {candidate.expected_salary?.toLocaleString()}</TableCell>
              <TableCell>
                <StatusBadge status={candidate.status} variant={getStatusVariant(candidate.status)} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {candidate.created_at ? format(new Date(candidate.created_at), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {candidate.status === 'Active' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onSendInterview(candidate)} title="Send for Interview" className="text-warning hover:text-warning">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onPlace(candidate)} title="Place Candidate" className="text-success hover:text-success">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {candidate.status === 'Sent for Interview' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onReturnInterview(candidate)} title="Return from Interview" className="text-primary hover:text-primary">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onPlace(candidate)} title="Place Candidate" className="text-success hover:text-success">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => onViewTimeline(candidate)} title="View Timeline">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onView(candidate)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onGenerateCV(candidate)} title="Generate CV" className="text-primary hover:text-primary">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(candidate.id)} title="Delete" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────
const Candidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { candidates, isLoading, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const { jobs } = useJobs();
  const { addPlacement } = usePlacements();
  const { allActivities, pendingFollowUps, addActivity, updateActivity } = useCandidateActivities();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDB | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [groupBySkills, setGroupBySkills] = useState(false);

  // Interview modals
  const [interviewCandidate, setInterviewCandidate] = useState<CandidateDB | null>(null);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  // Return from interview
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [remarksCandidate, setRemarksCandidate] = useState<CandidateDB | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [returnAction, setReturnAction] = useState<'Active' | 'Placed'>('Active');

  // Placement modal
  const [placeCandidate, setPlaceCandidate] = useState<CandidateDB | null>(null);
  const [isPlaceOpen, setIsPlaceOpen] = useState(false);

  // Timeline modal
  const [timelineCandidate, setTimelineCandidate] = useState<CandidateDB | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Build job names map for timeline
  const jobNames = useMemo(() => {
    const map: Record<string, string> = {};
    jobs.forEach(j => { map[j.id] = `${j.role_title} - ${j.company_name}`; });
    return map;
  }, [jobs]);

  // Counts
  const statusCounts = useMemo(() => {
    const counts = { all: 0, Active: 0, 'Sent for Interview': 0, Placed: 0 };
    candidates.forEach((c) => {
      counts.all++;
      if (c.status in counts) counts[c.status as keyof typeof counts]++;
    });
    return counts;
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusTab === 'all' || c.status === statusTab;
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusTab]);

  const skillGroups = useMemo(() => groupBySkill(filteredCandidates), [filteredCandidates]);

  // Timeline activities for a specific candidate
  const timelineActivities = useMemo(() => {
    if (!timelineCandidate) return [];
    return allActivities
      .filter(a => a.candidate_id === timelineCandidate.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [allActivities, timelineCandidate]);

  const handleAddCandidate = (data: Omit<Candidate, 'id' | 'createdAt'>) => {
    addCandidate.mutate({
      full_name: data.fullName, phone: data.phone, address: data.address || null,
      skills: data.skills, experience_years: data.experienceYears,
      education_level: data.educationLevel || null, expected_salary: data.expectedSalary,
      cv_url: data.cvUrl || null, status: data.status,
      date_of_birth: data.dateOfBirth || null, nationality: data.nationality || null,
      marital_status: data.maritalStatus || null, languages: data.languages || [],
      career_objective: data.careerObjective || null, reference_info: data.references || null,
      remarks: data.remarks || null,
    }, {
      onSuccess: (newCandidate) => {
        // Log registration activity
        addActivity.mutate({
          candidate_id: newCandidate.id,
          job_id: null,
          activity_type: 'registered',
          status: 'Active',
          placed_at: null,
          remarks: 'Candidate registered in the system',
          follow_up_date: null,
          follow_up_done: false,
        });
      }
    });
    setIsFormOpen(false);
  };

  const handleGenerateCV = (candidate: CandidateDB) => {
    const candidateForPDF: Candidate = {
      id: candidate.id, fullName: candidate.full_name, phone: candidate.phone,
      address: candidate.address || '', skills: candidate.skills || [],
      experienceYears: candidate.experience_years, educationLevel: candidate.education_level || '',
      expectedSalary: candidate.expected_salary, cvUrl: candidate.cv_url || undefined,
      status: candidate.status as any, references: candidate.reference_info || undefined,
      remarks: candidate.remarks || undefined, createdAt: new Date(candidate.created_at),
      dateOfBirth: candidate.date_of_birth || undefined, nationality: candidate.nationality || undefined,
      maritalStatus: candidate.marital_status || undefined, languages: candidate.languages || [],
      careerObjective: candidate.career_objective || undefined,
    };
    generateCandidateCV(candidateForPDF);
    toast({ title: 'CV Generated', description: `CV for ${candidate.full_name} has been downloaded.` });
  };

  // Send for Interview with where/why
  const handleSendInterview = (candidate: CandidateDB) => {
    setInterviewCandidate(candidate);
    setIsInterviewOpen(true);
  };

  const handleSendInterviewSubmit = (data: { candidateId: string; jobId: string; placedAt: string; remarks: string }) => {
    // Update candidate status
    updateCandidate.mutate({ id: data.candidateId, status: 'Sent for Interview' });

    // Log activity with where and why
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 2); // 2-day follow-up reminder

    addActivity.mutate({
      candidate_id: data.candidateId,
      job_id: data.jobId,
      activity_type: 'sent_for_interview',
      status: 'Sent for Interview',
      placed_at: data.placedAt,
      remarks: data.remarks || `Sent to ${data.placedAt} for interview`,
      follow_up_date: followUp.toISOString().split('T')[0],
      follow_up_done: false,
    });

    setIsInterviewOpen(false);
    setInterviewCandidate(null);
  };

  // Return from Interview
  const handleReturnInterview = (candidate: CandidateDB) => {
    setRemarksCandidate(candidate);
    setRemarksText(candidate.remarks || '');
    setReturnAction('Active');
    setIsRemarksOpen(true);
  };

  const handleSubmitReturn = () => {
    if (!remarksCandidate) return;
    updateCandidate.mutate({
      id: remarksCandidate.id,
      status: returnAction,
      remarks: remarksText || null,
    });

    addActivity.mutate({
      candidate_id: remarksCandidate.id,
      job_id: null,
      activity_type: 'interview_returned',
      status: returnAction,
      placed_at: null,
      remarks: remarksText || 'Returned from interview',
      follow_up_date: null,
      follow_up_done: false,
    });

    setIsRemarksOpen(false);
    setRemarksCandidate(null);
    setRemarksText('');
  };

  // Place candidate with where/salary/remarks
  const handlePlace = (candidate: CandidateDB) => {
    setPlaceCandidate(candidate);
    setIsPlaceOpen(true);
  };

  const handlePlaceSubmit = (data: {
    candidateId: string;
    jobId: string;
    placedAt: string;
    agreedSalary: number;
    remarks: string;
  }) => {
    const job = jobs.find(j => j.id === data.jobId);
    const commission = Math.round(data.agreedSalary * (FEES.JOB_COMMISSION_PERCENT / 100));

    // Update candidate status
    updateCandidate.mutate({ id: data.candidateId, status: 'Placed' });

    // Create placement record
    addPlacement.mutate({
      candidate_id: data.candidateId,
      job_id: data.jobId,
      candidate_name: placeCandidate?.full_name || null,
      job_title: job?.role_title || null,
      employer_name: job?.company_name || null,
      placed_date: new Date().toISOString().split('T')[0],
      agreed_salary: data.agreedSalary,
      commission_amount: commission,
      commission_paid: false,
      notes: data.remarks || null,
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    // Log activity
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 2);

    addActivity.mutate({
      candidate_id: data.candidateId,
      job_id: data.jobId,
      activity_type: 'placed',
      status: 'Placed',
      placed_at: data.placedAt,
      remarks: data.remarks || `Placed at ${data.placedAt} with salary NPR ${data.agreedSalary.toLocaleString()}`,
      follow_up_date: followUp.toISOString().split('T')[0],
      follow_up_done: false,
    });

    setIsPlaceOpen(false);
    setPlaceCandidate(null);
  };

  const handleMarkFollowUpDone = (activityId: string) => {
    updateActivity.mutate({ id: activityId, follow_up_done: true });
  };

  const tableProps = {
    onView: (c: CandidateDB) => { setSelectedCandidate(c); setIsViewOpen(true); },
    onGenerateCV: handleGenerateCV,
    onDelete: (id: string) => deleteCandidate.mutate(id),
    onSendInterview: handleSendInterview,
    onReturnInterview: handleReturnInterview,
    onPlace: handlePlace,
    onViewTimeline: (c: CandidateDB) => { setTimelineCandidate(c); setIsTimelineOpen(true); },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Candidates" description="Manage job seekers and generate CVs" icon={Users} />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Candidates"
        description="Manage candidate lifecycle from registration to placement"
        icon={Users}
        action={{ label: 'Add Candidate', onClick: () => setIsFormOpen(true), icon: Plus }}
      />

      {/* Follow-up Reminders */}
      <FollowUpReminders
        followUps={pendingFollowUps}
        candidates={candidates}
        onMarkDone={handleMarkFollowUpDone}
      />

      {/* Status Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="Active">Active ({statusCounts.Active})</TabsTrigger>
          <TabsTrigger value="Sent for Interview">Interview ({statusCounts['Sent for Interview']})</TabsTrigger>
          <TabsTrigger value="Placed">Placed ({statusCounts.Placed})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-4 mb-4">
        <SearchFilterBar
          searchPlaceholder="Search by name, location, or skill..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[]}
          className="flex-1"
        />
        <Button
          variant={groupBySkills ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGroupBySkills(!groupBySkills)}
        >
          Group by Skill
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={statusTab + (groupBySkills ? '-grouped' : '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {groupBySkills ? (
            <div className="space-y-6">
              {skillGroups.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No candidates found</p>
              ) : (
                skillGroups.map(([skill, members]) => (
                  <div key={skill}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-sm">{skill}</Badge>
                      <span className="text-sm text-muted-foreground">({members.length})</span>
                    </div>
                    <CandidateTable candidates={members} {...tableProps} />
                  </div>
                ))
              )}
            </div>
          ) : (
            <CandidateTable candidates={filteredCandidates} {...tableProps} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Candidate Modal */}
      <CandidateFormModal open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleAddCandidate} />

      {/* Send for Interview Modal - with where/why */}
      <SendForInterviewModal
        candidate={interviewCandidate}
        jobs={jobs}
        open={isInterviewOpen}
        onOpenChange={setIsInterviewOpen}
        onSubmit={handleSendInterviewSubmit}
        isPending={updateCandidate.isPending}
      />

      {/* Place Candidate Modal - with where/salary/remarks */}
      <PlaceCandidateModal
        candidate={placeCandidate}
        jobs={jobs}
        open={isPlaceOpen}
        onOpenChange={setIsPlaceOpen}
        onSubmit={handlePlaceSubmit}
        isPending={updateCandidate.isPending}
      />

      {/* Return from Interview + Remarks Modal */}
      <Dialog open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Interview Return - {remarksCandidate?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Set Status After Return</Label>
              <div className="flex gap-2">
                <Button variant={returnAction === 'Active' ? 'default' : 'outline'} size="sm" onClick={() => setReturnAction('Active')}>
                  Back to Active
                </Button>
                <Button variant={returnAction === 'Placed' ? 'default' : 'outline'} size="sm" onClick={() => setReturnAction('Placed')}>
                  Mark as Placed
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Interview Remarks / Feedback</Label>
              <Textarea
                placeholder="How did the interview go? Any feedback from employer..."
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemarksOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReturn}>Save & Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Timeline Modal */}
      <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Lifecycle Timeline - {timelineCandidate?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {timelineCandidate && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                <StatusBadge status={timelineCandidate.status} variant={getStatusVariant(timelineCandidate.status)} />
                <span className="text-sm text-muted-foreground">
                  Registered: {timelineCandidate.created_at ? format(new Date(timelineCandidate.created_at), 'MMM d, yyyy') : '-'}
                </span>
              </div>
            )}
            <CandidateTimeline activities={timelineActivities} jobNames={jobNames} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Candidate Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedCandidate.full_name}</h3>
                  <p className="text-muted-foreground">{selectedCandidate.address}</p>
                </div>
                <StatusBadge status={selectedCandidate.status} variant={getStatusVariant(selectedCandidate.status)} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedCandidate.phone}</p></div>
                <div><p className="text-muted-foreground">Education</p><p className="font-medium">{selectedCandidate.education_level}</p></div>
                <div><p className="text-muted-foreground">Experience</p><p className="font-medium">{selectedCandidate.experience_years} years</p></div>
                <div><p className="text-muted-foreground">Expected Salary</p><p className="font-medium">NPR {selectedCandidate.expected_salary?.toLocaleString()}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Skills</p>
                <SkillTagList skills={selectedCandidate.skills || []} max={10} />
              </div>
              {selectedCandidate.remarks && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-1">Remarks / Interview Feedback</p>
                  <p className="text-foreground text-sm">{selectedCandidate.remarks}</p>
                </div>
              )}
              {selectedCandidate.reference_info && (
                <div><p className="text-muted-foreground text-sm mb-1">References</p><p className="text-foreground">{selectedCandidate.reference_info}</p></div>
              )}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button onClick={() => handleGenerateCV(selectedCandidate)} className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />Generate CV
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsViewOpen(false);
                  setTimelineCandidate(selectedCandidate);
                  setIsTimelineOpen(true);
                }} className="gap-2">
                  <History className="h-4 w-4" />Timeline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Candidates;
