import type { Stage, Branch } from '../types';

export function getBranch(score: number): Branch {
  if (score <= 2) return 'low';
  if (score <= 4) return 'mid';
  return 'high';
}

export const BRANCH_STAGES: Record<Branch, Stage[]> = {
  low: ['explore_helping', 'strengths_amplify', 'future_maintenance', 'observations_offer', 'step_confirmation', 'summary'],
  mid: ['explore_variability', 'exceptions_mid', 'small_shifts', 'observations_offer', 'step_confirmation', 'summary'],
  high: ['explore_high', 'exceptions_high', 'support_check', 'strengths_high', 'next_steps_high', 'observations_offer', 'step_confirmation', 'summary'],
};

export const BRANCH_OPENING: Record<Branch, { validation: string; question: string }> = {
  low: {
    validation: "A score like that suggests things have been fairly steady — let's explore what's been keeping them that way.",
    question: "What's been keeping things feeling steady for you day to day?",
  },
  mid: {
    validation: "That sounds like it's been quite up and down — manageable at some points, but heavier at others.",
    question: "What tends to make the difference between a better day and a harder one?",
  },
  high: {
    validation: "A score like that tells me it's been a real stretch lately — thank you for being honest about that.",
    question: "What's been the hardest part of it lately?",
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
  explore_high: 30,
  exceptions_high: 43,
  support_check: 55,
  strengths_high: 65,
  next_steps_high: 78,
  observations_offer: 90,
  step_confirmation: 95,
  summary: 100,
};
