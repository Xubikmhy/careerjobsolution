import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { CandidateTimeline } from '@/components/CandidateTimeline';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  FileText,
  History,
  User,
  Briefcase,
  Send,
  Plus,
  Trophy,
  CalendarDays,
  Mail,
  MapPin,
  GraduationCap,
  Languages,
  Heart,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import type { CandidateDB } from '@/hooks/useCandidates';
import type { CandidateActivity } from '@/hooks/useCandidateActivities';
import type { PlacementDB } from '@/hooks/usePlacements';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateDB | null;
  activities: CandidateActivity[];
  placements: PlacementDB[];
  jobNames: Record<string, string>;
  onGenerateCV: (c: CandidateDB) => void;
  onSendInterview: (c: CandidateDB) => void;
  onPlace: (c: CandidateDB) => void;
  onAddNote: (candidateId: string, note: string) => void;
}

export function CandidateDetailDrawer({
  open,
  onOpenChange,
  candidate,
  activities,
  placements,
  jobNames,
  onGenerateCV,
  onSendInterview,
  onPlace,
  onAddNote,
}: Props) {
  const [note, setNote] = useState('');

  const candidatePlacements = useMemo(
    () => (candidate ? placements.filter((p) => p.candidate_id === candidate.id) : []),
    [placements, candidate]
  );

  if (!candidate) return null;

  const handleAddNote = () => {
    if (!note.trim()) return;
    onAddNote(candidate.id, note.trim());
    setNote('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <SheetHeader className="px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-xl truncate">{candidate.full_name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <StatusBadge
                    status={candidate.status}
                    variant={getStatusVariant(candidate.status)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Registered{' '}
                    {candidate.created_at
                      ? format(new Date(candidate.created_at), 'MMM d, yyyy')
                      : '-'}
                  </span>
                </div>
              </div>
              <WhatsAppButton phone={candidate.phone} name={candidate.full_name} />
            </div>
          </SheetHeader>

          {/* Quick action bar */}
          <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
            <Button size="sm" onClick={() => onGenerateCV(candidate)} className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Generate CV
            </Button>
            {candidate.status !== 'Placed' && candidate.status !== 'Inactive' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendInterview(candidate)}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Send to Interview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPlace(candidate)}
                  className="gap-1.5 text-success border-success/40 hover:bg-success/10"
                >
                  <Trophy className="h-3.5 w-3.5" /> Place
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <Tabs defaultValue="overview" className="px-5 py-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> Timeline
              {activities.length > 0 && (
                <span className="ml-1 text-[10px] bg-muted px-1.5 rounded">
                  {activities.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="placements" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Jobs
              {candidatePlacements.length > 0 && (
                <span className="ml-1 text-[10px] bg-muted px-1.5 rounded">
                  {candidatePlacements.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-5 mt-4">
            {/* Contact */}
            <section>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoRow icon={Mail} label="Phone" value={candidate.phone} />
                <InfoRow icon={MapPin} label="Address" value={candidate.address || '—'} />
              </div>
            </section>

            {/* Professional */}
            <section>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Professional
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow
                  icon={Briefcase}
                  label="Experience"
                  value={`${candidate.experience_years} years`}
                />
                <InfoRow
                  icon={GraduationCap}
                  label="Education"
                  value={candidate.education_level || '—'}
                />
                <InfoRow
                  label="Expected Salary"
                  value={`NPR ${candidate.expected_salary?.toLocaleString() || 0}`}
                />
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Skills</p>
                {candidate.skills?.length ? (
                  <SkillTagList skills={candidate.skills} max={20} />
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                )}
              </div>

              {candidate.languages?.length ? (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Languages:</span>
                  <span>{candidate.languages.join(', ')}</span>
                </div>
              ) : null}
            </section>

            {/* Personal */}
            {(candidate.date_of_birth ||
              candidate.nationality ||
              candidate.marital_status) && (
              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Personal
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {candidate.date_of_birth && (
                    <InfoRow
                      icon={CalendarDays}
                      label="Date of Birth"
                      value={format(new Date(candidate.date_of_birth), 'MMM d, yyyy')}
                    />
                  )}
                  {candidate.nationality && (
                    <InfoRow
                      icon={Globe}
                      label="Nationality"
                      value={candidate.nationality}
                    />
                  )}
                  {candidate.marital_status && (
                    <InfoRow
                      icon={Heart}
                      label="Marital Status"
                      value={candidate.marital_status}
                    />
                  )}
                </div>
              </section>
            )}

            {/* Career objective */}
            {candidate.career_objective && (
              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Career Objective
                </h4>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {candidate.career_objective}
                </p>
              </section>
            )}

            {/* References */}
            {candidate.reference_info && (
              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  References
                </h4>
                <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-line">
                  {candidate.reference_info}
                </p>
              </section>
            )}

            {/* Latest remarks */}
            {candidate.remarks && (
              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Latest Remarks
                </h4>
                <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-line">
                  {candidate.remarks}
                </p>
              </section>
            )}
          </TabsContent>

          {/* TIMELINE */}
          <TabsContent value="timeline" className="mt-4">
            {/* Quick add note */}
            <div className="mb-5 p-3 rounded-lg border border-border bg-muted/30">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">
                Add a note
              </Label>
              <Textarea
                placeholder="Called candidate, will visit office tomorrow..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[70px] text-sm bg-background"
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Log Note
                </Button>
              </div>
            </div>

            <CandidateTimeline activities={activities} jobNames={jobNames} />
          </TabsContent>

          {/* PLACEMENTS */}
          <TabsContent value="placements" className="mt-4 space-y-3">
            {candidatePlacements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No placements recorded for this candidate.
              </p>
            ) : (
              candidatePlacements.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-border p-3 bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {p.job_title || 'Untitled role'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.employer_name || '—'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.commission_paid
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {p.commission_paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Placed</p>
                      <p className="font-medium">
                        {p.placed_date
                          ? format(new Date(p.placed_date), 'MMM d, yyyy')
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salary</p>
                      <p className="font-medium">
                        NPR {p.agreed_salary?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission</p>
                      <p className="font-medium">
                        NPR {p.commission_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/40 rounded p-2">
                      {p.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="font-medium text-sm truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
