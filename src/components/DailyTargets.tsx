import { useMemo } from 'react';
import { Target, Briefcase, UserPlus, Send, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useCandidateActivities } from '@/hooks/useCandidateActivities';
import { usePlacements } from '@/hooks/usePlacements';

/**
 * Daily team-productivity targets with traffic-light indicators.
 *  Red    < 50% of target (behind)
 *  Yellow 50%–<100% (on track)
 *  Green  ≥ 100% (target hit)
 *  Blue   ≥ 150% (overachieved)
 */
const TARGETS = {
  vacancies: 7,
  candidates: 5,
  hires: 3,
  interviews: 5,
} as const;

function isToday(iso: string | null | undefined) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

type Tone = 'red' | 'yellow' | 'green' | 'blue';

function getTone(count: number, target: number): Tone {
  const pct = target === 0 ? 0 : (count / target) * 100;
  if (pct >= 150) return 'blue';
  if (pct >= 100) return 'green';
  if (pct >= 50) return 'yellow';
  return 'red';
}

const toneStyles: Record<Tone, { ring: string; bar: string; chip: string; label: string }> = {
  red: {
    ring: 'border-destructive/40 bg-destructive/5',
    bar: '[&>div]:bg-destructive',
    chip: 'bg-destructive/15 text-destructive',
    label: 'Behind',
  },
  yellow: {
    ring: 'border-warning/40 bg-warning/5',
    bar: '[&>div]:bg-warning',
    chip: 'bg-warning/15 text-warning',
    label: 'On track',
  },
  green: {
    ring: 'border-success/40 bg-success/5',
    bar: '[&>div]:bg-success',
    chip: 'bg-success/15 text-success',
    label: 'Target hit',
  },
  blue: {
    ring: 'border-primary/40 bg-primary/5',
    bar: '[&>div]:bg-primary',
    chip: 'bg-primary/15 text-primary',
    label: 'Overachieved',
  },
};

interface TargetCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  target: number;
}

function TargetCard({ icon: Icon, title, count, target }: TargetCardProps) {
  const tone = getTone(count, target);
  const styles = toneStyles[tone];
  const pct = Math.min(100, target === 0 ? 0 : (count / target) * 100);

  return (
    <div className={cn('rounded-xl border p-4 transition-colors', styles.ring)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
        </div>
        <span
          className={cn(
            'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
            styles.chip,
          )}
        >
          {styles.label}
        </span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <p className="text-2xl font-bold text-foreground">
          {count}
          <span className="text-sm font-normal text-muted-foreground"> / {target}</span>
        </p>
        <p className="text-xs font-medium text-muted-foreground">{Math.round((count / target) * 100)}%</p>
      </div>
      <Progress value={pct} className={cn('h-2', styles.bar)} />
    </div>
  );
}

export function DailyTargets() {
  const { candidates } = useCandidates();
  const { jobs } = useJobs();
  const { allActivities } = useCandidateActivities();
  const { placements } = usePlacements();

  const counts = useMemo(() => {
    const newCandidates = candidates.filter((c) => isToday(c.created_at)).length;
    const newVacancies = jobs.filter((j) => isToday(j.created_at)).length;
    const interviews = allActivities.filter(
      (a) => a.activity_type === 'sent_for_interview' && isToday(a.created_at),
    ).length;
    const hires = placements.filter((p) => isToday(p.placed_date) || isToday(p.created_at)).length;
    return { newCandidates, newVacancies, interviews, hires };
  }, [candidates, jobs, allActivities, placements]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">Today's Targets</h2>
            <p className="text-xs text-muted-foreground">Live progress against daily goals</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Behind</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> On track</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Hit</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Over</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TargetCard icon={Briefcase} title="New Vacancies" count={counts.newVacancies} target={TARGETS.vacancies} />
        <TargetCard icon={UserPlus} title="New Candidates" count={counts.newCandidates} target={TARGETS.candidates} />
        <TargetCard icon={Send} title="Sent to Interview" count={counts.interviews} target={TARGETS.interviews} />
        <TargetCard icon={Trophy} title="Hires" count={counts.hires} target={TARGETS.hires} />
      </div>
    </div>
  );
}
