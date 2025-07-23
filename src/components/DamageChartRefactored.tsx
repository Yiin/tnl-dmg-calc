import React, { useMemo, useCallback, memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"];
const CHART_HEIGHT = 400;
const THROTTLE_DELAY = 50;
const Y_AXIS_ANGLE = -90;

// Utility to modify stat values based on x-axis
const applyStatModification = (
  build: Build,
  enemy: Enemy,
  stat: StatKey,
  value: number
): [Build, Enemy] => {
  // This matches the original logic exactly
  if (stat in build) {
    return [{ ...build, [stat]: value }, enemy];
  } else if (stat in enemy) {
    return [build, { ...enemy, [stat]: value }];
  }
  return [build, enemy];
};

// Utility to get current stat value
const getCurrentStatValue = (
  builds: Build[],
  enemy: Enemy,
  stat: StatKey
): number => {
  if (stat in enemy) {
    return (enemy[stat as keyof Enemy] as number) || 0;
  }
  if (builds.length > 0 && stat in builds[0]) {
    return (builds[0][stat as keyof Build] as number) || 0;
  }
  return 0;
};

// Format percentage values consistently
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Custom hook for chart data calculation
const useChartData = (
  builds: Build[],
  enemy: Enemy,
  xAxisStat: StatKey,
  xAxisRange: { min: number; max: number; step: number },
  yMetric: string,
  combatConfig: {
    type: "melee" | "ranged" | "magic";
    direction: "front" | "side" | "back";
    isPvP: boolean;
    skillPotency: number;
    skillFlatAdd: number;
    hitsPerCast: number;
  }
) => {
  const currentStatValue = getCurrentStatValue(builds, enemy, xAxisStat);

  const xValues = useMemo(() => {
    const { min, max, step } = xAxisRange;
    const values: number[] = [];

    for (let x = min; x <= max; x += step) {
      values.push(x);
    }

    // Add current value if not already included and in range
    if (
      currentStatValue >= min &&
      currentStatValue <= max &&
      !values.includes(currentStatValue)
    ) {
      values.push(currentStatValue);
      values.sort((a, b) => a - b);
    }

    return values;
  }, [xAxisRange, currentStatValue]);

  const chartData = useMemo(() => {
    return xValues.map((x) => {
      const point: ChartPoint = { x };

      builds.forEach((build, index) => {
        const [modifiedBuild, modifiedEnemy] = applyStatModification(
          build,
          enemy,
          xAxisStat,
          x
        );

        const breakdown = calculateDamage(
          modifiedBuild,
          modifiedEnemy,
          combatConfig.type,
          combatConfig.direction,
          combatConfig.isPvP,
          combatConfig.skillPotency,
          combatConfig.skillFlatAdd,
          combatConfig.hitsPerCast
        );

        point[`build${index}`] = breakdown[yMetric as keyof DamageBreakdown];
      });

      return point;
    });
  }, [xValues, builds, enemy, xAxisStat, yMetric, combatConfig]);

  return { chartData, currentStatValue };
};

export const DamageChart: React.FC<DamageChartProps> = memo(({
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
  const combatConfig = useMemo(
    () => ({
      type: combatType,
      direction: attackDirection,
      isPvP,
      skillPotency,
      skillFlatAdd,
      hitsPerCast,
    }),
    [combatType, attackDirection, isPvP, skillPotency, skillFlatAdd, hitsPerCast]
  );

  const { chartData, currentStatValue } = useChartData(
    builds,
    enemy,
    xAxisStat,
    xAxisRange,
    yMetric,
    combatConfig
  );

  const handleMouseMove = useCallback((data: any) => {
    if (!data?.activePayload?.[0] || !onPointHover || builds.length === 0) {
      return;
    }

    const x = data.activePayload[0].payload.x;
    const [modifiedBuild, modifiedEnemy] = applyStatModification(
      builds[0],
      enemy,
      xAxisStat,
      x
    );

    const breakdown = calculateDamage(
      modifiedBuild,
      modifiedEnemy,
      combatConfig.type,
      combatConfig.direction,
      combatConfig.isPvP,
      combatConfig.skillPotency,
      combatConfig.skillFlatAdd,
      combatConfig.hitsPerCast
    );

    onPointHover(breakdown, x);
  }, [builds, enemy, xAxisStat, combatConfig, onPointHover]);

  const handleMouseLeave = useCallback(() => {
    onPointHover?.(null, 0);
  }, [onPointHover]);

  const formatYAxis = useCallback((value: number) => {
    return yMetric.includes("Chance") ? formatPercentage(value) : value.toFixed(0);
  }, [yMetric]);

  const formatTooltip = useCallback((value: number, name: string) => {
    const buildIndex = parseInt(name.replace("build", ""));
    const buildName = builds[buildIndex]?.name || `Build ${buildIndex + 1}`;
    const formattedValue = yMetric.includes("Chance") 
      ? formatPercentage(value) 
      : value.toFixed(0);
    
    return [formattedValue, buildName];
  }, [builds, yMetric]);

  const isCurrentValueInRange = currentStatValue >= xAxisRange.min && 
                                currentStatValue <= xAxisRange.max;

  return (
    <div className="damage-chart">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          throttleDelay={THROTTLE_DELAY}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            label={{ value: xAxisStat, position: "insideBottom", offset: -5 }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            label={{ value: yMetric, angle: Y_AXIS_ANGLE, position: "insideLeft" }}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(value) => `${xAxisStat}: ${value}`}
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#fff",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            animationDuration={0}
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
          
          {isCurrentValueInRange && (
            <ReferenceLine
              x={currentStatValue}
              stroke="#ccc"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

DamageChart.displayName = 'DamageChart';