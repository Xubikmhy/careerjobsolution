import { useState } from 'react';
import { Copy, Check, Phone, MessageCircle, ExternalLink, Briefcase, GraduationCap } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, getStatusVariant } from './StatusBadge';
import { SkillTagList } from './SkillTag';
import { WhatsAppTemplatesMenu } from './WhatsAppTemplatesMenu';
import { CandidateDB } from '@/hooks/useCandidates';
import { formatNPR, normalizePhone } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  candidate: CandidateDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFullProfile?: (c: CandidateDB) => void;
}

export function CandidateQuickView({ candidate, open, onOpenChange, onOpenFullProfile }: Props) {
  const [copied, setCopied] = useState(false);

  if (!candidate) return null;

  const cleaned = normalizePhone(candidate.phone);
  const waUrl = `https://wa.me/${cleaned}?text=${encodeURIComponent(`Hi ${candidate.full_name}, regarding your profile...`)}`;
  const callUrl = `tel:${candidate.phone}`;

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(candidate.phone);
      setCopied(true);
      toast.success('Phone copied');
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Could not copy phone');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{candidate.full_name}</span>
            <StatusBadge status={candidate.status} variant={getStatusVariant(candidate.status)} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phone row */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-sm truncate">{candidate.phone}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={copyPhone}
                title="Copy phone"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-success" asChild title="WhatsApp">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild title="Call">
                <a href={callUrl}><Phone className="h-4 w-4" /></a>
              </Button>
              <WhatsAppTemplatesMenu phone={candidate.phone} name={candidate.full_name} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Briefcase className="h-3.5 w-3.5" /> Experience
              </div>
              <p className="font-semibold mt-1">{candidate.experience_years} yrs</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                Expected salary
              </div>
              <p className="font-semibold mt-1 text-success">{formatNPR(candidate.expected_salary)}</p>
            </div>
          </div>

          {candidate.education_level && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Education:</span>
              <span>{candidate.education_level}</span>
            </div>
          )}

          {candidate.address && (
            <div className="text-sm">
              <span className="text-muted-foreground">Location: </span>
              <span>{candidate.address}</span>
            </div>
          )}

          {(candidate.skills?.length || 0) > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Top skills</p>
              <SkillTagList skills={candidate.skills.slice(0, 5)} max={5} />
            </div>
          )}

          {candidate.languages && candidate.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {candidate.languages.map((l) => (
                <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          {onOpenFullProfile && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => { onOpenChange(false); onOpenFullProfile(candidate); }}
            >
              <ExternalLink className="h-4 w-4" />
              Open full profile
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
