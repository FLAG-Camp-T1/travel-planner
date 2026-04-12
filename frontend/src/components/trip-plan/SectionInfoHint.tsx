import { Info } from 'lucide-react';

type SectionInfoHintProps = {
  tooltip: string;
};

export default function SectionInfoHint({ tooltip }: SectionInfoHintProps) {
  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
    >
      <Info className="h-3.5 w-3.5" />
    </span>
  );
}
