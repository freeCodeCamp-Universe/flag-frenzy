import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

type ButtonIntent = 'primary' | 'secondary';

type MotionButtonProps = PropsWithChildren<{
  intent: ButtonIntent;
}>;

const intentClassNames: Record<ButtonIntent, string> = {
  primary: 'border-fcc-cta bg-fcc-cta text-fcc-background',
  secondary:
    'border-fcc-highlight bg-fcc-surface text-fcc-foreground hover:bg-fcc-panel',
};

export function MotionButton({ children, intent }: MotionButtonProps) {
  return (
    <motion.button
      className={[
        'min-h-12 rounded border px-5 py-3 font-mono font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-panel',
        intentClassNames[intent],
      ].join(' ')}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      type="button"
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
