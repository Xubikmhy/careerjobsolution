import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizePhone } from '@/lib/utils';

interface WhatsAppButtonProps {
  phone: string;
  name?: string;
  /** Override the default WhatsApp message body */
  message?: string;
  size?: 'sm' | 'icon';
}

export function WhatsAppButton({ phone, name, message, size = 'icon' }: WhatsAppButtonProps) {
  const cleaned = normalizePhone(phone);
  const defaultMsg = name ? `Hi ${name}, regarding your profile...` : '';
  const text = message ?? defaultMsg;
  const waUrl = `https://wa.me/${cleaned}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  const callUrl = `tel:${phone}`;

  return (
    <span className="inline-flex gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
        asChild
        title="WhatsApp"
      >
        <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-primary hover:bg-primary/10"
        asChild
        title="Call"
      >
        <a href={callUrl} onClick={e => e.stopPropagation()}>
          <Phone className="h-3.5 w-3.5" />
        </a>
      </Button>
    </span>
  );
}
