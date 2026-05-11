type Props = {
  onSelect: (num: number) => void;
};

const labels: Record<number, string> = {
  1: 'never',
  2: 'almost never',
  3: 'sometimes',
  4: 'often',
  5: 'most of the time',
  6: 'all of the time',
};

export default function ScaleButtons({ onSelect }: Props) {
  return (
     <div className="flex gap-3 justify-center px-4 pb-4 flex-wrap">
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <button
          key={num}
          onClick={() => onSelect(num)}
          className="w-20 h-20 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex flex-col items-center justify-center text-center px-1 shadow-sm"
        >
          <span className="text-lg font-semibold text-slate-700">
            {num}
          </span>
          <span className="text-xs text-slate-500 leading-tight">
            {labels[num]}
          </span>
        </button>
      ))}
    </div>
  );
}
    