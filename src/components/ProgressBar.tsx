type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full h-2 bg-slate-200">
      <div
        className="h-full bg-slate-500 transition-all duration-700 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
