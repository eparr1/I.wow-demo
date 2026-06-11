type Props = {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  hidden: boolean;
};

export default function InputBar({ value, onChange, onSubmit, disabled, hidden }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div
      className="flex items-center gap-2 px-2 sm:px-4 py-3 justify-center"
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your response…"
        className="w-full max-w-4xl min-w-0 min-h-[50px] rounded-[28px] flex-1 border  border-slate-400 px-4 py-2 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 bg-slate-50 text-slate-700 disabled:opacity-50 transition-colors"
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="shrink-0 p-2 rounded-xl bg-slate-600 text-white hover:bg-slate-700 hover:scale-105 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
      >
        →
      </button>
    </div>
  );
}
