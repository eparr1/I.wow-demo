import type { Message } from '../types';

type Props = {
  message: Message;
};

export default function MessageBubble({ message }: Props) {
  if (message.role === 'bot') {
    return (
      <div className="flex justify-start animate-fade-in">
        <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end animate-fade-in">
      <div className="bg-slate-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] text-sm leading-relaxed shadow-sm">
        {message.content}
      </div>
    </div>
  );
}
