export type Branch = 'low' | 'mid' | 'high';

export type Stage =
  | 'intro'
  | 'scale_question'
  // low branch (score 1–2)
  | 'explore_helping'
  | 'strengths_amplify'
  | 'future_maintenance'
  // mid branch (score 3–4)
  | 'explore_variability'
  | 'exceptions_mid'
  | 'small_shifts'
  // high branch (score 5–6)
  | 'safety_check'
  | 'exceptions_high'
  | 'strengths_high'
  | 'next_steps_high'
  // shared end
  | 'observations_offer'
  | 'step_confirmation'
  | 'summary';

export type Message = {
  id: string;
  role: 'bot' | 'user';
  content: string;
};
