"use client";

import React from "react";
import Plasma from "@/components/plasma/Plasma";
import { usePlasmaStore } from "@/store/usePlasmaStore";

export default function GlobalPlasma() {
  const { config } = usePlasmaStore();

  if (!config.isVisible) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Plasma
        color={config.color}
        speed={config.speed}
        scale={config.scale}
        opacity={config.opacity}
        mouseInteractive={config.mouseInteractive}
      />
    </div>
  );
}
