import { cn, companyInitials } from "@/lib/utils";

const GRADIENTS = [
  "from-[#3B82F6] to-[#8B5CF6]",
  "from-[#8B5CF6] to-[#EC4899]",
  "from-[#10B981] to-[#3B82F6]",
  "from-[#F59E0B] to-[#EF4444]",
  "from-[#3B82F6] to-[#10B981]",
  "from-[#EF4444] to-[#F59E0B]",
  "from-[#8B5CF6] to-[#3B82F6]",
  "from-[#10B981] to-[#8B5CF6]",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SIZE_CLASS = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function CompanyAvatar({ name, size = "md", className }: {
  name: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-semibold text-white shadow-sm ring-1 ring-white/10",
        gradient, SIZE_CLASS[size], className,
      )}
    >
      {companyInitials(name)}
    </div>
  );
}
