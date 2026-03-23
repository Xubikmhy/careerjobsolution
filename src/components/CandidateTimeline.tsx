import { CandidateActivity } from '@/hooks/useCandidateActivities';
import { format } from 'date-fns';
import { CheckCircle2, Send, RotateCcw, UserPlus, MapPin, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const activityConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  registered: { icon: UserPlus, color: 'text-primary', label: 'Registered' },
  sent_for_interview: { icon: Send, color: 'text-warning', label: 'Sent for Interview' },
  interview_returned: { icon: RotateCcw, color: 'text-primary', label: 'Returned from Interview' },
  placed: { icon: CheckCircle2, color: 'text-success', label: 'Placed' },
  follow_up: { icon: Clock, color: 'text-muted-foreground', label: 'Follow-up' },
  remark: { icon: MessageSquare, color: 'text-muted-foreground', label: 'Note Added' },
};

interface Props {
  activities: CandidateActivity[];
  jobNames?: Record<string, string>;
}

export function CandidateTimeline({ activities, jobNames = {} }: Props) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet</p>;
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

      {activities.map((activity, index) => {
        const config = activityConfig[activity.activity_type] || activityConfig.remark;
        const Icon = config.icon;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-4 pb-4">
            {/* Icon dot */}
            <div className={cn(
              'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-card',
              isLast ? 'border-primary' : 'border-border'
            )}>
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-foreground">{config.label}</span>
                {activity.placed_at && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <MapPin className="h-3 w-3" />
                    {activity.placed_at}
                  </Badge>
                )}
                {activity.job_id && jobNames[activity.job_id] && (
                  <Badge variant="outline" className="text-xs">
                    {jobNames[activity.job_id]}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
              </p>

              {activity.remarks && (
                <p className="text-sm text-muted-foreground mt-1 bg-muted/50 rounded-md p-2">
                  {activity.remarks}
                </p>
              )}

              {activity.follow_up_date && !activity.follow_up_done && (
                <div className="flex items-center gap-1 mt-1 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  Follow-up: {format(new Date(activity.follow_up_date), 'MMM d, yyyy')}
                </div>
              )}

              {activity.follow_up_date && activity.follow_up_done && (
                <div className="flex items-center gap-1 mt-1 text-xs text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Follow-up completed
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
