"use client";

import * as React from "react";
import { animate } from "framer-motion";

export function AnimatedNumber({
  value, decimals = 0, suffix = "",
}: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const controls = animate(0, value, {
      duration: 1, ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display.toFixed(decimals)}{suffix}</>;
}
