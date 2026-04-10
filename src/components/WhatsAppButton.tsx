import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppButtonProps {
  phone: string;
  name?: string;
  size?: 'sm' | 'icon';
}

function cleanPhone(phone: string) {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  // Nepal numbers: add country code if missing
  if (cleaned.startsWith('98') || cleaned.startsWith('97')) {
    cleaned = '977' + cleaned;
  }
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  return cleaned;
}

export function WhatsAppButton({ phone, name, size = 'icon' }: WhatsAppButtonProps) {
  const cleaned = cleanPhone(phone);
  const waUrl = `https://wa.me/${cleaned}${name ? `?text=Hello ${encodeURIComponent(name)}` : ''}`;
  const callUrl = `tel:${phone}`;

  return (
    <span className="inline-flex gap-0.5">
      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950" asChild title="WhatsApp">
        <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" asChild title="Call">
        <a href={callUrl} onClick={e => e.stopPropagation()}>
          <Phone className="h-3.5 w-3.5" />
        </a>
      </Button>
    </span>
  );
}
