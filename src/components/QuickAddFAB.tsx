import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, UserCheck, Briefcase, Trophy, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: typeof Plus;
  to: string;
  color: string;
}

const actions: QuickAction[] = [
  { label: 'Add Candidate', icon: Users, to: '/candidates?action=add', color: 'bg-primary text-primary-foreground' },
  { label: 'Add Visitor', icon: UserCheck, to: '/visitors?action=add', color: 'bg-success text-white' },
  { label: 'Post Job', icon: Briefcase, to: '/jobs?action=add', color: 'bg-warning text-white' },
  { label: 'Record Placement', icon: Trophy, to: '/placements?action=add', color: 'bg-accent text-accent-foreground' },
  { label: 'Add Property', icon: Home, to: '/properties?action=add', color: 'bg-secondary text-secondary-foreground' },
];

export function QuickAddFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Action menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open &&
            actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, scale: 0.5, y: 20, transition: { delay: (actions.length - i - 1) * 0.02 } }}
                onClick={() => handleAction(action.to)}
                className="flex items-center gap-3 group"
              >
                <span className="px-3 py-1.5 bg-card text-card-foreground text-sm font-medium rounded-lg shadow-lg border border-border whitespace-nowrap">
                  {action.label}
                </span>
                <span
                  className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110',
                    action.color
                  )}
                >
                  <action.icon className="h-5 w-5" />
                </span>
              </motion.button>
            ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className={cn(
            'h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-transform',
            open && 'rotate-45'
          )}
          aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.button>
      </div>
    </>
  );
}
