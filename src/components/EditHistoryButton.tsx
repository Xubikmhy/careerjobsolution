import { History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  EntityType,
  useEntityEditHistory,
} from '@/hooks/useEditHistory';

interface Props {
  entityType: EntityType;
  entityId: string;
  label?: string;
  /** When true renders an icon-only ghost button. */
  iconOnly?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Name',
  phone: 'Phone',
  address: 'Address',
  expected_salary: 'Salary',
  status: 'Status',
  remarks: 'Remarks',
  skills: 'Skills',
  role_title: 'Role',
  company_name: 'Company',
  contact_person: 'Contact',
  employer_phone: 'Employer phone',
  employer_location: 'Employer location',
  location: 'Location',
  salary_min: 'Salary min',
  salary_max: 'Salary max',
  timing: 'Timing',
  expires_at: 'Expires',
  preferred_work_location: 'Wants to work',
  candidate_name: 'Candidate',
  job_title: 'Job',
  employer_name: 'Employer',
  agreed_salary: 'Agreed salary',
  commission_amount: 'Commission',
  commission_paid: 'Commission paid',
  placed_date: 'Placed date',
  follow_up_date: 'Follow-up',
  notes: 'Notes',
};

export function EditHistoryButton({ entityType, entityId, label, iconOnly = true }: Props) {
  const [opened, setOpened] = (function () {
    return [false, () => undefined] as const;
  })();
  void opened;
  void setOpened;

  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size={iconOnly ? 'icon' : 'sm'} title="Edit history" className="text-muted-foreground hover:text-foreground">
          <History className="h-4 w-4" />
          {!iconOnly && <span className="ml-1">History</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <HistoryList entityType={entityType} entityId={entityId} label={label} />
      </PopoverContent>
    </Popover>
  );
}

function HistoryList({ entityType, entityId, label }: { entityType: EntityType; entityId: string; label?: string }) {
  const { data: entries = [], isLoading } = useEntityEditHistory(entityType, entityId);

  return (
    <div>
      <div className="px-3 py-2 border-b border-border">
        <p className="text-sm font-semibold">Edit history</p>
        {label && <p className="text-xs text-muted-foreground truncate">{label}</p>}
      </div>
      <ScrollArea className="max-h-72">
        {isLoading ? (
          <p className="px-3 py-4 text-xs text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted-foreground">No edits recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((e) => (
              <li key={e.id} className="px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {FIELD_LABELS[e.field] || e.field}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-0.5 text-muted-foreground break-words">
                  <span className="line-through opacity-70">{e.old_value || '—'}</span>
                  <span className="mx-1">→</span>
                  <span className="text-foreground">{e.new_value || '—'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
