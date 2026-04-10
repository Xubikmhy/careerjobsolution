import { useCandidates } from '@/hooks/useCandidates';
import { useCandidateActivities } from '@/hooks/useCandidateActivities';
import { Users, Send, CheckCircle2, XCircle } from 'lucide-react';

export function PipelineFunnel() {
  const { candidates } = useCandidates();
  const { allActivities } = useCandidateActivities();

  const total = candidates.length;
  const interviewed = new Set(
    allActivities.filter(a => a.activity_type === 'sent_for_interview').map(a => a.candidate_id)
  ).size;
  const placed = candidates.filter(c => c.status === 'Placed').length;
  const notHired = allActivities.filter(a => a.activity_type === 'not_hired').length;
  const active = candidates.filter(c => c.status === 'Active').length;

  const stages = [
    { label: 'Registered', count: total, icon: Users, color: 'bg-primary/10 text-primary', barColor: 'bg-primary' },
    { label: 'Sent for Interview', count: interviewed, icon: Send, color: 'bg-warning/10 text-warning', barColor: 'bg-warning' },
    { label: 'Placed', count: placed, icon: CheckCircle2, color: 'bg-success/10 text-success', barColor: 'bg-success' },
    { label: 'Rejected', count: notHired, icon: XCircle, color: 'bg-destructive/10 text-destructive', barColor: 'bg-destructive' },
  ];

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Candidate Pipeline</h3>
      <div className="space-y-3">
        {stages.map(stage => (
          <div key={stage.label} className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${stage.color}`}>
              <stage.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{stage.label}</span>
                <span className="font-semibold text-foreground">{stage.count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stage.barColor} transition-all duration-500`}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
          <span className="text-muted-foreground">Conversion Rate</span>
          <span className="font-bold text-success">{Math.round((placed / total) * 100)}%</span>
        </div>
      )}
    </div>
  );
}
