"use client";

const COLORS = [
  "hsl(217, 91%, 60%)", "hsl(270, 91%, 65%)", "hsl(152, 76%, 50%)", "hsl(38, 95%, 58%)", "hsl(0, 80%, 64%)",
];

/** Brief celebratory burst, shown on milestone events (e.g. every 5th solve). */
export function ConfettiBurst() {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-40 justify-center overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: `${50 + (((i * 37) % 100) - 50) * 0.9}%`,
            backgroundColor: COLORS[i % COLORS.length],
            animationDelay: `${(i % 7) * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
