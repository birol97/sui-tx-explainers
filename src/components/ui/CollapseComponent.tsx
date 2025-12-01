import { ReactNode, useState } from "react";

// Define props type
interface CollapseSectionProps {
  title: string;
  children: ReactNode;
}

export default function CollapseSection({ title, children }: CollapseSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-xl mb-4 bg-black/40">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <span className="text-lg font-semibold text-white">{title}</span>
        <span className="text-gray-400 text-xl">{open ? "▲" : "▼"}</span>
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 text-white">{children}</div>
      </div>
    </div>
  );
}
