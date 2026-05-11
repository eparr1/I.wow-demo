import type { Stage } from '../types';
import { mockResponses } from './mockResponses';

const USE_AI = true;

const NO_SUPPORT_KEYWORDS = [
  'no',
  'not really',
  'nobody',
  'none',
  "don't have",
  "haven't",
  'no one',
  'nope',
  'not sure',
];

function hasNoSupport(message: string): boolean {
  const lower = message.toLowerCase();
  return NO_SUPPORT_KEYWORDS.some((kw) => lower.includes(kw));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// -----------------------------
// System Prompt — defines character once, keeps user prompts short
// -----------------------------
const SYSTEM_PROMPT = `You are I.WOW, a warm and reflective workplace wellbeing assistant.

Your approach is solution-focused — you're genuinely curious about what's working, what's helped, and what small steps feel possible. You speak like a thoughtful human colleague, not a clinician or a chatbot running through a checklist.

How you respond:
- Always pick up on something specific the person actually said — a word they used, something they described. Never respond generically.
- Reflect first, then ask. Keep it to 2 to 3 sentences total.
- Your reflection should feel like you genuinely heard them, not like a paraphrase.
- The question you ask should flow naturally from what they said — you can rephrase it slightly to fit, but keep its meaning intact.
- Use natural, conversational language. No bullet points, no clinical phrasing, no repeating phrases from earlier in the conversation.
- Never add extra questions beyond the one you've been given to ask.`;

// -----------------------------
// Per-stage config
// -----------------------------
const AI_STAGE_CONFIG: Partial<
  Record<Stage, { goal: string; tone: string; nextQuestion: string }>
> = {
  explore_helping: {
    goal: 'surface what has been keeping things stable',
    tone: 'warm and affirming',
    nextQuestion:
      'Are there any small habits, boundaries, or ways of working that are helping with that?',
  },
  strengths_amplify: {
    goal: 'amplify identified strengths and habits',
    tone: 'affirming and grounded',
    nextQuestion: 'How could you keep that going over the next few weeks?',
  },
  future_maintenance: {
    goal: 'acknowledge what they shared and close warmly — no further question',
    tone: 'warm and appreciative',
    nextQuestion:
      "Just noticing what's been working is a form of resilience. Thank you for taking the time to reflect today.",
  },
  explore_variability: {
    goal: 'identify what influences wellbeing positively',
    tone: 'curious and warm',
    nextQuestion: 'Are there times when it feels a bit more manageable?',
  },
  exceptions_mid: {
    goal: 'build on exception moments to find leverage for change',
    tone: 'curious and hopeful',
    nextQuestion:
      'Even small shifts can matter here... What might move it just one point lower on that scale?',
  },
  small_shifts: {
    goal: 'affirm the small shift and close warmly — no further question',
    tone: 'warm and grounding',
    nextQuestion:
      "Thank you for reflecting on this today. Even the awareness you've brought to it matters.",
  },
  safety_check: {
    goal: 'acknowledge their support situation warmly, signpost if needed, then explore exceptions',
    tone: 'careful, warm, non-alarmist',
    nextQuestion:
      'Has there been a point in the last few months, even just a week or a few days, when work felt slightly more manageable? What was different then?',
  },
  exceptions_high: {
    goal: 'explore what made that exception period feel more manageable — workload, people, or ways of working',
    tone: 'curious and engaged',
    nextQuestion:
      'Was it something about the workload, the people around you, how you were working — or something else? What do you think made the difference?',
  },
  strengths_high: {
    goal: 'affirm the insight about what helps and invite one small actionable step',
    tone: 'affirming and grounding',
    nextQuestion:
      "What's one small thing you could try to do this week, even something minor, that might create a bit more of that for yourself at work?",
  },
  next_steps_high: {
    goal: 'affirm the small step and close warmly — no further question',
    tone: 'warm and appreciative',
    nextQuestion:
      "That sounds like a thoughtful and grounded step — even something small can shift how a week feels. Thank you for talking this through with me.",
  },
};

// -----------------------------
// Prompt Builder — leaner user prompt now that character lives in system
// -----------------------------
export function buildAIPrompt(
  stage: Stage,
  userMessage: string,
  noSupport?: boolean
): string {
  const config = AI_STAGE_CONFIG[stage];
  if (!config) return '';

  const safetyNote =
    stage === 'safety_check' && noSupport
      ? `\nNote: this person has indicated they don't feel supported at work. Before moving to the next question, gently acknowledge that and let them know their EAP or occupational health team is there for moments like this — keep it brief and non-alarming.\n`
      : '';

  return `Your goal for this moment: ${config.goal}
Tone: ${config.tone}
${safetyNote}
The person just said:
"""${userMessage}"""

Respond by reflecting something specific from what they said, then ask this question — you can rephrase it slightly so it flows naturally, but keep the meaning:
"${config.nextQuestion}"`;
}

// -----------------------------
// Fallback
// -----------------------------
function fallbackMock(stage: Stage, userMessage: string): string {
  if (stage === 'safety_check') {
    const key = hasNoSupport(userMessage)
      ? 'safety_check_no_support'
      : 'safety_check_support';
    return pickRandom(mockResponses[key]);
  }
  const responses = mockResponses[stage as keyof typeof mockResponses];
  return responses ? pickRandom(responses) : '';
}

// -----------------------------
// Main Response Handler
// -----------------------------
export async function getBotResponse(
  stage: Stage,
  userMessage: string
): Promise<string> {
  if (!USE_AI) {
    const responses = mockResponses[stage as keyof typeof mockResponses];
    if (!responses) return '';
    return pickRandom(responses);
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) {
    console.error('Missing VITE_OPENAI_API_KEY in .env');
    return fallbackMock(stage, userMessage);
  }

  const noSupport = stage === 'safety_check' ? hasNoSupport(userMessage) : undefined;
  const prompt = buildAIPrompt(stage, userMessage, noSupport);
  if (!prompt) return fallbackMock(stage, userMessage);

  console.log('[I.WOW DEBUG]', { stage, userMessage, prompt });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 150,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('OpenAI error', res.status, data);
      return fallbackMock(stage, userMessage);
    }

    const content = data.choices?.[0]?.message?.content as string | null;
    if (!content) {
      console.warn('OpenAI returned null content', data);
      return fallbackMock(stage, userMessage);
    }

    return content;
  } catch (err) {
    console.error('getBotResponse fetch failed', err);
    return fallbackMock(stage, userMessage);
  }
}