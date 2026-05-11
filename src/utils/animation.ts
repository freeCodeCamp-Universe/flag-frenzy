import type { Variants } from 'framer-motion';

export const quickEase = [0.2, 0, 0, 1] as const;

export const feedbackTransition = {
  duration: 0.28,
  ease: quickEase,
} as const;

export const screenTransition = {
  duration: 0.24,
  ease: quickEase,
} as const;

export const feedbackVariants: Variants = {
  correct: {
    boxShadow: '0 0 0 2px rgba(172, 209, 87, 0.55)',
    scale: 1,
    x: 0,
  },
  incorrect: {
    boxShadow: '0 0 0 2px rgba(255, 173, 173, 0.5)',
    x: [0, -6, 6, -3, 3, 0],
  },
  pending: {
    boxShadow: '0 0 0 0 rgba(172, 209, 87, 0)',
    scale: 1,
    x: 0,
  },
};

export const checkmarkVariants: Variants = {
  hidden: {
    opacity: 0,
    rotate: -20,
    scale: 0.4,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.18,
      ease: quickEase,
    },
  },
};

export const hintVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -4,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: screenTransition,
  },
};

export const levelAdvanceVariants: Variants = {
  enter: {
    opacity: 0,
    x: 24,
  },
  center: {
    opacity: 1,
    x: 0,
    transition: screenTransition,
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: {
      duration: 0.18,
      ease: quickEase,
    },
  },
};

export const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: screenTransition,
  },
};

export const statPulseVariants: Variants = {
  changed: {
    scale: [1, 1.04, 1],
    transition: {
      duration: 0.22,
      ease: quickEase,
    },
  },
  stable: {
    scale: 1,
  },
};

export function getAnimationTransition(duration: number) {
  return {
    duration,
    ease: quickEase,
  } as const;
}
