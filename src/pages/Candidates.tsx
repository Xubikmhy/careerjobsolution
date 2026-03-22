import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Eye, Trash2, Plus, Send, RotateCcw, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { CandidateFormModal } from '@/components/CandidateFormModal';
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
import { Candidate } from '@/types';
import { generateCandidateCV } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ──────────────────────────────────────────────
function groupBySkill(candidates: CandidateDB[]) {
  const groups: Record<string, CandidateDB[]> = {};
  candidates.forEach((c) => {
    const skills = c.skills?.length ? c.skills : ['Uncategorized'];
    // Use first skill as primary group
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
}: {
  candidates: CandidateDB[];
  onView: (c: CandidateDB) => void;
  onGenerateCV: (c: CandidateDB) => void;
  onDelete: (id: string) => void;
  onSendInterview: (c: CandidateDB) => void;
  onReturnInterview: (c: CandidateDB) => void;
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
                    <Button variant="ghost" size="icon" onClick={() => onSendInterview(candidate)} title="Send for Interview" className="text-warning hover:text-warning">
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  {candidate.status === 'Sent for Interview' && (
                    <Button variant="ghost" size="icon" onClick={() => onReturnInterview(candidate)} title="Return from Interview" className="text-primary hover:text-primary">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDB | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [remarksCandidate, setRemarksCandidate] = useState<CandidateDB | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [returnAction, setReturnAction] = useState<'Active' | 'Placed'>('Active');
  const [groupBySkills, setGroupBySkills] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  const handleSendInterview = (candidate: CandidateDB) => {
    updateCandidate.mutate({ id: candidate.id, status: 'Sent for Interview' });
  };

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
    setIsRemarksOpen(false);
    setRemarksCandidate(null);
    setRemarksText('');
  };

  const tableProps = {
    onView: (c: CandidateDB) => { setSelectedCandidate(c); setIsViewOpen(true); },
    onGenerateCV: handleGenerateCV,
    onDelete: (id: string) => deleteCandidate.mutate(id),
    onSendInterview: handleSendInterview,
    onReturnInterview: handleReturnInterview,
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
        description="Manage job seekers and generate CVs"
        icon={Users}
        action={{ label: 'Add Candidate', onClick: () => setIsFormOpen(true), icon: Plus }}
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
                  <FileText className="h-4 w-4" /> Generate CV
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
