import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Plus, Trash2, Sparkles, Eye, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList, SkillTag } from '@/components/SkillTag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobs, JobDB } from '@/hooks/useJobs';
import { useCandidates, CandidateDB } from '@/hooks/useCandidates';
import { useCandidateActivities } from '@/hooks/useCandidateActivities';
import { JobDetailModal, calculateMatchScore } from '@/components/JobDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, isLoading, addJob, deleteJob } = useJobs();
  const { candidates } = useCandidates();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDB | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [isAIMatching, setIsAIMatching] = useState(false);
  const [aiMatchResults, setAIMatchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    employerPhone: '',
    employerLocation: '',
    roleTitle: '',
    salaryMin: '',
    salaryMax: '',
    timing: 'Day' as string,
    location: '',
    requiredSkills: [] as string[],
    remarks: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [groupBySkills, setGroupBySkills] = useState(false);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const jobSkillGroups = useMemo(() => {
    const groups: Record<string, typeof filteredJobs> = {};
    filteredJobs.forEach((j) => {
      const primary = j.required_skills?.[0] || 'General';
      if (!groups[primary]) groups[primary] = [];
      groups[primary].push(j);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredJobs]);

  const getMatchingCandidates = (job: JobDB) => {
    return candidates
      .filter((candidate) => {
        if (candidate.status !== 'Active') return false;
        const hasMatchingSkill = (job.required_skills || []).some((reqSkill) =>
          (candidate.skills || []).some(
            (candSkill) =>
              candSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
              reqSkill.toLowerCase().includes(candSkill.toLowerCase())
          )
        );
        const salaryMatch = candidate.expected_salary <= job.salary_max;
        return hasMatchingSkill || salaryMatch;
      })
      .sort((a, b) => calculateMatchScore(b, job) - calculateMatchScore(a, job));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.requiredSkills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, trimmed] }));
    }
    setSkillInput('');
  };

  const handleAddJob = () => {
    if (!formData.companyName || !formData.roleTitle || !formData.salaryMin) {
      toast({ title: 'Missing Fields', description: 'Fill in company, role, and salary', variant: 'destructive' });
      return;
    }
    addJob.mutate({
      company_name: formData.companyName,
      contact_person: formData.contactPerson || null,
      employer_phone: formData.employerPhone || null,
      employer_location: formData.employerLocation || null,
      role_title: formData.roleTitle,
      required_skills: formData.requiredSkills,
      salary_min: parseInt(formData.salaryMin),
      salary_max: parseInt(formData.salaryMax) || parseInt(formData.salaryMin),
      timing: formData.timing,
      location: formData.location || formData.employerLocation || null,
      status: 'Open',
      remarks: formData.remarks || null,
    });
    setIsFormOpen(false);
    setFormData({ companyName: '', contactPerson: '', employerPhone: '', employerLocation: '', roleTitle: '', salaryMin: '', salaryMax: '', timing: 'Day', location: '', requiredSkills: [], remarks: '' });
  };

  const handleSmartMatch = async (job: JobDB) => {
    const activeCandidates = candidates.filter(c => c.status === 'Active');
    if (activeCandidates.length === 0) {
      sonnerToast.error('No active candidates to match');
      return;
    }
    setSelectedJob(job);
    setIsMatchOpen(true);
    setIsAIMatching(true);
    setAIMatchResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('smart-match', {
        body: { candidates: activeCandidates.slice(0, 10), job },
      });
      if (error) throw error;
      setAIMatchResults(data?.matches || []);
    } catch (e: any) {
      sonnerToast.error(e.message || 'AI matching failed, using basic matching');
    } finally {
      setIsAIMatching(false);
    }
  };

  const matchingCandidates = selectedJob ? getMatchingCandidates(selectedJob) : [];

  const renderJobCard = useCallback((job: JobDB, index: number) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => { setSelectedJob(job); setIsDetailOpen(true); }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{job.role_title}</h3>
          <p className="text-sm text-muted-foreground">{job.company_name}</p>
        </div>
        <StatusBadge status={job.status} variant={getStatusVariant(job.status)} />
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-lg font-bold text-success">
          NPR {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{job.location}</span>
          <span>•</span>
          <span>{job.timing}</span>
          <span>•</span>
          <span>{job.created_at ? format(new Date(job.created_at), 'MMM d, yyyy') : ''}</span>
        </div>
      </div>
      <SkillTagList skills={job.required_skills || []} max={3} className="mb-4" />
      {candidates.filter(c => c.status === 'Active').length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Top candidates matching</p>
          <div className="flex gap-1">
            {getMatchingCandidates(job).slice(0, 3).map(c => (
              <Badge key={c.id} variant="secondary" className="text-xs">
                {calculateMatchScore(c, job)}%
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleSmartMatch(job)}>
          <Sparkles className="h-4 w-4 text-primary" />
          AI Match
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedJob(job); setIsDetailOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => deleteJob.mutate(job.id)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  ), [candidates, deleteJob]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Job Openings" description="Manage job postings and find matching candidates" icon={Briefcase} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (<Skeleton key={i} className="h-48 rounded-xl" />))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Job Openings"
        description="Manage job postings and find matching candidates"
        icon={Briefcase}
        action={{ label: 'Post Job', onClick: () => setIsFormOpen(true), icon: Plus }}
      />

      <SearchFilterBar
        searchPlaceholder="Search by role, company, or location..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[{ name: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [{ value: 'Open', label: 'Open' }, { value: 'Filled', label: 'Filled' }, { value: 'Closed', label: 'Closed' }] }]}
        className="mb-4"
      />

      <div className="flex justify-end mb-4">
        <Button variant={groupBySkills ? 'default' : 'outline'} size="sm" onClick={() => setGroupBySkills(!groupBySkills)}>
          Group by Skill
        </Button>
      </div>

      {groupBySkills ? (
        <div className="space-y-8">
          {jobSkillGroups.map(([skill, groupJobs]) => (
            <div key={skill}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-sm">{skill}</Badge>
                <span className="text-sm text-muted-foreground">({groupJobs.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupJobs.map((job, index) => renderJobCard(job, index))}
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No job postings found</div>
        ) : (
          filteredJobs.map((job, index) => renderJobCard(job, index))
        )}
      </div>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        matchingCandidates={selectedJob ? getMatchingCandidates(selectedJob) : []}
        onFindMatch={() => { setIsDetailOpen(false); if (selectedJob) handleSmartMatch(selectedJob); }}
      />

      {/* Add Job Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Post New Job</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <h4 className="font-medium text-foreground">Employer Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Company Name *</Label><Input placeholder="e.g., Hotel Barahi" value={formData.companyName} onChange={(e) => setFormData(p => ({ ...p, companyName: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Contact Person</Label><Input placeholder="e.g., Mr. Sharma" value={formData.contactPerson} onChange={(e) => setFormData(p => ({ ...p, contactPerson: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Phone</Label><Input placeholder="+977-98XXXXXXXX" value={formData.employerPhone} onChange={(e) => setFormData(p => ({ ...p, employerPhone: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Location</Label><Input placeholder="e.g., Lakeside, Pokhara" value={formData.employerLocation} onChange={(e) => setFormData(p => ({ ...p, employerLocation: e.target.value }))} /></div>
              </div>
            </div>
            <div className="space-y-2"><Label>Role Title *</Label><Input placeholder="e.g., Kitchen Helper" value={formData.roleTitle} onChange={(e) => setFormData(p => ({ ...p, roleTitle: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Salary (NPR) *</Label><Input type="number" placeholder="15000" value={formData.salaryMin} onChange={(e) => setFormData(p => ({ ...p, salaryMin: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Max Salary (NPR)</Label><Input type="number" placeholder="20000" value={formData.salaryMax} onChange={(e) => setFormData(p => ({ ...p, salaryMax: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timing</Label>
                <Select value={formData.timing} onValueChange={(v) => setFormData(p => ({ ...p, timing: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Work Location</Label><Input placeholder="e.g., Lakeside" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} /></div>
            </div>
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input placeholder="Add skill..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
                <Button type="button" variant="outline" onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills.map((skill) => (
                    <SkillTag key={skill} skill={skill} onRemove={() => setFormData(p => ({ ...p, requiredSkills: p.requiredSkills.filter(s => s !== skill) }))} />
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2"><Label>Remarks</Label><Textarea placeholder="Internal notes..." value={formData.remarks} onChange={(e) => setFormData(p => ({ ...p, remarks: e.target.value }))} /></div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleAddJob} disabled={addJob.isPending}>{addJob.isPending ? 'Posting...' : 'Post Job'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Smart Match Modal */}
      <Dialog open={isMatchOpen} onOpenChange={setIsMatchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Smart Match Results
            </DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground">{selectedJob.role_title}</h4>
                <p className="text-sm text-muted-foreground">{selectedJob.company_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-success font-medium">NPR {selectedJob.salary_min.toLocaleString()} - {selectedJob.salary_max.toLocaleString()}</span>
                </div>
              </div>

              {isAIMatching ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">AI is analyzing candidates...</p>
                </div>
              ) : aiMatchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">AI analyzed {aiMatchResults.length} candidate(s)</p>
                  {aiMatchResults
                    .sort((a: any, b: any) => b.score - a.score)
                    .map((match: any, idx: number) => {
                      const candidate = candidates.filter(c => c.status === 'Active')[match.candidateIndex - 1];
                      if (!candidate) return null;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 bg-card rounded-lg border border-border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-foreground">{candidate.full_name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {candidate.experience_years}yrs • NPR {candidate.expected_salary.toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              variant={match.score >= 70 ? 'default' : 'secondary'}
                              className={match.score >= 70 ? 'bg-success text-success-foreground text-lg px-3' : 'text-lg px-3'}
                            >
                              {match.score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{match.reasoning}</p>
                          {match.strengths && (
                            <div className="flex flex-wrap gap-1">
                              {match.strengths.map((s: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-success/10 text-success">{s}</Badge>
                              ))}
                            </div>
                          )}
                          {match.gaps && match.gaps.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.gaps.map((g: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-destructive/10 text-destructive">{g}</Badge>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                </div>
              ) : matchingCandidates.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Basic matching: {matchingCandidates.length} candidate(s)</p>
                  {matchingCandidates.map((candidate) => (
                    <div key={candidate.id} className="p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-foreground">{candidate.full_name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {candidate.experience_years}yrs • NPR {candidate.expected_salary.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{calculateMatchScore(candidate, selectedJob)}%</Badge>
                      </div>
                      <SkillTagList skills={candidate.skills || []} max={5} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No matching candidates found</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Jobs;
