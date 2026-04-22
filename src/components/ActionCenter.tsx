import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import {
  AlertTriangle, Clock, CalendarClock, CheckCircle2, ArrowRight,
  UserX, Sparkles, Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useCandidates, CandidateDB } from '@/hooks/useCandidates';
import { useCandidateActivities, CandidateActivity } from '@/hooks/useCandidateActivities';
import { WhatsAppButton } from './WhatsAppButton';
import { toast } from '@/hooks/use-toast';

type ActionItem = {
  id: string;
  kind: 'follow_up' | 'stale';
  candidate: CandidateDB;
  activity?: CandidateActivity;
  dueDate: Date;
  title: string;
  subtitle: string;
};

const ACTIVITY_LABEL: Record<string, string> = {
  registered: 'Call new candidate',
  sent_for_interview: 'Get interview result',
  interview_returned: 'Follow up post-interview',
  not_hired: 'Re-engage candidate',
  placed: 'Placement check-in',
  follow_up: 'Follow up',
  remark: 'Follow up',
};

export function ActionCenter() {
  const { candidates } = useCandidates();
  const { allActivities, updateActivity } = useCandidateActivities();

  const items = useMemo<ActionItem[]>(() => {
    const candidateMap = new Map(candidates.map((c) => [c.id, c]));
    const out: ActionItem[] = [];

    // 1. Open follow-ups from activities
    allActivities.forEach((a) => {
      if (a.follow_up_done || !a.follow_up_date) return;
      const c = candidateMap.get(a.candidate_id);
      if (!c) return;
      // Skip placed/inactive — they don't need active chasing
      if (c.status === 'Placed' || c.status === 'Inactive') return;
      out.push({
        id: `act-${a.id}`,
        kind: 'follow_up',
        candidate: c,
        activity: a,
        dueDate: new Date(a.follow_up_date),
        title: ACTIVITY_LABEL[a.activity_type] || 'Follow up',
        subtitle: a.placed_at || a.remarks?.slice(0, 80) || '',
      });
    });

    // 2. Stale candidates — Active with no activity in 7+ days
    const lastActivityByCandidate = new Map<string, Date>();
    allActivities.forEach((a) => {
      const ts = new Date(a.created_at);
      const prev = lastActivityByCandidate.get(a.candidate_id);
      if (!prev || ts > prev) lastActivityByCandidate.set(a.candidate_id, ts);
    });

    candidates.forEach((c) => {
      if (c.status !== 'Active') return;
      const last = lastActivityByCandidate.get(c.id) || new Date(c.created_at);
      const daysSince = differenceInDays(new Date(), last);
      if (daysSince < 7) return;
      // Don't double-add if there's already an open follow-up for this candidate
      const hasOpen = out.some((i) => i.candidate.id === c.id);
      if (hasOpen) return;
      out.push({
        id: `stale-${c.id}`,
        kind: 'stale',
        candidate: c,
        dueDate: last,
        title: daysSince >= 30 ? 'Inactive — confirm or archive' : 'Stale candidate',
        subtitle: `No activity for ${daysSince} days`,
      });
    });

    // Sort by due date ascending (oldest/most overdue first)
    return out.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [candidates, allActivities]);

  const overdue = items.filter((i) => isPast(i.dueDate) && !isToday(i.dueDate));
  const today = items.filter((i) => isToday(i.dueDate));
  const tomorrow = items.filter((i) => isTomorrow(i.dueDate));
  const upcoming = items.filter(
    (i) => !isPast(i.dueDate) && !isToday(i.dueDate) && !isTomorrow(i.dueDate),
  );

  const handleDone = (item: ActionItem) => {
    if (item.activity) {
      updateActivity.mutate({ id: item.activity.id, follow_up_done: true });
      toast({ title: 'Marked done', description: `Reminder cleared for ${item.candidate.full_name}` });
    } else {
      toast({
        title: 'Open candidate to log outcome',
        description: 'Use Send for Interview / Place / Add Note to record next step.',
      });
    }
  };

  const handleSweepStale = () => {
    // Auto-mark Inactive for any Active candidate idle 30+ days
    const stale30 = items.filter(
      (i) => i.kind === 'stale' && differenceInDays(new Date(), i.dueDate) >= 30,
    );
    if (stale30.length === 0) {
      toast({ title: 'Nothing to archive', description: 'No candidates idle 30+ days.' });
      return;
    }
    toast({
      title: `${stale30.length} stale candidate(s) found`,
      description: 'Open Candidates page and use the Inactive tab to confirm.',
    });
  };

  const renderList = (list: ActionItem[], emptyMsg: string) => {
    if (list.length === 0) {
      return (
        <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-success/60" />
          {emptyMsg}
        </div>
      );
    }
    return (
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {list.map((item) => {
          const overdueDays = differenceInDays(new Date(), item.dueDate);
          const isOverdue = isPast(item.dueDate) && !isToday(item.dueDate);
          const isStale = item.kind === 'stale';
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors',
                isOverdue && 'border-destructive/30 bg-destructive/5',
                isToday(item.dueDate) && 'border-warning/30 bg-warning/5',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 p-1.5 rounded-md shrink-0',
                  isStale ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
                )}
              >
                {isStale ? <UserX className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/candidates"
                    className="font-medium text-sm text-foreground hover:text-primary truncate"
                  >
                    {item.candidate.full_name}
                  </Link>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                      {overdueDays}d overdue
                    </Badge>
                  )}
                  {isToday(item.dueDate) && (
                    <Badge className="text-[10px] h-4 px-1.5 bg-warning text-warning-foreground hover:bg-warning">
                      Today
                    </Badge>
                  )}
                  {isTomorrow(item.dueDate) && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      Tomorrow
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-foreground/80 mt-0.5">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(item.dueDate, 'MMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <WhatsAppButton phone={item.candidate.phone} name={item.candidate.full_name} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-success hover:text-success"
                  onClick={() => handleDone(item)}
                  title="Mark this reminder done"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalUrgent = overdue.length + today.length;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden mb-8">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Action Center
              {totalUrgent > 0 && (
                <Badge variant="destructive" className="h-5">
                  {totalUrgent} need attention
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Smart reminders for every candidate in your pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSweepStale} className="hidden sm:inline-flex">
            Review stale
          </Button>
          <Link to="/candidates">
            <Button variant="ghost" size="sm" className="gap-1">
              All candidates <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue={overdue.length > 0 ? 'overdue' : 'today'}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overdue" className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" /> Overdue
              {overdue.length > 0 && (
                <Badge variant="destructive" className="h-4 px-1 text-[10px]">{overdue.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="today" className="gap-1 text-xs">
              <Clock className="h-3 w-3" /> Today
              {today.length > 0 && (
                <Badge className="h-4 px-1 text-[10px] bg-warning text-warning-foreground hover:bg-warning">
                  {today.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tomorrow" className="gap-1 text-xs">
              <CalendarClock className="h-3 w-3" /> Tomorrow
              {tomorrow.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">{tomorrow.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1 text-xs">
              Upcoming
              {upcoming.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">{upcoming.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="mt-4">
            {renderList(overdue, 'No overdue items — great job staying on top!')}
          </TabsContent>
          <TabsContent value="today" className="mt-4">
            {renderList(today, "Nothing due today. You're clear.")}
          </TabsContent>
          <TabsContent value="tomorrow" className="mt-4">
            {renderList(tomorrow, 'No reminders scheduled for tomorrow yet.')}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {renderList(upcoming, 'No upcoming reminders.')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
