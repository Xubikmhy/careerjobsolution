import { useEffect, useRef, useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string | number | null | undefined;
  onSave: (next: string) => Promise<unknown> | unknown;
  type?: 'text' | 'number';
  display?: (v: string | number | null | undefined) => React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  title?: string;
  /** Stop propagation so it works inside clickable cards/rows */
  stopPropagation?: boolean;
}

/**
 * Click-to-edit field. Shows display value with a pencil; click opens an inline
 * input with Save/Cancel. Esc cancels, Enter saves.
 */
export function InlineEdit({
  value,
  onSave,
  type = 'text',
  display,
  placeholder,
  disabled,
  className,
  inputClassName,
  title = 'Click to edit',
  stopPropagation = true,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value ?? ''));
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const stop = (e: React.SyntheticEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const cancel = (e?: React.SyntheticEvent) => {
    e && stop(e);
    setDraft(String(value ?? ''));
    setEditing(false);
  };

  const save = async (e?: React.SyntheticEvent) => {
    e && stop(e);
    if (String(value ?? '') === draft.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (disabled) {
    return (
      <span className={cn('text-sm', className)}>
        {display ? display(value) : (value ?? '—')}
      </span>
    );
  }

  if (editing) {
    return (
      <span
        className={cn('inline-flex items-center gap-1', className)}
        onClick={stop}
      >
        <Input
          ref={inputRef}
          type={type}
          value={draft}
          placeholder={placeholder}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save(e);
            else if (e.key === 'Escape') cancel(e);
          }}
          onClick={stop}
          className={cn('h-7 px-2 py-1 text-sm w-28', inputClassName)}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="p-1 rounded hover:bg-success/10 text-success"
          title="Save"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        stop(e);
        setEditing(true);
      }}
      title={title}
      className={cn(
        'group inline-flex items-center gap-1 rounded px-1 -mx-1 hover:bg-muted/60 transition-colors text-left',
        className
      )}
    >
      <span>{display ? display(value) : (value ?? placeholder ?? '—')}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 text-muted-foreground" />
    </button>
  );
}
