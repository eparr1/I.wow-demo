import type { Branch, Stage, Message } from '../types';
import { mockResponses } from './mockResponses';

const USE_AI = true;

type SupportLevel = 'has_support' | 'no_support' | 'mixed';

async function assessSupportLevel(
  userMessage: string,
  apiKey: string
): Promise<SupportLevel> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 10,
        messages: [
          {
            role: 'system',
            content: `Assess if this person feels supported at work. Reply with ONLY one of these three words, nothing else: has_support, no_support, or mixed.`,
          },
          { role: 'user', content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    const result = data.choices?.[0]?.message?.content?.toLowerCase().trim();
    if (result === 'has_support' || result === 'no_support' || result === 'mixed') {
      return result;
    }
    return 'mixed';
  } catch {
    return 'mixed';
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SYSTEM_PROMPT = `You are I.WOW, a warm and genuinely human workplace wellbeing assistant.

You speak like a thoughtful colleague, not a therapist or chatbot. You're curious and focused on what the person is actually experiencing.

How you respond:
- Notice what matters most to them in what they just said. Respond to the substance, not the shape of their answer.
- Give yourself 1-2 sentences to genuinely engage with what they shared before moving to the next question. Let the response feel like you actually heard them.
- Your question should feel like it emerged from what they said, not like the next item on a list.
- Keep it conversational and grounded. No bullet points, no clinical phrasing, no repeating phrases from earlier in the conversation.
- If the person's reply is very short or vague, stay with what they gave you — acknowledge it warmly and gently invite them to say a bit more.

Keeping the conversation on track:
- Stay close to the current moment — don't invite the person to go much deeper than the stage calls for, and don't open new emotional topics.
- If the user goes on a tangent or reflects more broadly, engage with it warmly for a sentence or two, then gently bring things back — not a hard redirect, just a natural steering.
- This is a structured check-in, not an open-ended therapy session. Keep responses purposeful and contained — interested, but not expansive.
- Only say 'you mentioned' or 'you said' if you can point to the exact message where the user said it
- If the user directly asks for ideas, suggestions, or says they don't know, offer one or two brief, gentle suggestions before returning to an exploratory question. Never ignore a direct request for input.

VOCABULARY ROTATION — never repeat these words within the same conversation:
- Used "notice" or "noticed"? Use instead: see, sense, recognise, or just describe what they said directly.
- Used "aware" or "awareness"? Use instead: understanding, clarity, or what you've found.
- Used "reflect" or "reflecting"? Use instead: think, realise, or consider.

THANK YOU RULE:
Use "Thank you" a maximum of 3 times in the entire conversation — only when genuinely earned.
Earned moments: vulnerability disclosure, significant insight, or conversation end.
Replace all other "thank you" moments with a specific observation, direct acknowledgment, or simple validation. Never thank someone just for answering a question.

BEFORE ASKING YOUR NEXT QUESTION:
1. Echo back ONE specific thing they said (the actual content, not just the feeling)
   Good: "So you've built a 5pm boundary and you're protecting that."
   Avoid: "That sounds like you've built good habits."
2. Your follow-up question should emerge from what you just echoed
   Good: "What does that boundary protect for you?"
   Avoid: "How could you keep that going?"
3. If they gave you specific detail, use it
   Good: "Your mornings are quieter — is that what helps?"
   Avoid: "Are there any small structures helping?"

RESPONSE LENGTH AWARENESS:
If their reply is very short (under 10 words) or vague (no specific detail):
- Do not jump straight to the stage question
- Acknowledge warmly and ask for one more specific detail: "What does that look like for you?" or "What do you mean by that?"
- Wait for their answer before moving forward

If they are opening up (responses getting longer, sharing more than asked):
- Stay curious for one more exchange — ask one follow-up that goes a level deeper
- Then move to the stage question

If they are pulling back (short answer after having shared more):
- Do not push — they may be tired or uncomfortable
- Acknowledge warmly and move forward gently with no pressure to keep exploring

VALIDATION SCALING — match warmth to what they disclosed:

Minimal or surface answer (under 15 words, stays vague):
→ Brief: "Sounds like things are fairly steady." Move forward quickly, no deep reflection.

Moderate or thoughtful answer (reveals structure, patterns, or difficulty):
→ Name back what they said specifically: "So it's the mornings that are hardest, afternoons more manageable."
→ Brief validation: "That makes sense." Then move to the next question.

Vulnerable or risky answer (mentions struggle, panic, isolation, burnout, or considering leaving):
→ Sit with it: 1-2 full sentences acknowledging what they disclosed
→ Deeper validation: "I really appreciate you being honest about that." or "That takes courage to say."
→ Then gently move forward`;


const CLOSING_STAGES: Stage[] = ['future_maintenance', 'small_shifts', 'next_steps_high'];

// Last two stages of each branch — AI should begin slowing pacing here
const TRANSITION_STAGES: Stage[] = [
  'strengths_amplify', 'future_maintenance',   // low branch
  'exceptions_mid',   'small_shifts',           // mid branch
  'strengths_high',   'next_steps_high',        // high branch
];

type StageConfig = {
  stagePurpose: string;
  focusOn: string;
  tone: string;
  scaffolding?: string;
  examples?: Array<{ userSaid: string; shouldRespond: string }>;
};

const AI_STAGE_CONFIG: Partial<Record<Stage, StageConfig>> = {
  explore_helping: {
    stagePurpose: 'Identify what is genuinely helping them stay steady',
    focusOn: 'ONE specific thing they mentioned — a person, routine, boundary, or attitude',
    tone: 'Curious, grounded. Not fishing for more — just exploring what already exists.',
    scaffolding: 'for example, a supportive manager, a good routine, helpful colleagues, clear boundaries, or something else',
    examples: [
      {
        userSaid: "My manager is really supportive and I've built a routine where I leave at 5.",
        shouldRespond:
          "Your manager having your back changes things — and the 5pm boundary. What does that boundary actually protect?",
      },
      {
        userSaid: "Honestly just keeping busy and not overthinking it.",
        shouldRespond:
          "Staying in motion rather than getting stuck in your head — that sounds deliberate. What else has been helping you stay steady?",
      },
    ],
  },
  strengths_amplify: {
    stagePurpose: 'Reinforce what is working and help them commit to more of it',
    focusOn: 'The specific strength, habit, or approach they just named',
    tone: 'Affirming and forward-looking. Not coaching — just curious about their intent.',
    scaffolding: 'for example, feeling supported, having a laugh together, working well as a team, being trusted to get on with things, the variety in the role, or something else',
    examples: [
      {
        userSaid: "Taking proper lunch breaks and actually leaving on time.",
        shouldRespond:
          "Those two things together — that's a real boundary you're protecting. How do you want to keep building on that this week?",
      },
    ],
  },
  future_maintenance: {
    stagePurpose: 'Close the conversation by affirming what they have built',
    focusOn: 'The pattern or structure they described across this check-in — name it specifically',
    tone: 'Warm and settled. No new questions. Just acknowledgment that lands.',
    examples: [
      {
        userSaid: "Just keeping the boundaries I've set and staying close to the people who help.",
        shouldRespond:
          "You've built something that actually works. That's worth protecting.",
      },
    ],
  },
  explore_variability: {
    stagePurpose: 'Find a moment of contrast — when things felt even slightly different from how they are now',
    focusOn: 'A specific recent moment, day, or short period when it felt more manageable',
    tone: 'Curious and warm. Not minimising the difficulty — just looking for what shifts.',
    scaffolding: 'for example, a lighter workload, more time to focus, better support, fewer interruptions, clearer priorities, or something else',
    examples: [
      {
        userSaid: "Some days are fine but others just grind me down.",
        shouldRespond:
          "So it does shift — there are days when it feels lighter. When was the last time work felt even a bit less heavy?",
      },
      {
        userSaid: "It's been pretty draining for a while honestly.",
        shouldRespond:
          "A sustained stretch like that takes something out of you. Has there been a day or even just part of a day recently when it felt even slightly more manageable?",
      },
    ],
  },
  exceptions_mid: {
    stagePurpose: 'Surface one concrete small thing that could shift the day',
    focusOn: 'The specific change or factor they identify — keep it small and realistic',
    tone: 'Practical, grounded. Not solving everything — just one small thing.',
    scaffolding: 'for example, fewer meetings, space to focus, a clearer brief, a bit more support from someone, or one less pressure removed',
    examples: [
      {
        userSaid: "When I had fewer meetings and could actually get into my work.",
        shouldRespond:
          "Having space to actually focus — that made the difference. What would help you get even one day like that this week?",
      },
    ],
  },
  small_shifts: {
    stagePurpose: 'Close by affirming the insight or small plan they arrived at',
    focusOn: 'What they specifically identified as a shift — name the actual thing',
    tone: 'Grounded and affirming. One short statement. No questions.',
    examples: [
      {
        userSaid: "Maybe just blocking out one morning a week without meetings.",
        shouldRespond:
          "One protected morning. That's specific and doable — and it could change the feel of the whole week.",
      },
    ],
  },
  explore_high: {
    stagePurpose: 'Understand what has been making this stretch so heavy — join them before exploring solutions',
    focusOn: 'ONE specific thing they named — a pressure, a dynamic, a feeling of overwhelm',
    tone: 'Warm and unhurried. This is a joining stage — sit with them before moving anywhere.',
    examples: [
      {
        userSaid: "It's the workload honestly. There's just no end to it.",
        shouldRespond:
          "No end in sight — that kind of relentlessness wears you down in a different way. Has there been any point in the last few months, even just a week or a few days, when it felt even slightly more manageable?",
      },
      {
        userSaid: "I just feel really isolated. My team is fine but I don't really connect with anyone.",
        shouldRespond:
          "Being surrounded by people and still feeling alone at work — that's a particular kind of drain. Has there been a time recently when it felt even a bit less isolated?",
      },
    ],
  },
  exceptions_high: {
    stagePurpose: 'Understand what specifically made the better moment different',
    focusOn: 'The specific factor — workload, the people around them, how they were working',
    tone: 'Curious, direct. They have named something real — explore it with them.',
    scaffolding: 'for example, the workload being lighter, a particular person being around or absent, more autonomy, how the day was structured, or something else',
    examples: [
      {
        userSaid: "There was a week when my manager was away and the pressure felt less.",
        shouldRespond:
          "So the pressure lifting when your manager was away — that tells you something. Was it the workload, the dynamics, or something else that changed?",
      },
    ],
  },
  support_check: {
    stagePurpose: 'Acknowledge what they identified as making the difference, then pivot naturally to their support network',
    focusOn: 'What they named as the factor — validate it, then ask who they lean on when things feel stretched',
    tone: 'Warm and curious. Not clinical. A natural question that follows from what they just shared.',
    scaffolding: 'for example, a manager they trust, a close colleague, a mentor, someone in HR, or someone outside their immediate team',
    examples: [
      {
        userSaid: "I think when my manager was less involved, the pressure lifted.",
        shouldRespond:
          "That says something clear about where the pressure is coming from. When things feel this stretched, is there anyone at work you feel you can lean on?",
      },
      {
        userSaid: "Honestly I'm not sure what was different. Maybe just a lighter week.",
        shouldRespond:
          "Even a lighter week is something — your system needed that break. When it gets heavy like this, is there anyone at work you tend to turn to?",
      },
    ],
  },
  strengths_high: {
    stagePurpose: 'Help them take one small step, and if they feel unsupported, surface EAP as a genuine option',
    focusOn: 'One specific, realistic action tied to what they just named — and if no support, weave in EAP naturally',
    tone: 'Practical and encouraging. Warm, not clinical. If EAP is mentioned, one brief sentence — not an alarm.',
    examples: [
      {
        userSaid: "I have a couple of people I trust but I don't really lean on them.",
        shouldRespond:
          "Having people you trust, even if you haven't gone there yet — that's something real. What's one thing you could do this week, even something small?",
      },
      {
        userSaid: "Not really, I just tend to get through it on my own.",
        shouldRespond:
          "Getting through it alone for this long takes a toll. Just so you know, your EAP is there for exactly this kind of stretch — it's worth keeping in mind. What's one small thing you could do for yourself this week?",
      },
    ],
  },
  next_steps_high: {
    stagePurpose: 'Affirm the concrete step they named and close the conversation',
    focusOn: 'The specific action or plan they described — echo it back before closing',
    tone: 'Settled and warm. Just affirm and close. No new questions.',
    examples: [
      {
        userSaid: "I'm going to try leaving by 6 and not checking emails after that.",
        shouldRespond:
          "A 6pm cut-off and emails off after that — that's specific and sustainable. Small boundaries like that really do shape how a week feels.",
      },
    ],
  },
};

type OpenAIMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function buildMessages(
  stage: Stage,
  userMessage: string,
  history: Message[],
  supportLevel?: SupportLevel
): OpenAIMessage[] {
  const config = AI_STAGE_CONFIG[stage];
  if (!config) return [];

  const safetyNote =
    stage === 'strengths_high'
      ? supportLevel === 'no_support'
        ? `\nNote: they don't feel supported at work. Acknowledge that warmly and mention their EAP or occupational health as a genuine option — one brief, non-alarmist sentence — then ask your question.\n`
        : supportLevel === 'mixed'
          ? `\nNote: they have some support but it's limited. Acknowledge what they do have, then continue.\n`
          : ''
      : '';

  const examplesText = config.examples?.length
    ? `\nExamples of how this stage can sound:\n${config.examples
        .map((e) => `  User: "${e.userSaid}"\n  You: "${e.shouldRespond}"`)
        .join('\n')}`
    : '';

  const scaffoldingNote = config.scaffolding
    ? `\nScaffolding: when you ask your question, add a brief "For example..." clause after it using these suggestions: ${config.scaffolding}. Keep it to 3–4 options and end with "or something else." This helps ground the question without narrowing it.\n`
    : '';

  const isClosing = CLOSING_STAGES.includes(stage);
  const isTransition = TRANSITION_STAGES.includes(stage);

  const instruction = isClosing
    ? `Stage intent: ${config.stagePurpose}\nFocus on: ${config.focusOn}\nTone: ${config.tone}\n\nClose warmly — do not ask any questions. End on a grounded note that reflects what they specifically shared.${examplesText}`
    : isTransition
      ? `Stage intent: ${config.stagePurpose}\nFocus on: ${config.focusOn}\nTone: ${config.tone}\n\nThe conversation is winding down. Make ONE warm observation about what you have heard — do not ask a question. Just acknowledge what matters and let it land. Example: "You've got clarity on what helps. That's solid."${examplesText}`
      : `Stage intent: ${config.stagePurpose}\nFocus on: ${config.focusOn}\nTone: ${config.tone}\n\nAcknowledge their response genuinely, then ask one question that emerges naturally from what they said.${examplesText}`;

  const transitionNote = isTransition && !isClosing
    ? `\nPacing: the conversation is approaching its end — keep the tone warm and unhurried, and do not introduce anything new.\n`
    : '';

  const systemFull = `${SYSTEM_PROMPT}
${safetyNote}${transitionNote}${scaffoldingNote}
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

export async function getCoachClose(
  branch: Branch,
  responses: Partial<Record<Stage, string>>,
  history: Message[] = []
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const summaryLines = Object.entries(responses)
    .map(([stage, answer]) => `• ${stage}: ${answer}`)
    .join('\n');

  if (!apiKey) return fallbackCoachClose(branch);

  const systemContent = `${SYSTEM_PROMPT}

You are I.WOW, a thoughtful workplace wellbeing coach. Using the person's responses, write one brief coaching close:
- Reflect what matters most from their check-in.
- Offer a small next step or shift in perspective.
- Keep it warm, short, and no more than three sentences.
- Do not ask any questions.`;

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
        max_tokens: 140,
        messages: [
          { role: 'system', content: systemContent },
          ...historyMessages,
          {
            role: 'user',
            content: `Branch: ${branch}\nResponses:\n${summaryLines}`,
          },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? fallbackCoachClose(branch);
  } catch {
    return fallbackCoachClose(branch);
  }
}

function fallbackCoachClose(branch: Branch): string {
  if (branch === 'low') {
    return 'It sounds like you already have a few steady supports in place. Keep those visible, and try one small choice this week that helps protect that balance.';
  }
  if (branch === 'mid') {
    return 'You can see that things are uneven, but there are also times when it feels a bit more manageable. One small step would be to notice and lean into the simplest change that makes a day feel just a little easier.';
  }
  return 'You’ve noticed both the strain and the small moments that feel better. A good next step is to choose one tiny action this week that builds a bit more of that easier feeling into your routine.';
}
function fallbackSummaryInsight(branch: Branch): string {
  if (branch === 'low') {
    return 'There are already things helping you stay steady — and you can see what they are. Keeping those visible is worth doing.';
  }
  if (branch === 'mid') {
    return 'It shifts for you, and you can see what makes it heavier and what eases it. That understanding is genuinely useful.';
  }
  return "Things have been stretched, but there are still clues about what helps — and you don't have to solve everything at once.";
}

export async function getSummaryInsight(
  branch: Branch,
  responses: Partial<Record<Stage, string>>
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return fallbackSummaryInsight(branch);

  const summaryLines = Object.entries(responses)
    .map(([stage, answer]) => `• ${stage}: ${answer}`)
    .join('\n');

  const systemContent = `${SYSTEM_PROMPT}

Based on what this person shared in their check-in, write exactly 2 warm sentences that capture what stands out. Do not ask questions. Do not offer advice. Just reflect back what is genuinely notable — something that gives them a sense of being heard. Keep it grounded and human.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 80,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: `Branch: ${branch}\nResponses:\n${summaryLines}` },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? fallbackSummaryInsight(branch);
  } catch {
    return fallbackSummaryInsight(branch);
  }
}

