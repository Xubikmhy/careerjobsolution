import { CandidateActivity } from '@/hooks/useCandidateActivities';
import { CandidateDB } from '@/hooks/useCandidates';
import { format, isPast, isToday } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  followUps: CandidateActivity[];
  candidates: CandidateDB[];
  onMarkDone: (activityId: string) => void;
}

export function FollowUpReminders({ followUps, candidates, onMarkDone }: Props) {
  if (followUps.length === 0) return null;

  const getCandidateName = (id: string) =>
    candidates.find(c => c.id === id)?.full_name || 'Unknown';

  const sortedFollowUps = [...followUps].sort((a, b) =>
    new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime()
  );

  return (
    <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-warning" />
        <h3 className="font-semibold text-foreground">Follow-up Reminders ({followUps.length})</h3>
      </div>
      <div className="space-y-2">
        {sortedFollowUps.slice(0, 5).map((fu) => {
          const dueDate = new Date(fu.follow_up_date!);
          const overdue = isPast(dueDate) && !isToday(dueDate);
          const today = isToday(dueDate);

          return (
            <div
              key={fu.id}
              className={cn(
                'flex items-center justify-between gap-3 p-3 rounded-lg border',
                overdue ? 'bg-destructive/5 border-destructive/20' : today ? 'bg-warning/10 border-warning/20' : 'bg-card border-border'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {getCandidateName(fu.candidate_id)}
                  </span>
                  <Badge variant={overdue ? 'destructive' : today ? 'default' : 'secondary'} className="text-xs">
                    {overdue ? 'Overdue' : today ? 'Today' : format(dueDate, 'MMM d')}
                  </Badge>
                </div>
                {fu.placed_at && (
                  <p className="text-xs text-muted-foreground mt-0.5">At: {fu.placed_at}</p>
                )}
                {fu.remarks && (
                  <p className="text-xs text-muted-foreground truncate">{fu.remarks}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkDone(fu.id)}
                className="text-success hover:text-success shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Done
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
