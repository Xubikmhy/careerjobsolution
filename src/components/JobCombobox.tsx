import { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { JobDB } from '@/hooks/useJobs';

interface Props {
  jobs: JobDB[];
  value: string;
  onChange: (jobId: string) => void;
  placeholder?: string;
  /** Restrict to certain statuses; defaults to ['Open'] */
  statuses?: string[];
}

/**
 * Searchable picker for jobs/interview places.
 * Searches by role, company, location, and contact person.
 */
export function JobCombobox({
  jobs,
  value,
  onChange,
  placeholder = 'Search & select place...',
  statuses = ['Open'],
}: Props) {
  const [open, setOpen] = useState(false);

  const filtered = jobs.filter((j) => statuses.includes(j.status));
  const selected = filtered.find((j) => j.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">
              <span className="font-medium">{selected.role_title}</span>
              <span className="text-muted-foreground"> — {selected.company_name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            // itemValue is the searchable text we attach below
            return itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Type to search company, role, location..." />
          <CommandList>
            <CommandEmpty>No matching place found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((j) => {
                const search = [
                  j.role_title,
                  j.company_name,
                  j.location || '',
                  j.employer_location || '',
                  j.contact_person || '',
                  ...(j.required_skills || []),
                ].join(' ');
                return (
                  <CommandItem
                    key={j.id}
                    value={search}
                    onSelect={() => {
                      onChange(j.id);
                      setOpen(false);
                    }}
                    className="flex items-start gap-2"
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 mt-1 shrink-0',
                        value === j.id ? 'opacity-100 text-primary' : 'opacity-0',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{j.role_title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {j.company_name}
                        {j.location ? ` • ${j.location}` : ''}
                      </p>
                      <p className="text-xs text-success">
                        NPR {j.salary_min.toLocaleString()} - {j.salary_max.toLocaleString()}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