export async function getObservationsAndSteps(
  branch: Branch,
  responses: Partial<Record<Stage, string>>,
  history: Message[] = []
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const summaryLines = Object.entries(responses)
    .map(([stage, answer]) => `• ${stage}: ${answer}`)
    .join('\n');

  if (!apiKey) return fallbackObservationsAndSteps(branch);

  const systemContent = `${SYSTEM_PROMPT}

Based on what the person has shared in this check-in, write brief observations and a suggested next step:
- Reflect the key themes or patterns you notice.
- Suggest one small, realistic action they could take.- Use bullet points for clarity and readability- Keep it warm, grounded, and no more than 4 sentences.
- Do not ask any questions.`;

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
        max_tokens: 180,
        messages: [
          { role: 'system', content: systemContent },
          ...historyMessages,
          {
            role: 'user',
            content: `Branch: ${branch}\nResponses:\n${summaryLines}`,
          },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? fallbackObservationsAndSteps(branch);
  } catch {
    return fallbackObservationsAndSteps(branch);
  }
}

function fallbackObservationsAndSteps(branch: Branch): string {
  if (branch === 'low') {
    return 'What stands out:\n' +
           '• You already have meaningful supports in place\n' +
           '• Noticing and protecting those in the weeks ahead could help you stay grounded\n\n' +
           'One small step: pick one thing that helps most, and make one small choice this week that keeps it visible.';
  }
  if (branch === 'mid') {
    return 'What stands out:\n' +
           '• Things do shift for you — there are times when it feels more manageable\n' +
           '• That tells you something real about what helps\n\n' +
           'One small step: when things feel even slightly easier this week, pause and notice what was different.';
  }
  return 'What stands out:\n' +
         '• There\'s a gap between the strain you\'re carrying and the small moments that feel better\n' +
         '• Those moments point to real support and small changes that could help\n\n' +
         'One small step: try one tiny thing this week — even very small — that builds a bit more of that easier feeling.';
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

function getMaxTokensForStage(stage: Stage): number {
  if (['scale_question', 'explore_high'].includes(stage)) return 150;
  if (['explore_helping', 'explore_variability', 'exceptions_mid'].includes(stage)) return 100;
  if (['future_maintenance', 'small_shifts', 'strengths_high', 'next_steps_high'].includes(stage)) return 80;
  return 120;
}

function fallbackMock(stage: Stage): string {
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
    return fallbackMock(stage);
  }

  const supportLevel =
    stage === 'strengths_high' ? await assessSupportLevel(userMessage, apiKey) : undefined;
  const messages = buildMessages(stage, userMessage, history, supportLevel);
  if (!messages.length) return fallbackMock(stage);

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
        max_tokens: getMaxTokensForStage(stage),
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('OpenAI error', res.status, data);
      return fallbackMock(stage);
    }

    const content = data.choices?.[0]?.message?.content as string | null;
    if (!content) {
      console.warn('OpenAI returned null content', data);
      return fallbackMock(stage);
    }

    return content;
  } catch (err) {
    console.error('getBotResponse fetch failed', err);
    return fallbackMock(stage);
  }
}
