"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type RadarDatum = { vertical: string; value: number };

export function BrandVerticalRadar({ data }: { data: RadarDatum[] }) {
  return (
    <div className="mx-auto h-[300px] w-full max-w-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.10)" />
          <PolarAngleAxis
            dataKey="vertical"
            tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            stroke="rgba(255,255,255,0.10)"
          />
          <Radar
            dataKey="value"
            stroke="#00ff87"
            fill="#00ff87"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

