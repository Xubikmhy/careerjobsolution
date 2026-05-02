import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Eye, Trash2, Plus, Send, RotateCcw, MessageSquare, CheckCircle2, History, Download, Archive, RefreshCw, X, Copy, Check, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatNPR } from '@/lib/utils';
import { CandidateQuickView } from '@/components/CandidateQuickView';
import { WhatsAppTemplatesMenu } from '@/components/WhatsAppTemplatesMenu';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { CandidateFormModal } from '@/components/CandidateFormModal';
import { CandidateDetailDrawer } from '@/components/CandidateDetailDrawer';
import { SendForInterviewModal } from '@/components/SendForInterviewModal';
import { PlaceCandidateModal } from '@/components/PlaceCandidateModal';

import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { exportToCSV } from '@/utils/exportData';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = ['Active', 'Sent for Interview', 'Placed', 'Inactive'] as const;


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
  selected,
  lastContactMap,
  contactedTodaySet,
  onToggleOne,
  onToggleAll,
  onView,
  onQuickView,
  onGenerateCV,
  onDelete,
  onSendInterview,
  onReturnInterview,
  onPlace,
  onViewTimeline,
  onToggleInactive,
  onInlineStatusChange,
  onCopyPhone,
  onToggleContacted,
  copiedId,
}: {
  candidates: CandidateDB[];
  selected: Set<string>;
  lastContactMap: Record<string, Date | undefined>;
  contactedTodaySet: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[], allSelected: boolean) => void;
  onView: (c: CandidateDB) => void;
  onQuickView: (c: CandidateDB) => void;
  onGenerateCV: (c: CandidateDB) => void;
  onDelete: (id: string) => void;
  onSendInterview: (c: CandidateDB) => void;
  onReturnInterview: (c: CandidateDB) => void;
  onPlace: (c: CandidateDB) => void;
  onViewTimeline: (c: CandidateDB) => void;
  onToggleInactive: (c: CandidateDB) => void;
  onInlineStatusChange: (c: CandidateDB, newStatus: string) => void;
  onCopyPhone: (c: CandidateDB) => void;
  onToggleContacted: (c: CandidateDB) => void;
  copiedId: string | null;
}) {
  if (candidates.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No candidates found</p>;
  }

  const allIds = candidates.map((c) => c.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = allIds.some((id) => selected.has(id));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={() => onToggleAll(allIds, allSelected)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Skills</TableHead>
            <TableHead className="hidden sm:table-cell">Exp</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Contacted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const lastContact = lastContactMap[candidate.id];
            const tooltipText = lastContact
              ? `Last contact: ${formatDistanceToNow(lastContact, { addSuffix: true })}`
              : 'No contact logged yet';
            return (
            <TableRow key={candidate.id} className="hover:bg-muted/50" data-state={selected.has(candidate.id) ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={selected.has(candidate.id)}
                  onCheckedChange={() => onToggleOne(candidate.id)}
                  aria-label={`Select ${candidate.full_name}`}
                />
              </TableCell>
              <TableCell>
                <div>
                  <button
                    type="button"
                    onClick={() => onQuickView(candidate)}
                    className="font-medium text-foreground text-left hover:text-primary hover:underline transition-colors"
                  >
                    {candidate.full_name}
                  </button>
                  <p className="text-xs text-muted-foreground md:hidden truncate">{candidate.phone}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{candidate.phone}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); onCopyPhone(candidate); }}
                    title="Copy phone"
                  >
                    {copiedId === candidate.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <SkillTagList skills={candidate.skills || []} max={3} />
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{candidate.experience_years} yrs</TableCell>
              <TableCell className="font-medium">{formatNPR(candidate.expected_salary)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity hover:opacity-80"
                      title="Click to change status"
                    >
                      <StatusBadge
                        status={candidate.status}
                        variant={getStatusVariant(candidate.status)}
                        tooltip={tooltipText}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {STATUS_OPTIONS.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        disabled={s === candidate.status}
                        onClick={() => onInlineStatusChange(candidate, s)}
                      >
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                  <Checkbox
                    checked={contactedTodaySet.has(candidate.id)}
                    onCheckedChange={() => onToggleContacted(candidate)}
                    aria-label="Mark as contacted today"
                  />
                  <span>
                    {contactedTodaySet.has(candidate.id)
                      ? 'Today'
                      : lastContact
                        ? formatDistanceToNow(lastContact, { addSuffix: true })
                        : '—'}
                  </span>
                </label>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <WhatsAppTemplatesMenu phone={candidate.phone} name={candidate.full_name} />
                  {candidate.status === 'Active' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onSendInterview(candidate)} title="Send for Interview" className="text-warning hover:text-warning">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onPlace(candidate)} title="Place Candidate" className="text-success hover:text-success">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onToggleInactive(candidate)} title="Mark Inactive" className="text-muted-foreground hover:text-foreground">
                        <Archive className="h-4 w-4" />
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
                  {candidate.status === 'Inactive' && (
                    <Button variant="ghost" size="icon" onClick={() => onToggleInactive(candidate)} title="Reactivate" className="text-success hover:text-success">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────
const Candidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { candidates, isLoading, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const { jobs, updateJob } = useJobs();
  const { addPlacement, placements } = usePlacements();
  const { allActivities, addActivity } = useCandidateActivities();
  const { settings } = useAgencySettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDB | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [quickViewCandidate, setQuickViewCandidate] = useState<CandidateDB | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [groupBySkills, setGroupBySkills] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Last-contact + contacted-today maps from activities
  const { lastContactMap, contactedTodaySet } = useMemo(() => {
    const last: Record<string, Date> = {};
    const today = new Set<string>();
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    allActivities.forEach((a) => {
      if (!a.candidate_id) return;
      const at = new Date(a.created_at);
      const isContact = a.activity_type === 'contact' || a.activity_type === 'remark' || a.activity_type === 'sent_for_interview' || a.activity_type === 'placed';
      if (!isContact) return;
      if (!last[a.candidate_id] || at > last[a.candidate_id]) last[a.candidate_id] = at;
      if (a.activity_type === 'contact' && at >= startOfDay) today.add(a.candidate_id);
    });
    return { lastContactMap: last, contactedTodaySet: today };
  }, [allActivities]);

  const handleCopyPhone = async (c: CandidateDB) => {
    try {
      await navigator.clipboard.writeText(c.phone);
      setCopiedId(c.id);
      toast({ title: 'Copied', description: c.phone });
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      toast({ title: 'Copy failed', description: 'Clipboard not available', variant: 'destructive' });
    }
  };

  const handleToggleContacted = (c: CandidateDB) => {
    if (contactedTodaySet.has(c.id)) {
      toast({ title: 'Already logged', description: `${c.full_name} marked contacted today.` });
      return;
    }
    addActivity.mutate({
      candidate_id: c.id,
      job_id: null,
      activity_type: 'contact',
      status: c.status,
      placed_at: null,
      remarks: 'Marked as contacted',
      follow_up_date: null,
      follow_up_done: false,
    });
  };

  const handleShareSelectedToWhatsApp = () => {
    const list = candidates.filter((c) => selected.has(c.id));
    if (list.length === 0) return;
    const capped = list.slice(0, 30);
    if (list.length > 30) {
      toast({ title: 'Sharing first 30', description: `Selected ${list.length}, WhatsApp text limit applied.` });
    }
    const agency = settings?.agency_name || 'Career Job Solution';
    const dateStr = format(new Date(), 'MMM d, yyyy');
    const lines = capped.map((c, i) => {
      const skill = c.skills?.[0] || '—';
      return `${i + 1}. ${c.full_name} — ${skill} — ${c.experience_years}y — ${formatNPR(c.expected_salary)} — ${c.phone}`;
    });
    const text = `*Available Candidates — ${dateStr}*\n${lines.join('\n')}\n\n— ${agency}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = (ids: string[], allSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const handleInlineStatusChange = (c: CandidateDB, newStatus: string) => {
    updateCandidate.mutate({ id: c.id, status: newStatus });
    addActivity.mutate({
      candidate_id: c.id,
      job_id: null,
      activity_type: 'remark',
      status: newStatus,
      placed_at: null,
      remarks: `Status changed inline: ${c.status} → ${newStatus}`,
      follow_up_date: null,
      follow_up_done: false,
    });
  };

  const handleBulkStatus = (newStatus: string) => {
    selected.forEach((id) => {
      updateCandidate.mutate({ id, status: newStatus });
    });
    toast({ title: 'Bulk update', description: `Updated ${selected.size} candidate(s) → ${newStatus}` });
    clearSelection();
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.size} candidate(s)? This cannot be undone.`)) return;
    selected.forEach((id) => deleteCandidate.mutate(id));
    clearSelection();
  };

  // Interview modals
  const [interviewCandidate, setInterviewCandidate] = useState<CandidateDB | null>(null);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  // Return from interview
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [remarksCandidate, setRemarksCandidate] = useState<CandidateDB | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [notHiredReason, setNotHiredReason] = useState('');
  const [returnAction, setReturnAction] = useState<'Active' | 'Placed' | 'Not Hired'>('Active');

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
    const counts = { all: 0, Active: 0, 'Sent for Interview': 0, Placed: 0, Inactive: 0 };
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

  // Timeline activities for whichever candidate is open in the drawer
  const activeDrawerCandidate = timelineCandidate || selectedCandidate;
  const timelineActivities = useMemo(() => {
    if (!activeDrawerCandidate) return [];
    return allActivities
      .filter(a => a.candidate_id === activeDrawerCandidate.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [allActivities, activeDrawerCandidate]);

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
        // Day+1 follow-up: call new candidate to confirm details / discuss next steps
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        addActivity.mutate({
          candidate_id: newCandidate.id,
          job_id: null,
          activity_type: 'registered',
          status: 'Active',
          placed_at: null,
          remarks: 'Candidate registered. Follow up tomorrow to confirm details & discuss matching jobs.',
          follow_up_date: nextDay.toISOString().split('T')[0],
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

    // Log activity with where and why — Day+1 reminder to chase interview result
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 1);

    addActivity.mutate({
      candidate_id: data.candidateId,
      job_id: data.jobId,
      activity_type: 'sent_for_interview',
      status: 'Sent for Interview',
      placed_at: data.placedAt,
      remarks: data.remarks
        ? `Sent to ${data.placedAt}. ${data.remarks}`
        : `Sent to ${data.placedAt} for interview. Chase result tomorrow.`,
      follow_up_date: followUp.toISOString().split('T')[0],
      follow_up_done: false,
    });

    setIsInterviewOpen(false);
    setInterviewCandidate(null);
  };

  // Return from Interview
  const handleReturnInterview = (candidate: CandidateDB) => {
    setRemarksCandidate(candidate);
    setRemarksText('');
    setNotHiredReason('');
    setReturnAction('Active');
    setIsRemarksOpen(true);
  };

  const handleSubmitReturn = () => {
    if (!remarksCandidate) return;
    const finalStatus = returnAction === 'Not Hired' ? 'Active' : returnAction;
    const fullRemarks = returnAction === 'Not Hired'
      ? `NOT HIRED - Reason: ${notHiredReason || 'No reason given'}. ${remarksText || ''}`.trim()
      : remarksText || 'Returned from interview';

    updateCandidate.mutate({
      id: remarksCandidate.id,
      status: finalStatus,
      remarks: fullRemarks,
    });

    // Day+3 re-engagement follow-up only when "Not Hired" — otherwise no auto reminder
    let returnFollowUp: string | null = null;
    if (returnAction === 'Not Hired') {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      returnFollowUp = d.toISOString().split('T')[0];
    }

    addActivity.mutate({
      candidate_id: remarksCandidate.id,
      job_id: null,
      activity_type: returnAction === 'Not Hired' ? 'not_hired' : 'interview_returned',
      status: finalStatus,
      placed_at: null,
      remarks: returnAction === 'Not Hired'
        ? `${fullRemarks} — Re-engage in 3 days, find a new vacancy.`
        : fullRemarks,
      follow_up_date: returnFollowUp,
      follow_up_done: false,
    });

    setIsRemarksOpen(false);
    setRemarksCandidate(null);
    setRemarksText('');
    setNotHiredReason('');
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

    // Mark job as Filled so it disappears from open listings
    updateJob.mutate({ id: data.jobId, status: 'Filled' });

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


  const handleToggleInactive = (c: CandidateDB) => {
    const newStatus = c.status === 'Inactive' ? 'Active' : 'Inactive';
    updateCandidate.mutate({ id: c.id, status: newStatus });
    addActivity.mutate({
      candidate_id: c.id,
      job_id: null,
      activity_type: 'remark',
      status: newStatus,
      placed_at: null,
      remarks: newStatus === 'Inactive'
        ? 'Marked Inactive — no longer actively job-seeking.'
        : 'Reactivated — back in the active pool.',
      follow_up_date: null,
      follow_up_done: false,
    });
  };

  const tableProps = {
    selected,
    lastContactMap,
    contactedTodaySet,
    copiedId,
    onToggleOne: toggleOne,
    onToggleAll: toggleAll,
    onView: (c: CandidateDB) => { setSelectedCandidate(c); setIsViewOpen(true); },
    onQuickView: (c: CandidateDB) => { setQuickViewCandidate(c); setIsQuickViewOpen(true); },
    onGenerateCV: handleGenerateCV,
    onDelete: (id: string) => deleteCandidate.mutate(id),
    onSendInterview: handleSendInterview,
    onReturnInterview: handleReturnInterview,
    onPlace: handlePlace,
    onViewTimeline: (c: CandidateDB) => { setTimelineCandidate(c); setIsTimelineOpen(true); },
    onToggleInactive: handleToggleInactive,
    onInlineStatusChange: handleInlineStatusChange,
    onCopyPhone: handleCopyPhone,
    onToggleContacted: handleToggleContacted,
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

      {/* Export button */}
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCSV(candidates.map(c => ({ Name: c.full_name, Phone: c.phone, Address: c.address, Skills: (c.skills || []).join(', '), Experience: c.experience_years, Salary: c.expected_salary, Status: c.status, Date: c.created_at })), 'candidates')}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab} className="mb-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="Active">Active ({statusCounts.Active})</TabsTrigger>
          <TabsTrigger value="Sent for Interview">Interview ({statusCounts['Sent for Interview']})</TabsTrigger>
          <TabsTrigger value="Placed">Placed ({statusCounts.Placed})</TabsTrigger>
          <TabsTrigger value="Inactive">Inactive ({statusCounts.Inactive})</TabsTrigger>
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

      {/* Bulk action toolbar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30"
          >
            <Badge variant="default" className="text-sm">{selected.size} selected</Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">Bulk actions:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">Set Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {STATUS_OPTIONS.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleBulkStatus(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => {
              const rows = candidates.filter(c => selected.has(c.id)).map(c => ({
                Name: c.full_name, Phone: c.phone, Address: c.address, Skills: (c.skills || []).join(', '),
                Experience: c.experience_years, Salary: c.expected_salary, Status: c.status,
              }));
              exportToCSV(rows, 'candidates_selected');
            }}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-success border-success/30 hover:bg-success/10" onClick={handleShareSelectedToWhatsApp}>
              <Share2 className="h-4 w-4" /> Share to WhatsApp
            </Button>
            <Button size="sm" variant="destructive" className="gap-1" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button size="sm" variant="ghost" className="gap-1 ml-auto" onClick={clearSelection}>
              <X className="h-4 w-4" /> Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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
              <Label>Interview Result</Label>
              <div className="flex gap-2 flex-wrap">
                <Button variant={returnAction === 'Active' ? 'default' : 'outline'} size="sm" onClick={() => setReturnAction('Active')}>
                  Back to Active
                </Button>
                <Button variant={returnAction === 'Placed' ? 'default' : 'outline'} size="sm" onClick={() => setReturnAction('Placed')} className="bg-success hover:bg-success/90 text-white">
                  Hired ✓
                </Button>
                <Button variant={returnAction === 'Not Hired' ? 'default' : 'outline'} size="sm" onClick={() => setReturnAction('Not Hired')} className={returnAction === 'Not Hired' ? 'bg-destructive hover:bg-destructive/90' : 'text-destructive border-destructive'}>
                  Not Hired ✗
                </Button>
              </div>
            </div>
            {returnAction === 'Not Hired' && (
              <div className="space-y-2">
                <Label>Why wasn't the candidate hired? *</Label>
                <Textarea
                  placeholder="Employer said skills didn't match, salary too high, no experience..."
                  value={notHiredReason}
                  onChange={(e) => setNotHiredReason(e.target.value)}
                  className="min-h-[80px] border-destructive/50"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Interview Remarks / Feedback</Label>
              <Textarea
                placeholder="How did the interview go? Any feedback from employer..."
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemarksOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReturn} disabled={returnAction === 'Not Hired' && !notHiredReason}>
              Save & Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 360° Candidate Detail Drawer — replaces old details + timeline modals */}
      <CandidateDetailDrawer
        open={isTimelineOpen || isViewOpen}
        onOpenChange={(o) => {
          if (!o) {
            setIsTimelineOpen(false);
            setIsViewOpen(false);
            setTimelineCandidate(null);
            setSelectedCandidate(null);
          }
        }}
        candidate={timelineCandidate || selectedCandidate}
        activities={timelineActivities}
        placements={placements}
        jobNames={jobNames}
        onGenerateCV={handleGenerateCV}
        onSendInterview={(c) => {
          setIsTimelineOpen(false);
          setIsViewOpen(false);
          handleSendInterview(c);
        }}
        onPlace={(c) => {
          setIsTimelineOpen(false);
          setIsViewOpen(false);
          handlePlace(c);
        }}
        onAddNote={(candidateId, noteText) => {
          addActivity.mutate({
            candidate_id: candidateId,
            job_id: null,
            activity_type: 'remark',
            status: (timelineCandidate || selectedCandidate)?.status || 'Active',
            placed_at: null,
            remarks: noteText,
            follow_up_date: null,
            follow_up_done: false,
          });
        }}
      />
    </DashboardLayout>
  );
};

export default Candidates;
