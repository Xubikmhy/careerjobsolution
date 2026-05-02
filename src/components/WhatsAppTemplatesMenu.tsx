import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { normalizePhone } from '@/lib/utils';

export interface WhatsAppTemplate {
  id: string;
  label: string;
  build: (ctx: { name: string; agency: string }) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'initial',
    label: 'Initial outreach',
    build: ({ name, agency }) =>
      `Hi ${name}, this is ${agency}. We have a job that matches your profile. Are you still job-seeking? Reply YES to know more.`,
  },
  {
    id: 'interview',
    label: 'Interview invitation',
    build: ({ name, agency }) =>
      `Hi ${name}, ${agency} here. We've shortlisted you for an interview. Please share a convenient date & time so we can coordinate with the employer.`,
  },
  {
    id: 'followup',
    label: 'Follow-up after interview',
    build: ({ name, agency }) =>
      `Hi ${name}, hope your interview went well. This is ${agency} — please share a quick update so we can take it forward with the employer. Thank you!`,
  },
];

interface Props {
  phone: string;
  name: string;
  size?: 'sm' | 'icon';
  className?: string;
}

export function WhatsAppTemplatesMenu({ phone, name, size = 'icon', className }: Props) {
  const { settings } = useAgencySettings();
  const agency = settings?.agency_name || 'Career Job Solution';
  const cleaned = normalizePhone(phone);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'icon' ? 'icon' : 'sm'}
          className={`h-7 ${size === 'icon' ? 'w-7' : 'px-2'} text-success hover:text-success hover:bg-success/10 ${className || ''}`}
          title="Send WhatsApp template"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          {size !== 'icon' && <span className="ml-1 text-xs">Templates</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs">WhatsApp templates</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {WHATSAPP_TEMPLATES.map((t) => {
          const text = t.build({ name, agency });
          const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
          return (
            <DropdownMenuItem key={t.id} asChild>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">{text}</span>
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
