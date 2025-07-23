import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Build, Enemy, StatKey, ChartPoint, DamageBreakdown } from "../types";
import { calculateDamage } from "../calculations";

interface DamageChartProps {
  builds: Build[];
  enemy: Enemy;
  xAxisStat: StatKey;
  xAxisRange: { min: number; max: number; step: number };
  yMetric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance";
  combatType: "melee" | "ranged" | "magic";
  attackDirection: "front" | "side" | "back";
  isPvP?: boolean;
  skillPotency?: number;
  skillFlatAdd?: number;
  hitsPerCast?: number;
  onPointHover?: (breakdown: DamageBreakdown | null, x: number) => void;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
];

export const DamageChart: React.FC<DamageChartProps> = ({
  builds,
  enemy,
  xAxisStat,
  xAxisRange,
  yMetric,
  combatType,
  attackDirection,
  isPvP = true,
  skillPotency = 1.0,
  skillFlatAdd = 0,
  hitsPerCast = 1,
  onPointHover,
}) => {
  const chartData = useMemo(() => {
    const data: ChartPoint[] = [];
    const { min, max, step } = xAxisRange;

    for (let x = min; x <= max; x += step) {
      const point: ChartPoint = { x };

      builds.forEach((build, index) => {
        let modifiedBuild = { ...build, [xAxisStat]: x };
        let modifiedEnemy = { ...enemy, [xAxisStat]: x };

        const breakdown = calculateDamage(
          modifiedBuild,
          modifiedEnemy,
          combatType,
          attackDirection,
          isPvP,
          skillPotency,
          skillFlatAdd,
          hitsPerCast
        );
        point[`build${index}`] = breakdown[yMetric];
      });

      data.push(point);
    }

    return data;
  }, [builds, enemy, xAxisStat, xAxisRange, yMetric, combatType, attackDirection, isPvP, skillPotency, skillFlatAdd, hitsPerCast]);

  const handleMouseMove = (data: any) => {
    if (
      data &&
      data.activePayload &&
      data.activePayload.length > 0 &&
      onPointHover
    ) {
      const x = data.activePayload[0].payload.x;

      // Calculate breakdown for the first build at this x value
      let modifiedBuild = { ...builds[0] };
      let modifiedEnemy = { ...enemy };

      if (xAxisStat in builds[0]) {
        modifiedBuild = { ...modifiedBuild, [xAxisStat]: x };
      } else if (xAxisStat in enemy) {
        modifiedEnemy = { ...modifiedEnemy, [xAxisStat]: x };
      }

      const breakdown = calculateDamage(
        modifiedBuild,
        modifiedEnemy,
        combatType,
        attackDirection,
        isPvP,
        skillPotency,
        skillFlatAdd,
        hitsPerCast
      );
      onPointHover(breakdown, x);
    }
  };

  const handleMouseLeave = () => {
    if (onPointHover) {
      onPointHover(null, 0);
    }
  };

  const formatYAxis = (value: number) => {
    if (yMetric.includes("Chance")) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(0);
  };

  const formatTooltip = (
    value: number,
    name: string,
    item: any
  ) => {
    // The name parameter is the display name from the Line component
    // We need to find which build this corresponds to
    const buildIndex = builds.findIndex(build => (build.name || `Build ${builds.indexOf(build) + 1}`) === name);
    
    if (buildIndex === -1) {
      // Fallback: try to extract from dataKey if name doesn't match
      const dataKey = item?.dataKey;
      if (dataKey && dataKey.startsWith('build')) {
        const index = parseInt(dataKey.replace('build', ''));
        const buildName = builds[index]?.name || `Build ${index + 1}`;
        if (yMetric.includes("Chance")) {
          return [`${(value * 100).toFixed(1)}%`, buildName];
        }
        return [value.toFixed(0), buildName];
      }
    }

    const buildName = builds[buildIndex]?.name || `Build ${buildIndex + 1}`;
    if (yMetric.includes("Chance")) {
      return [`${(value * 100).toFixed(1)}%`, buildName];
    }
    return [value.toFixed(0), buildName];
  };

  return (
    <div className="damage-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            label={{ value: xAxisStat, position: "insideBottom", offset: -5 }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            label={{ value: yMetric, angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(value) => `${xAxisStat}: ${value}`}
          />
          <Legend />

          {builds.map((build, index) => (
            <Line
              key={`build${index}`}
              type="monotone"
              dataKey={`build${index}`}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              name={build.name || `Build ${index + 1}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
