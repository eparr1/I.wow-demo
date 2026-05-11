import { useState } from 'react';
import type { Stage, Branch } from './types';
import { STAGE_PROGRESS, BRANCH_STAGES, BRANCH_OPENING, getBranch } from './lib/stageConfig';
import { getBotResponse, getClosingReflection, getSummaryTransition } from './lib/getBotResponse';
import ProgressBar from './components/ProgressBar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import type { Message } from './types';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('intro');
  const [branch, setBranch] = useState<Branch | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [stageResponses, setStageResponses] = useState<Partial<Record<Stage, string>>>({});
  const [pendingClose, setPendingClose] = useState(false);
  const [awaitingSummaryConfirm, setAwaitingSummaryConfirm] = useState(false);

  const SUMMARY_INVITE =
    "We're nearly at the end of this check-in now — would you like to see a short summary of what we discussed today?";

  function isReadyForSummary(text: string): boolean {
    const lower = text.toLowerCase().trim();
    const YES_SIGNALS = [
      'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'please',
      'go ahead', 'go on', 'ready', 'sounds good', "let's go", "let's see",
      'show me', 'show', 'love to', 'would love',
    ];
    return YES_SIGNALS.some((s) => lower.includes(s));
  }

  const addBotMessage = async (content: string): Promise<void> => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'bot', content }]);
    setIsTyping(false);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content }]);
  };

  const handleOpenChat = () => {
    setChatOpen(true);
    setTimeout(() => {
      addBotMessage(
        "Hi — it's lovely to meet you today at the Academic Collaboration Showcase! This short demo is a space to pause and reflect on how things have been feeling in your work recently, using one question from our I.ROC framework. I'll guide you through a brief check-in and we'll take a moment to explore how things have been for you over the past few months."
      );
    }, 550);
  };

  const handleBegin = async () => {
    setStage('scale_question');
    await addBotMessage("Thinking about the past 3 months, how often has work left you feeling overwhelmed, emotionally drained, or running low on energy?");
    await addBotMessage("There's no right answer here — just choose the number that feels closest.");
    await addBotMessage("On a scale from 1 to 6 — where 1 is 'never' and 6 is 'all of the time' — tap the number that feels closest.");
  };

  const handleScoreSelect = async (num: number) => {
    addUserMessage(String(num));
    setScore(num);
    const b = getBranch(num);
    setBranch(b);
    setStage(BRANCH_STAGES[b][0]);
    const { validation, question } = BRANCH_OPENING[b];
    await addBotMessage(validation);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await addBotMessage(question);
  };

  function buildSummary(b: Branch, responses: Partial<Record<Stage, string>>): string {
    const val = (s: string | undefined) => s ?? '—';

    if (b === 'low') {
      return (
        `Here's what I heard from you today:\n\n` +
        `• What's been helping: ${val(responses.explore_helping)}\n\n` +
        `• What supports that: ${val(responses.strengths_amplify)}\n\n` +
        `• Going forward: ${val(responses.future_maintenance)}`
      );
    }
    if (b === 'mid') {
      return (
        `Here's what I heard from you today:\n\n` +
        `• What tends to make it better: ${val(responses.explore_variability)}\n\n` +
        `• When it feels more manageable: ${val(responses.exceptions_mid)}\n\n` +
        `• A small shift to try: ${val(responses.small_shifts)}`
      );
    }
    return (
      `Here's what I heard from you today:\n\n` +
      `• Support at work: ${val(responses.safety_check)}\n\n` +
      `• A time things felt more manageable: ${val(responses.exceptions_high)}\n\n` +
      `• What made that different: ${val(responses.strengths_high)}\n\n` +
      `• One small step: ${val(responses.next_steps_high)}`
    );
  }

  const handleUserSubmit = async () => {
    if (!inputValue.trim() || !branch) return;
    const userText = inputValue;
    addUserMessage(userText);
    setInputValue('');

    // User is responding after the summary invite — check if they're ready
    if (awaitingSummaryConfirm) {
      if (isReadyForSummary(userText)) {
        setAwaitingSummaryConfirm(false);
        await addBotMessage(buildSummary(branch, stageResponses));
        await addBotMessage("Thank you for taking the time to share this with me today. What you've reflected on here is genuinely valuable — and the awareness you've brought to it is a real strength.");
        setStage('summary');
      } else {
        // They said something extra — acknowledge briefly, then stay at the gate
        const bridge = await getSummaryTransition(userText, messages);
        if (bridge) await addBotMessage(bridge);
      }
      return;
    }

    // User replied to an unexpected question the bot asked at a closing stage
    if (pendingClose) {
      setPendingClose(false);
      const reflection = await getClosingReflection(userText, messages);
      if (reflection) await addBotMessage(reflection);
      setAwaitingSummaryConfirm(true);
      await addBotMessage(SUMMARY_INVITE);
      return;
    }

    const updatedResponses = { ...stageResponses, [stage]: userText };
    setStageResponses(updatedResponses);

    const branchStages = BRANCH_STAGES[branch];
    const currentIndex = branchStages.indexOf(stage);
    const nextStage = branchStages[currentIndex + 1];

    const botText = await getBotResponse(stage, userText, messages);
    if (botText) await addBotMessage(botText);

    if (nextStage === 'summary') {
      if (botText?.includes('?')) {
        // Bot asked a question — let the user answer before offering the summary
        setPendingClose(true);
      } else {
        setAwaitingSummaryConfirm(true);
        await addBotMessage(SUMMARY_INVITE);
      }
    } else if (nextStage) {
      setStage(nextStage);
    }
  };

  const handleReset = () => {
    setChatOpen(false);
    setStage('intro');
    setScore(null);
    setBranch(null);
    setMessages([]);
    setIsTyping(false);
    setInputValue('');
    setStageResponses({});
    setPendingClose(false);
    setAwaitingSummaryConfirm(false);
  };

  void score;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans relative overflow-hidden">

      {/* Background blurs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 180,
          height: 180,
          left: 'calc(50% + 40px)',
          top: '62vh',
          background: '#89BCFF',
          filter: 'blur(80px)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 260,
          height: 260,
          left: 'calc(50% - 160px)',
          top: '58vh',
          background: '#FF86E1',
          filter: 'blur(100px)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      {/* Progress bar — only visible once chat is open */}
      {chatOpen && <ProgressBar progress={STAGE_PROGRESS[stage]} />}

      {/* Title bar — always visible */}
      <div
        className="px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <h1 className="text-6xl font-semibold text-sky-950 tracking-wide text-center font-['Bricolage_Grotesque']">I.WOW</h1>
        <p className="text-xs text-lime-700 mt-0.5 text-center p-1 font-['Bricolage_Grotesque']">Your Workplace Wellbeing Check-in</p>
      </div>

      {/* Content area */}
      <div className="flex-1 relative mx-4 mb-4 mt-3">

        {/* Landing Begin button — fades out on open */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 10,
            opacity: chatOpen ? 0 : 1,
            transition: 'opacity 0.25s ease-out',
            pointerEvents: chatOpen ? 'none' : 'auto',
          }}
        >
          <button
            onClick={handleOpenChat}
            className="px-8 py-4 bg-slate-700 text-white rounded-2xl text-base font-medium tracking-wide hover:bg-slate-800 transition-colors font-['Bricolage_Grotesque']"
          >
            Start Demo →
          </button>
        </div>

        {/* Chat box — scales in from center */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm overflow-hidden"
          style={{
            zIndex: 1,
            transform: chatOpen ? 'scale(1)' : 'scale(0.06)',
            opacity: chatOpen ? 1 : 0,
            transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
            transformOrigin: 'center center',
            pointerEvents: chatOpen ? 'auto' : 'none',
          }}
        >
          <div className="flex-1 overflow-y-auto">
            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              stage={stage}
              onScoreSelect={handleScoreSelect}
            />
          </div>

          {stage === 'intro' && !isTyping && (
            <div className="px-4 pb-4 flex justify-center">
              <button
                onClick={handleBegin}
                className="px-6 py-3 bg-slate-600 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Let's begin →
              </button>
            </div>
          )}

          {stage === 'summary' && (
            <div className="px-4 pb-4 flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-600 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Start again →
              </button>
            </div>
          )}

          <InputBar
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleUserSubmit}
            disabled={isTyping}
            hidden={stage === 'intro' || stage === 'scale_question' || stage === 'summary'}
          />
        </div>
      </div>
    </div>
  );
}
