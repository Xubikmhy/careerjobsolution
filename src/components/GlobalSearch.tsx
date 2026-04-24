import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, UserCheck, Trophy, Home, Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useVisitors } from '@/hooks/useVisitors';
import { usePlacements } from '@/hooks/usePlacements';
import { useProperties } from '@/hooks/useProperties';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { candidates } = useCandidates();
  const { jobs } = useJobs();
  const { visitors } = useVisitors();
  const { placements } = usePlacements();
  const { properties } = useProperties();
  const [query, setQuery] = useState('');

  // Reset query when closing
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search candidates, jobs, visitors, placements, properties..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick navigation */}
        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => go('/')}>
            <Search className="h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go('/candidates')}>
            <Users className="h-4 w-4" /> All Candidates
          </CommandItem>
          <CommandItem onSelect={() => go('/jobs')}>
            <Briefcase className="h-4 w-4" /> Job Openings
          </CommandItem>
          <CommandItem onSelect={() => go('/visitors')}>
            <UserCheck className="h-4 w-4" /> Visitors
          </CommandItem>
          <CommandItem onSelect={() => go('/placements')}>
            <Trophy className="h-4 w-4" /> Placements
          </CommandItem>
        </CommandGroup>

        {candidates.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Candidates">
              {candidates.slice(0, 50).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`candidate ${c.full_name} ${c.phone} ${(c.skills || []).join(' ')} ${c.address || ''}`}
                  onSelect={() => go('/candidates')}
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{c.full_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {c.phone} · {c.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {jobs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Jobs">
              {jobs.slice(0, 50).map((j) => (
                <CommandItem
                  key={j.id}
                  value={`job ${j.role_title} ${j.company_name} ${j.location || ''} ${(j.required_skills || []).join(' ')}`}
                  onSelect={() => go('/jobs')}
                >
                  <Briefcase className="h-4 w-4 text-warning" />
                  <span className="font-medium">{j.role_title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {j.company_name} · {j.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {visitors.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Visitors">
              {visitors.slice(0, 30).map((v) => (
                <CommandItem
                  key={v.id}
                  value={`visitor ${v.full_name} ${v.phone} ${(v.skills || []).join(' ')}`}
                  onSelect={() => go('/visitors')}
                >
                  <UserCheck className="h-4 w-4 text-success" />
                  <span className="font-medium">{v.full_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{v.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {placements.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Placements">
              {placements.slice(0, 30).map((p) => (
                <CommandItem
                  key={p.id}
                  value={`placement ${p.candidate_name || ''} ${p.job_title || ''} ${p.employer_name || ''}`}
                  onSelect={() => go('/placements')}
                >
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="font-medium">{p.candidate_name || 'Unnamed'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {p.employer_name || p.job_title}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {properties.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Properties">
              {properties.slice(0, 30).map((p) => (
                <CommandItem
                  key={p.id}
                  value={`property ${p.landlord_name} ${p.location || ''} ${p.type}`}
                  onSelect={() => go('/properties')}
                >
                  <Home className="h-4 w-4 text-primary" />
                  <span className="font-medium">{p.type}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {p.location} · {p.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
