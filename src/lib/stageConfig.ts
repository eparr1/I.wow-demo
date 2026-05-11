import type { Stage, Branch } from '../types';

export function getBranch(score: number): Branch {
  if (score <= 2) return 'low';
  if (score <= 4) return 'mid';
  return 'high';
}

export const BRANCH_STAGES: Record<Branch, Stage[]> = {
  low: ['explore_helping', 'strengths_amplify', 'future_maintenance', 'observations_offer', 'step_confirmation', 'summary'],
  mid: ['explore_variability', 'exceptions_mid', 'small_shifts', 'observations_offer', 'step_confirmation', 'summary'],
  high: ['safety_check', 'exceptions_high', 'strengths_high', 'next_steps_high', 'observations_offer', 'step_confirmation', 'summary'],
};

export const BRANCH_OPENING: Record<Branch, { validation: string; question: string }> = {
  low: {
    validation: "That's good to hear — a score like that suggests things are generally feeling manageable.",
    question: "What do you think has been helping keep things feeling steady?",
  },
  mid: {
    validation: "That sounds like it's been quite up and down — manageable at some points, but heavier at others.",
    question: "What has felt most difficult about that recently?",
  },
  high: {
    validation: "Thank you for sharing that with me — a score like that tells me things have been quite a stretch lately.",
    question: "When things have been feeling this stretched, it can help to check what support is around you. Do you feel like there's anyone at work you could talk to — a manager, colleague, HR, occupational health, or EAP?",
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
  observations_offer: 90,
  step_confirmation: 95,
  summary: 100,
};
