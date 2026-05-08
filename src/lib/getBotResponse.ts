import type { Stage } from '../types';
import { mockResponses } from './mockResponses';

// Toggle to true and add API key / backend proxy to enable real AI responses
const USE_AI = false;

// Keywords that suggest the user lacks workplace support
const NO_SUPPORT_KEYWORDS = ['no', 'not really', 'nobody', 'none', "don't have", "haven't", 'no one', 'nope', 'not sure', 'nobody'];

function hasNoSupport(message: string): boolean {
  const lower = message.toLowerCase();
  return NO_SUPPORT_KEYWORDS.some((kw) => lower.includes(kw));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Per-stage config used to build the AI prompt — one call per stage, cost-efficient
const AI_STAGE_CONFIG: Partial<Record<Stage, { goal: string; tone: string; nextQuestion: string }>> = {
  explore_helping: {
    goal: 'surface what has been keeping things stable',
    tone: 'warm and affirming',
    nextQuestion: 'Are there any small habits, boundaries, or ways of working that are helping with that?',
  },
  strengths_amplify: {
    goal: 'amplify identified strengths and habits',
    tone: 'affirming and grounded',
    nextQuestion: 'How could you keep that going over the next few weeks?',
  },
  future_maintenance: {
    goal: 'acknowledge progress and close warmly — no further question needed',
    tone: 'warm and appreciative',
    nextQuestion: 'Before we close — just noticing what works is a form of resilience. Thank you for taking the time to reflect today.',
  },
  explore_variability: {
    goal: 'identify what influences wellbeing positively',
    tone: 'curious and warm',
    nextQuestion: 'Are there times when it feels a bit more manageable?',
  },
  exceptions_mid: {
    goal: 'build on exception moments to find leverage for change',
    tone: 'curious and hopeful',
    nextQuestion: 'What might move it just one point lower on that scale?',
  },
  small_shifts: {
    goal: 'affirm the small shift and close warmly — no further question needed',
    tone: 'warm and grounding',
    nextQuestion: "Before we close — thank you for reflecting on this today. Even the awareness you've brought to it matters.",
  },
  safety_check: {
    goal: 'acknowledge the support situation and transition gently to exploring exceptions',
    tone: 'careful, warm, non-alarmist',
    nextQuestion: 'Has there been a point in the last few months, even just a week or a few days, when work felt slightly more manageable? What was different then?',
  },
  exceptions_high: {
    goal: 'identify what made a difficult period slightly more manageable',
    tone: 'attentive and curious',
    nextQuestion: 'Was it something about the workload, the people around you, how you were working — or something else? What do you think made the difference?',
  },
  strengths_high: {
    goal: 'surface insight about what helps and move gently toward action',
    tone: 'affirming and gently forward-looking',
    nextQuestion: "What's one small thing you could try to do this week, even something minor, that might create a bit more of that for yourself at work?",
  },
  next_steps_high: {
    goal: 'affirm the commitment and close with warmth — no further question needed',
    tone: 'warm and appreciative',
    nextQuestion: 'Thank you for talking this through with me.',
  },
};

// Used when USE_AI = true — referenced in the commented-out API block below
export function buildAIPrompt(stage: Stage, userMessage: string, noSupport?: boolean): string {
  const config = AI_STAGE_CONFIG[stage];
  if (!config) return '';

  const safetyNote =
    stage === 'safety_check' && noSupport
      ? '\nIMPORTANT: The user has indicated they lack support. Before the next question, briefly and gently signpost occupational health / EAP as an available resource.\n'
      : '';

  return `You are a supportive reflective workplace wellbeing assistant.

Stage goal: ${config.goal}
Tone: ${config.tone}
Max: 2 sentences total
${safetyNote}
Your task:
1. Briefly reflect the user's message
2. Validate gently
3. Transition naturally into the next question below

Rules:
- Maximum 2 sentences
- Do not ask any additional questions beyond the one provided
- Do not change topic
- Do not diagnose
- Stay concise and warm

Next question:
"${config.nextQuestion}"

User message:
"${userMessage}"`;
}

export async function getBotResponse(stage: Stage, userMessage: string): Promise<string> {
  if (!USE_AI) {
    if (stage === 'safety_check') {
      const key = hasNoSupport(userMessage) ? 'safety_check_no_support' : 'safety_check_support';
      return pickRandom(mockResponses[key]);
    }
    const responses = mockResponses[stage as keyof typeof mockResponses];
    if (!responses) return '';
    return pickRandom(responses);
  }

  // --- Real AI call (enable when USE_AI = true) ---
  // Install: npm install @anthropic-ai/sdk
  // Add VITE_ANTHROPIC_API_KEY to .env (or proxy through a backend)
  //
  // import Anthropic from '@anthropic-ai/sdk';
  // const client = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true });
  //
  // const noSupport = stage === 'safety_check' ? hasNoSupport(userMessage) : undefined;
  // const prompt = buildAIPrompt(stage, userMessage, noSupport);
  //
  // const message = await client.messages.create({
  //   model: 'claude-haiku-4-5-20251001',  // cheapest model — sufficient for short reflections
  //   max_tokens: 120,
  //   messages: [{ role: 'user', content: prompt }],
  // });
  // return (message.content[0] as { text: string }).text;

  return '';
}
