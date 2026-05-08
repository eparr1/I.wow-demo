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
      className="flex items-center gap-2 px-4 py-3 border-t border-slate-200 bg-white transition-opacity"
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your response…"
        className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-400 bg-slate-50 text-slate-700 disabled:opacity-50"
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="p-2 rounded-xl bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        →
      </button>
    </div>
  );
}
