import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { JobDB } from '@/hooks/useJobs';
import { CandidateDB } from '@/hooks/useCandidates';
import { CandidateActivity } from '@/hooks/useCandidateActivities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Clock, DollarSign, Phone, User, Sparkles, Briefcase, Send, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface JobDetailModalProps {
  job: JobDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchingCandidates: CandidateDB[];
  onFindMatch: () => void;
  jobActivities?: CandidateActivity[];
  candidateNames?: Record<string, string>;
}

function calculateMatchScore(candidate: CandidateDB, job: JobDB): number {
  let score = 0;
  const jobSkills = job.required_skills || [];
  const candSkills = candidate.skills || [];

  if (jobSkills.length > 0) {
    const matchedSkills = jobSkills.filter(reqSkill =>
      candSkills.some(cs =>
        cs.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(cs.toLowerCase())
      )
    );
    score += Math.round((matchedSkills.length / jobSkills.length) * 60);
  } else {
    score += 30;
  }

  if (candidate.expected_salary <= job.salary_max) {
    score += 25;
  } else if (candidate.expected_salary <= job.salary_max * 1.1) {
    score += 15;
  }

  if (candidate.experience_years >= 3) score += 15;
  else if (candidate.experience_years >= 1) score += 10;
  else score += 5;

  return Math.min(score, 100);
}

const activityIcons: Record<string, React.ElementType> = {
  sent_for_interview: Send,
  placed: CheckCircle2,
  interview_returned: RotateCcw,
};

const activityColors: Record<string, string> = {
  sent_for_interview: 'text-warning',
  placed: 'text-success',
  interview_returned: 'text-primary',
};

export function JobDetailModal({ job, open, onOpenChange, matchingCandidates, onFindMatch, jobActivities = [], candidateNames = {} }: JobDetailModalProps) {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{job.role_title}</DialogTitle>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {job.company_name}
                    </p>
                  </div>
                  <StatusBadge status={job.status} variant={getStatusVariant(job.status)} />
                </div>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Key Details */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-success/5 rounded-xl border border-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="text-sm text-muted-foreground">Salary Range</span>
                  </div>
                  <p className="text-lg font-bold text-success">
                    NPR {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Schedule</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{job.timing}</p>
                </div>
              </motion.div>

              {/* Location & Contact */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
                {job.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.contact_person && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Contact: {job.contact_person}</span>
                  </div>
                )}
                {job.employer_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{job.employer_phone}</span>
                  </div>
                )}
              </motion.div>

              {/* Required Skills */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Required Skills
                </h4>
                <SkillTagList skills={job.required_skills || []} max={20} />
              </motion.div>

              {/* Candidate Pipeline for this Job */}
              {jobActivities.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Send className="h-4 w-4 text-warning" />
                    Candidate Pipeline ({jobActivities.length})
                  </h4>
                  <div className="space-y-2">
                    {jobActivities.map((activity) => {
                      const Icon = activityIcons[activity.activity_type] || Send;
                      const color = activityColors[activity.activity_type] || 'text-muted-foreground';
                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                          <Icon className={`h-4 w-4 ${color} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground">
                              {candidateNames[activity.candidate_id] || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.activity_type === 'sent_for_interview' && 'Sent for Interview'}
                              {activity.activity_type === 'placed' && 'Placed'}
                              {activity.activity_type === 'interview_returned' && 'Returned'}
                              {' • '}
                              {format(new Date(activity.created_at), 'MMM d, yyyy')}
                            </p>
                            {activity.remarks && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.remarks}</p>
                            )}
                          </div>
                          <Badge
                            variant={activity.activity_type === 'placed' ? 'default' : 'secondary'}
                            className={activity.activity_type === 'placed' ? 'bg-success text-success-foreground' : ''}
                          >
                            {activity.activity_type === 'placed' ? 'Placed' : activity.activity_type === 'sent_for_interview' ? 'Interview' : 'Returned'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Remarks */}
              {job.remarks && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{job.remarks}</p>
                </motion.div>
              )}

              {/* Top Matching Candidates */}
              {matchingCandidates.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Top Matches ({matchingCandidates.length})
                  </h4>
                  <div className="space-y-2">
                    {matchingCandidates.slice(0, 3).map((candidate) => {
                      const score = calculateMatchScore(candidate, job);
                      return (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                        >
                          <div>
                            <p className="font-medium text-foreground text-sm">{candidate.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {candidate.experience_years}yrs exp • NPR {candidate.expected_salary.toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant={score >= 70 ? 'default' : 'secondary'}
                            className={score >= 70 ? 'bg-success text-success-foreground' : ''}
                          >
                            {score}% match
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button className="flex-1 gap-2" onClick={onFindMatch}>
                  <Sparkles className="h-4 w-4" />
                  Find All Matches
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export { calculateMatchScore };
