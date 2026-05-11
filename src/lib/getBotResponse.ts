import type { Stage, Message } from '../types';
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

const SYSTEM_PROMPT = `You are I.WOW, a warm and genuinely human workplace wellbeing assistant.

You speak like a thoughtful colleague, not a therapist or chatbot. You're curious, unhurried, and focused on what the person is actually experiencing.

How you respond:
- Pick up on something real the person said — a specific word, feeling, or detail. Never respond generically.
- Give yourself 2–3 sentences to genuinely engage with what they shared before moving to the next question. Let the response feel like you actually heard them.
- Your question should feel like it emerged from what they said, not like the next item on a list.
- Keep it conversational and grounded. No bullet points, no clinical phrasing, no repeating phrases from earlier in the conversation.
- If the person's reply is very short or vague, stay with what they gave you — acknowledge it warmly and gently invite them to say a bit more.

Keeping the conversation on track:
- Stay close to the current moment — don't invite the person to go much deeper than the stage calls for, and don't open new emotional topics.
- If the user goes on a tangent or reflects more broadly, engage with it warmly for a sentence or two, then gently bring things back — not a hard redirect, just a natural steering.
- This is a structured check-in, not an open-ended therapy session. Keep responses purposeful and contained — interested, but not expansive.`;

const CLOSING_STAGES: Stage[] = ['future_maintenance', 'small_shifts', 'next_steps_high'];

// Last two stages of each branch — AI should begin slowing pacing here
const TRANSITION_STAGES: Stage[] = [
  'strengths_amplify', 'future_maintenance',   // low branch
  'exceptions_mid',   'small_shifts',           // mid branch
  'strengths_high',   'next_steps_high',        // high branch
];

const AI_STAGE_CONFIG: Partial<Record<Stage, { nextQuestion: string }>> = {
  explore_helping: {
    nextQuestion:
      'Are there any small habits, boundaries, or ways of working that are helping with that?',
  },
  strengths_amplify: {
    nextQuestion: 'How could you keep that going over the next few weeks?',
  },
  future_maintenance: {
    nextQuestion:
      "Just noticing what's been working is a form of resilience. Thank you for taking the time to reflect today.",
  },
  explore_variability: {
    nextQuestion: 'Are there times when it feels a bit more manageable?',
  },
  exceptions_mid: {
    nextQuestion:
      'Even small shifts can matter here — what might move it just one point lower on that scale?',
  },
  small_shifts: {
    nextQuestion:
      "Thank you for reflecting on this today. Even the awareness you've brought to it matters.",
  },
  safety_check: {
    nextQuestion:
      'Has there been a point in the last few months, even just a week or a few days, when work felt slightly more manageable? What was different then?',
  },
  exceptions_high: {
    nextQuestion:
      'Was it something about the workload, the people around you, how you were working — or something else? What do you think made the difference?',
  },
  strengths_high: {
    nextQuestion:
      "What's one small thing you could try to do this week, even something minor, that might create a bit more of that for yourself at work?",
  },
  next_steps_high: {
    nextQuestion:
      "That sounds like a thoughtful and grounded step — even something small can shift how a week feels. Thank you for talking this through with me.",
  },
};

type OpenAIMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function buildMessages(
  stage: Stage,
  userMessage: string,
  history: Message[],
  noSupport?: boolean
): OpenAIMessage[] {
  const config = AI_STAGE_CONFIG[stage];
  if (!config) return [];

  const safetyNote =
    stage === 'safety_check' && noSupport
      ? `\nNote: they've said they don't feel supported at work. Acknowledge that warmly and mention their EAP or occupational health as an option — one brief, non-alarmist sentence — then move to the next question.\n`
      : '';

  const instruction = CLOSING_STAGES.includes(stage)
    ? `For this moment, close the conversation warmly with this thought — do not ask any questions, just end on a grounding note:\n"${config.nextQuestion}"`
    : `For this moment, work this question in naturally — rephrase it so it fits the conversation, but keep its meaning:\n"${config.nextQuestion}"`;

  const transitionNote = TRANSITION_STAGES.includes(stage)
    ? `\nTransition awareness: the conversation is approaching its conclusion. Slow the pacing slightly, keep the tone warm and unhurried, and avoid introducing anything new.\n`
    : '';

  const systemFull = `${SYSTEM_PROMPT}
${safetyNote}${transitionNote}
${instruction}`;

  const historyMessages: OpenAIMessage[] = history.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.content,
  }));

  return [
    { role: 'system', content: systemFull },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];
}

export async function getClosingReflection(
  userMessage: string,
  history: Message[] = []
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return 'Thank you for sharing that.';

  const systemContent = `${SYSTEM_PROMPT}

Reflect briefly on what they just said — one or two warm sentences — and close the conversation gently. Do not ask any questions.`;

  const historyMessages: OpenAIMessage[] = history.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 100,
        messages: [
          { role: 'system', content: systemContent },
          ...historyMessages,
          { role: 'user', content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'Thank you for sharing that.';
  } catch {
    return 'Thank you for sharing that.';
  }
}

export async function getSummaryTransition(
  userMessage: string,
  history: Message[] = []
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return "Your summary is here whenever you're ready.";

  const systemContent = `${SYSTEM_PROMPT}

The check-in is nearly over. The person has just said something extra — a reflection, a question, or a tangent — after being asked if they'd like to see their summary. Briefly acknowledge what they shared in one warm sentence, then gently let them know their summary is ready whenever they are. Don't ask any new questions.`;

  const historyMessages: OpenAIMessage[] = history.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 100,
        messages: [
          { role: 'system', content: systemContent },
          ...historyMessages,
          { role: 'user', content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ??
      "Your summary is here whenever you're ready."
    );
  } catch {
    return "Your summary is here whenever you're ready.";
  }
}

function fallbackMock(stage: Stage, userMessage: string): string {
  if (stage === 'safety_check') {
    const key = hasNoSupport(userMessage) ? 'safety_check_no_support' : 'safety_check_support';
    return pickRandom(mockResponses[key]);
  }
  const responses = mockResponses[stage as keyof typeof mockResponses];
  return responses ? pickRandom(responses) : '';
}

export async function getBotResponse(
  stage: Stage,
  userMessage: string,
  history: Message[] = []
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
  const messages = buildMessages(stage, userMessage, history, noSupport);
  if (!messages.length) return fallbackMock(stage, userMessage);

  console.log('[I.WOW DEBUG]', { stage, userMessage });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 180,
        messages,
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
