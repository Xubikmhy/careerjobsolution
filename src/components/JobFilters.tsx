import { useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { JobDB } from '@/hooks/useJobs';
import { formatNPR } from '@/lib/utils';

export interface JobFilterState {
  location: string; // 'all' or specific
  shifts: string[]; // selected shift labels
  salary: [number, number];
}

export const SHIFT_OPTIONS = ['Morning', 'Day', 'Night', 'Flexible'];

export function buildDefaultFilters(jobs: JobDB[]): JobFilterState {
  const max = Math.max(100000, ...jobs.map((j) => Number(j.salary_max) || 0));
  return { location: 'all', shifts: [], salary: [0, Math.ceil(max / 5000) * 5000] };
}

interface Props {
  jobs: JobDB[];
  filters: JobFilterState;
  onChange: (next: JobFilterState) => void;
}

export function JobFilters({ jobs, filters, onChange }: Props) {
  const locations = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => { if (j.location) set.add(j.location); });
    return Array.from(set).sort();
  }, [jobs]);

  const maxSalary = useMemo(
    () => Math.max(100000, ...jobs.map((j) => Number(j.salary_max) || 0)),
    [jobs]
  );

  const activeCount =
    (filters.location !== 'all' ? 1 : 0) +
    (filters.shifts.length > 0 ? 1 : 0) +
    (filters.salary[0] > 0 || filters.salary[1] < maxSalary ? 1 : 0);

  const reset = () => onChange(buildDefaultFilters(jobs));

  const toggleShift = (s: string) => {
    const next = filters.shifts.includes(s)
      ? filters.shifts.filter((x) => x !== s)
      : [...filters.shifts, s];
    onChange({ ...filters, shifts: next });
  };

  const body = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Location</Label>
        <Select value={filters.location} onValueChange={(v) => onChange({ ...filters, location: v })}>
          <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Shift type</Label>
        <div className="grid grid-cols-2 gap-2">
          {SHIFT_OPTIONS.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={filters.shifts.includes(s)} onCheckedChange={() => toggleShift(s)} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salary range</Label>
          <span className="text-xs text-muted-foreground">
            {formatNPR(filters.salary[0])} – {formatNPR(filters.salary[1])}
          </span>
        </div>
        <Slider
          min={0}
          max={maxSalary}
          step={1000}
          value={filters.salary}
          onValueChange={(v) => onChange({ ...filters, salary: [v[0], v[1]] as [number, number] })}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop inline panel */}
      <div className="hidden lg:block bg-card rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Filters</span>
            {activeCount > 0 && <Badge variant="secondary" className="text-xs">{activeCount}</Badge>}
          </div>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-xs h-7 gap-1">
              <X className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">{body}</div>
      </div>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4" />
              Filters
              {activeCount > 0 && <Badge variant="secondary" className="text-xs ml-1">{activeCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter jobs</SheetTitle>
            </SheetHeader>
            <div className="py-4">{body}</div>
            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">Reset</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
