import type { Stage, Branch } from '../types';

export function getBranch(score: number): Branch {
  if (score <= 2) return 'low';
  if (score <= 4) return 'mid';
  return 'high';
}

export const BRANCH_STAGES: Record<Branch, Stage[]> = {
  low: ['explore_helping', 'strengths_amplify', 'future_maintenance', 'summary'],
  mid: ['explore_variability', 'exceptions_mid', 'small_shifts', 'summary'],
  high: ['safety_check', 'exceptions_high', 'strengths_high', 'next_steps_high', 'summary'],
};

export const BRANCH_OPENING: Record<Branch, { validation: string; question: string }> = {
  low: {
    validation: "That's good to hear — a score like that suggests things are generally feeling manageable.",
    question: "What do you think has been helping keep things feeling steady?",
  },
  mid: {
    validation: "Sounds like it's been up and down — a score in the middle often means it varies depending on the week.",
    question: " What has felt the most difficult about that?",
  },
  high: {
    validation: "Thank you for sharing that with me — a score like that tells me things have been quite a stretch lately.",
    question: "When you're running this close to empty, it's worth asking — do you feel like you have any support around you at work right now? A manager, a colleague, or someone in HR you could talk to?",
  },
};

export const STAGE_PROGRESS: Record<Stage, number> = {
  intro: 0,
  scale_question: 15,
  explore_helping: 35,
  strengths_amplify: 55,
  future_maintenance: 75,
  explore_variability: 35,
  exceptions_mid: 55,
  small_shifts: 75,
  safety_check: 30,
  exceptions_high: 50,
  strengths_high: 65,
  next_steps_high: 80,
  summary: 100,
};
