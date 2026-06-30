"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Point {
  day: string;
  revenue: number;
}

export function SalesChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.revenue));
  const W = 640;
  const H = 240;
  const pad = { top: 16, right: 16, bottom: 28, left: 16 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const barW = innerW / data.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label="Revenue over the last 30 days"
      >
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={pad.left}
            x2={W - pad.right}
            y1={pad.top + innerH * (1 - g)}
            y2={pad.top + innerH * (1 - g)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}
        {data.map((d, i) => {
          const h = (d.revenue / max) * innerH;
          const x = pad.left + i * barW + barW * 0.2;
          const y = pad.top + innerH - h;
          const w = barW * 0.6;
          const isActive = active === i;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={4}
                className={
                  isActive ? "fill-accent" : "fill-primary/80"
                }
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
              <text
                x={x + w / 2}
                y={H - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {d.day}
              </text>
              {isActive && (
                <text
                  x={x + w / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold"
                >
                  {formatPrice(d.revenue)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
