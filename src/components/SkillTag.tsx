import { cn } from '@/lib/utils';

interface SkillTagProps {
  skill: string;
  className?: string;
  onRemove?: () => void;
}

export function SkillTag({ skill, className, onRemove }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border transition-colors',
        className
      )}
    >
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:text-destructive transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}

interface SkillTagListProps {
  skills: string[];
  max?: number;
  className?: string;
}

export function SkillTagList({ skills, max = 3, className }: SkillTagListProps) {
  const displaySkills = max ? skills.slice(0, max) : skills;
  const remaining = skills.length - displaySkills.length;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displaySkills.map((skill) => (
        <SkillTag key={skill} skill={skill} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-muted-foreground">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
