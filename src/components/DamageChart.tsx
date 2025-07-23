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
          isPvP
        );
        point[`build${index}`] = breakdown[yMetric];
      });

      data.push(point);
    }

    return data;
  }, [builds, enemy, xAxisStat, xAxisRange, yMetric, combatType, attackDirection, isPvP]);

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
        isPvP
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
    _name: string,
    _item: any,
    index: number
  ) => {
    const buildName = builds[index]?.name || `Build ${index + 1}`;

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
