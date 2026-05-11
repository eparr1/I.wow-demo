type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-in-out rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
