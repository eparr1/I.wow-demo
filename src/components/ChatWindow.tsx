import { useEffect, useRef } from 'react';
import type { Message, Stage } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ScaleButtons from './ScaleButtons';

type Props = {
  messages: Message[];
  isTyping: boolean;
  stage: Stage;
  onScoreSelect: (num: number) => void;
};

export default function ChatWindow({ messages, isTyping, stage, onScoreSelect }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="px-4 py-6 space-y-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      {stage === 'scale_question' && !isTyping && (
        <ScaleButtons onSelect={onScoreSelect} />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
