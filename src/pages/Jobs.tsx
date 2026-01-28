import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Plus, Trash2, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList, SkillTag } from '@/components/SkillTag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { mockJobReqs, mockCandidates } from '@/data/mockData';
import { JobReq, Candidate, EmployerInfo } from '@/types';
import { toast } from '@/hooks/use-toast';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobReq[]>(mockJobReqs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobReq | null>(null);
  const [isMatchOpen, setIsMatchOpen] = useState(false);

  // Auto-open form when action=add is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [formData, setFormData] = useState({
    // Employer info (inline)
    companyName: '',
    contactPerson: '',
    employerPhone: '',
    employerLocation: '',
    // Job info
    roleTitle: '',
    salaryMin: '',
    salaryMax: '',
    timing: 'Day' as JobReq['timing'],
    location: '',
    requiredSkills: [] as string[],
    remarks: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.employerInfo.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Smart Match Logic
  const getMatchingCandidates = (job: JobReq): Candidate[] => {
    return mockCandidates.filter((candidate) => {
      if (candidate.status !== 'Active') return false;

      const hasMatchingSkill = job.requiredSkills.some((reqSkill) =>
        candidate.skills.some(
          (candSkill) =>
            candSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(candSkill.toLowerCase())
        )
      );

      const salaryMatch = candidate.expectedSalary <= job.salaryMax;

      return hasMatchingSkill && salaryMatch;
    });
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.requiredSkills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed],
      }));
    }
    setSkillInput('');
  };

  const handleAddJob = () => {
    if (!formData.companyName || !formData.roleTitle || !formData.salaryMin) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in company name, role title, and salary',
        variant: 'destructive',
      });
      return;
    }

    const employerInfo: EmployerInfo = {
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      phone: formData.employerPhone,
      location: formData.employerLocation,
    };

    const newJob: JobReq = {
      id: String(Date.now()),
      employerInfo,
      roleTitle: formData.roleTitle,
      requiredSkills: formData.requiredSkills,
      salaryMin: parseInt(formData.salaryMin),
      salaryMax: parseInt(formData.salaryMax) || parseInt(formData.salaryMin),
      timing: formData.timing,
      location: formData.location || formData.employerLocation,
      status: 'Open',
      remarks: formData.remarks || undefined,
      createdAt: new Date(),
    };

    setJobs([newJob, ...jobs]);
    setIsFormOpen(false);
    setFormData({
      companyName: '',
      contactPerson: '',
      employerPhone: '',
      employerLocation: '',
      roleTitle: '',
      salaryMin: '',
      salaryMax: '',
      timing: 'Day',
      location: '',
      requiredSkills: [],
      remarks: '',
    });

    toast({
      title: 'Job Posted',
      description: 'The job posting has been created successfully.',
    });
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
    toast({
      title: 'Job Deleted',
      description: 'The job posting has been removed.',
    });
  };

  const matchingCandidates = selectedJob ? getMatchingCandidates(selectedJob) : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Job Openings"
        description="Manage job postings and find matching candidates"
        icon={Briefcase}
        action={{
          label: 'Post Job',
          onClick: () => setIsFormOpen(true),
          icon: Plus,
        }}
      />

      <SearchFilterBar
        searchPlaceholder="Search by role, company, or location..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'Open', label: 'Open' },
              { value: 'Closed', label: 'Closed' },
            ],
          },
        ]}
        className="mb-6"
      />

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No job postings found
          </div>
        ) : (
          filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{job.roleTitle}</h3>
                  <p className="text-sm text-muted-foreground">{job.employerInfo.companyName}</p>
                </div>
                <StatusBadge status={job.status} variant={getStatusVariant(job.status)} />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-lg font-bold text-success">
                  NPR {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.timing}</span>
                </div>
              </div>

              <SkillTagList skills={job.requiredSkills} max={3} className="mb-4" />

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => {
                    setSelectedJob(job);
                    setIsMatchOpen(true);
                  }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Find Match
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Job Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employer Info Section */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <h4 className="font-medium text-foreground">Employer Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    placeholder="e.g., Hotel Barahi"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    placeholder="e.g., Mr. Sharma"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+977-98XXXXXXXX"
                    value={formData.employerPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, employerPhone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Lakeside, Pokhara"
                    value={formData.employerLocation}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, employerLocation: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-2">
              <Label>Role Title *</Label>
              <Input
                placeholder="e.g., Kitchen Helper"
                value={formData.roleTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, roleTitle: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Salary (NPR) *</Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={formData.salaryMin}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salaryMin: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Salary (NPR)</Label>
                <Input
                  type="number"
                  placeholder="20000"
                  value={formData.salaryMax}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salaryMax: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timing</Label>
                <Select
                  value={formData.timing}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, timing: value as JobReq['timing'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Location</Label>
                <Input
                  placeholder="e.g., Lakeside"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSkill(skillInput)}
                  disabled={!skillInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills.map((skill) => (
                    <SkillTag
                      key={skill}
                      skill={skill}
                      onRemove={() =>
                        setFormData((prev) => ({
                          ...prev,
                          requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
                        }))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label>Remarks (Internal Notes)</Label>
              <Textarea
                placeholder="Any internal notes about this job posting..."
                value={formData.remarks}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddJob}>Post Job</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Match Modal */}
      <Dialog open={isMatchOpen} onOpenChange={setIsMatchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Suggested Candidates
            </DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              {/* Job Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground">{selectedJob.roleTitle}</h4>
                <p className="text-sm text-muted-foreground">{selectedJob.employerInfo.companyName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-success font-medium">
                    NPR {selectedJob.salaryMin.toLocaleString()} - {selectedJob.salaryMax.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <SkillTagList skills={selectedJob.requiredSkills} max={5} />
                </div>
              </div>

              {/* Matching Candidates */}
              {matchingCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No matching candidates found</p>
                  <p className="text-sm">Try adjusting the job requirements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Found {matchingCandidates.length} matching candidate(s)
                  </p>
                  {matchingCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{candidate.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{candidate.address}</p>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          NPR {candidate.expectedSalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{candidate.experienceYears} yrs exp</span>
                        <span>•</span>
                        <span>{candidate.educationLevel}</span>
                      </div>
                      <SkillTagList skills={candidate.skills} max={5} />
                    </div>
                  ))}
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
