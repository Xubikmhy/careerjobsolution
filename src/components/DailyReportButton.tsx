import { useState } from 'react';
import { MessageCircle, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { formatNPR } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayDateOnly() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

async function buildReport(agencyName: string): Promise<string> {
  const sinceTs = startOfTodayISO();
  const today = todayDateOnly();

  const [
    newCandidates,
    newJobs,
    newVisitors,
    interviews,
    placementsToday,
    activeCandidates,
    openJobs,
  ] = await Promise.all([
    supabase.from('candidates').select('full_name, phone, skills').gte('created_at', sinceTs),
    supabase.from('job_requirements').select('role_title, company_name, location').gte('created_at', sinceTs),
    supabase.from('visitors').select('full_name, phone').gte('created_at', sinceTs),
    supabase
      .from('candidate_activities')
      .select('candidate_id, placed_at, status, candidates(full_name)')
      .eq('activity_type', 'interview')
      .gte('created_at', sinceTs),
    supabase
      .from('placements')
      .select('candidate_name, job_title, employer_name, commission_amount')
      .eq('placed_date', today),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('job_requirements').select('id', { count: 'exact', head: true }).eq('status', 'Open'),
  ]);

  const c = newCandidates.data || [];
  const j = newJobs.data || [];
  const v = newVisitors.data || [];
  const i = (interviews.data as any[]) || [];
  const p = placementsToday.data || [];
  const commissionToday = p.reduce((s, x: any) => s + (Number(x.commission_amount) || 0), 0);

  const dateStr = format(new Date(), 'EEE, MMM d, yyyy');

  const lines: string[] = [];
  lines.push(`*${agencyName} — Daily Report*`);
  lines.push(`📅 ${dateStr}`);
  lines.push('');
  lines.push(`*📊 Summary*`);
  lines.push(`• New Candidates: ${c.length}`);
  lines.push(`• New Vacancies: ${j.length}`);
  lines.push(`• Walk-in Visitors: ${v.length}`);
  lines.push(`• Sent for Interview: ${i.length}`);
  lines.push(`• Placements Today: ${p.length}`);
  lines.push(`• Commission Earned: ${formatNPR(commissionToday)}`);
  lines.push(`• Active Candidates: ${activeCandidates.count ?? 0}`);
  lines.push(`• Open Vacancies: ${openJobs.count ?? 0}`);

  if (c.length) {
    lines.push('');
    lines.push(`*🧑 New Candidates (${c.length})*`);
    c.slice(0, 15).forEach((x: any, idx) => {
      const skill = (x.skills && x.skills[0]) || '—';
      lines.push(`${idx + 1}. ${x.full_name} — ${skill} — ${x.phone}`);
    });
    if (c.length > 15) lines.push(`…and ${c.length - 15} more`);
  }

  if (j.length) {
    lines.push('');
    lines.push(`*💼 New Vacancies (${j.length})*`);
    j.slice(0, 15).forEach((x: any, idx) => {
      lines.push(`${idx + 1}. ${x.role_title} @ ${x.company_name}${x.location ? ` (${x.location})` : ''}`);
    });
    if (j.length > 15) lines.push(`…and ${j.length - 15} more`);
  }

  if (i.length) {
    lines.push('');
    lines.push(`*🎯 Sent for Interview (${i.length})*`);
    i.slice(0, 15).forEach((x: any, idx) => {
      const name = x.candidates?.full_name || 'Candidate';
      lines.push(`${idx + 1}. ${name}${x.placed_at ? ` → ${x.placed_at}` : ''}`);
    });
  }

  if (p.length) {
    lines.push('');
    lines.push(`*🏆 Placements (${p.length})*`);
    p.forEach((x: any, idx) => {
      lines.push(`${idx + 1}. ${x.candidate_name} → ${x.job_title} @ ${x.employer_name}`);
    });
  }

  if (v.length) {
    lines.push('');
    lines.push(`*🚶 Walk-ins (${v.length})*`);
    v.slice(0, 10).forEach((x: any, idx) => {
      lines.push(`${idx + 1}. ${x.full_name} — ${x.phone}`);
    });
  }

  lines.push('');
  lines.push(`— ${agencyName}`);

  return lines.join('\n');
}

export function DailyReportButton() {
  const { settings } = useAgencySettings();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const report = await buildReport(settings?.agency_name || 'Career Job Solution');
      setText(report);
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsApp = () => {
    // wa.me without phone lets user pick a contact/group
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Report copied');
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <>
      <Button
        onClick={generate}
        disabled={loading}
        className="gap-2 bg-success text-success-foreground hover:bg-success/90"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
        Send Daily Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Daily Report Preview</DialogTitle>
          </DialogHeader>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            className="font-mono text-xs"
          />
          <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={copy} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
            <Button onClick={sendWhatsApp} className="gap-2 bg-success text-success-foreground hover:bg-success/90">
              <MessageCircle className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
