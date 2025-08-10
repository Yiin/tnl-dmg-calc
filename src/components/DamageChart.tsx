import { useMemo, useCallback, useRef, memo } from "react";
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
import { Build, Enemy, StatKey, ChartPoint } from "../types";
import { calculateDamage, calculateDPS } from "../calculations";

interface DamageChartProps {
  builds: Build[];
  enemy: Enemy;
  xAxisStat: StatKey;
  xAxisRange: { min: number; max: number; step: number };
  yMetric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance" | "dps";
  combatType: "melee" | "ranged" | "magic";
  attackDirection: "front" | "side" | "back";
  isPvP?: boolean;
  skillPotency?: number;
  skillFlatAdd?: number;
  hitsPerCast?: number;
  weakenSkillPotency?: number;
  weakenSkillFlatAdd?: number;
  cooldownTime?: number;
  castTime?: number;
  skillCooldownSpecialization?: number;
  useCDR?: boolean;
  useAttackSpeed?: boolean;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
];

export const DamageChart = memo(function DamageChart({
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
  weakenSkillPotency = 0,
  weakenSkillFlatAdd = 0,
  cooldownTime = 10,
  castTime = 1,
  skillCooldownSpecialization = 0,
  useCDR = true,
  useAttackSpeed = true,
}: DamageChartProps) {
  // Determine if the stat belongs to build or enemy based on the stat name
  const statBelongsToBuild = useMemo(() => {
    const buildStats = [
      "minDMG",
      "maxDMG",
      "meleeCritical",
      "rangedCritical",
      "magicCritical",
      "criticalDamage",
      "meleeHeavyAttack",
      "rangedHeavyAttack",
      "magicHeavyAttack",
      "meleeHit",
      "rangedHit",
      "magicHit",
      "skillDamageBoost",
      "bonusDamage",
      "attackSpeedTime",
      "cooldownSpeed",
    ];
    return buildStats.includes(xAxisStat);
  }, [xAxisStat]);

  // Get the current value of the x-axis stat from build or enemy
  const currentStatValue = useMemo(() => {
    if (statBelongsToBuild && builds.length > 0) {
      return (builds[0][xAxisStat as keyof Build] as number) || 0;
    } else if (!statBelongsToBuild) {
      return (enemy[xAxisStat as keyof Enemy] as number) || 0;
    }
    return 0;
  }, [builds, enemy, xAxisStat, statBelongsToBuild]);

  // Snap the current value to the nearest step on the grid
  const snappedCurrentValue = useMemo(() => {
    const { min, step } = xAxisRange;
    return Math.round((currentStatValue - min) / step) * step + min;
  }, [currentStatValue, xAxisRange]);

  const chartData = useMemo(() => {
    const data: ChartPoint[] = [];
    const { min, max, step } = xAxisRange;

    for (let x = min; x <= max; x += step) {
      const point: ChartPoint = { x };

      builds.forEach((build, index) => {
        let modifiedBuild = { ...build };
        let modifiedEnemy = { ...enemy };

        // Only modify the entity that actually has the xAxisStat
        if (statBelongsToBuild) {
          modifiedBuild = { ...modifiedBuild, [xAxisStat]: x };
        } else {
          modifiedEnemy = { ...modifiedEnemy, [xAxisStat]: x };
        }

        if (yMetric === "dps") {
          const dps = calculateDPS(
            modifiedBuild,
            modifiedEnemy,
            combatType,
            attackDirection,
            cooldownTime,
            castTime,
            isPvP,
            skillPotency,
            skillFlatAdd,
            hitsPerCast,
            weakenSkillPotency,
            weakenSkillFlatAdd,
            skillCooldownSpecialization,
            useCDR,
            useAttackSpeed
          );
          point[`build${index}`] = dps;
        } else {
          const breakdown = calculateDamage(
            modifiedBuild,
            modifiedEnemy,
            combatType,
            attackDirection,
            isPvP,
            skillPotency,
            skillFlatAdd,
            hitsPerCast,
            weakenSkillPotency,
            weakenSkillFlatAdd
          );
          point[`build${index}`] = breakdown[yMetric];
        }
      });

      data.push(point);
    }

    return data;
  }, [
    builds,
    enemy,
    xAxisStat,
    xAxisRange,
    yMetric,
    combatType,
    attackDirection,
    isPvP,
    skillPotency,
    skillFlatAdd,
    hitsPerCast,
    statBelongsToBuild,
    cooldownTime,
    castTime,
    skillCooldownSpecialization,
    weakenSkillPotency,
    weakenSkillFlatAdd,
    useCDR,
    useAttackSpeed,
  ]);

  const formatYAxis = useCallback(
    (value: number) => {
      if (yMetric.includes("Chance")) {
        return `${(value * 100).toFixed(1)}%`;
      }
      return value.toFixed(0);
    },
    [yMetric]
  );

  // Cache for tooltip formatting
  const tooltipCacheRef = useRef<Map<string, [string, string]>>(new Map());

  // Clear cache when builds or yMetric change
  useMemo(() => {
    tooltipCacheRef.current.clear();
  }, [builds, yMetric]);

  const formatTooltip = useCallback(
    (value: number, name: string, item: any) => {
      // Create a cache key from the inputs
      const cacheKey = `${value}-${name}-${item?.dataKey}`;

      // Check if we have a cached result
      const cached = tooltipCacheRef.current.get(cacheKey);
      if (cached) {
        return cached;
      }

      // The name parameter is the display name from the Line component
      // We need to find which build this corresponds to
      const buildIndex = builds.findIndex(
        (build) => (build.name || `Build ${builds.indexOf(build) + 1}`) === name
      );

      let result: [string, string];

      if (buildIndex === -1) {
        // Fallback: try to extract from dataKey if name doesn't match
        const dataKey = item?.dataKey;
        if (dataKey && dataKey.startsWith("build")) {
          const index = parseInt(dataKey.replace("build", ""));
          const buildName = builds[index]?.name || `Build ${index + 1}`;
          if (yMetric.includes("Chance")) {
            result = [`${(value * 100).toFixed(1)}%`, buildName];
          } else {
            result = [value.toFixed(0), buildName];
          }
        } else {
          result = [value.toString(), name];
        }
      } else {
        const buildName = builds[buildIndex]?.name || `Build ${buildIndex + 1}`;
        if (yMetric.includes("Chance")) {
          result = [`${(value * 100).toFixed(1)}%`, buildName];
        } else {
          result = [value.toFixed(0), buildName];
        }
      }

      // Cache the result
      tooltipCacheRef.current.set(cacheKey, result);

      // Keep cache size reasonable (LRU-like behavior)
      if (tooltipCacheRef.current.size > 300) {
        const firstKey = tooltipCacheRef.current.keys().next().value;
        tooltipCacheRef.current.delete(firstKey!);
      }

      return result;
    },
    [builds, yMetric]
  );

  const tooltipContentStyle = useMemo(
    () => ({
      backgroundColor: "#1a1a1a",
      border: "1px solid #333",
      borderRadius: "6px",
      color: "#f0f0f0",
    }),
    []
  );

  const tooltipLabelStyle = useMemo(
    () => ({
      color: "#999",
      marginBottom: "4px",
    }),
    []
  );

  const tooltipItemStyle = useMemo(
    () => ({
      color: "#f0f0f0",
    }),
    []
  );

  return (
    <div className="damage-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          throttleDelay={100}
          syncMethod={"index"}
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
            labelFormatter={useCallback(
              (value: any) => `${xAxisStat}: ${value}`,
              [xAxisStat]
            )}
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            itemSorter={(item: any) => -item.value}
          />
          <Legend align="right" />

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

          {/* Reference line showing current stat value */}
          {snappedCurrentValue >= xAxisRange.min &&
            snappedCurrentValue <= xAxisRange.max && (
              <ReferenceLine
                x={snappedCurrentValue}
                stroke="#3333ff"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `Current: ${snappedCurrentValue}`,
                  position: "top",
                  fill: "#3333ff",
                  fontSize: 12,
                }}
              />
            )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
},
// Custom equality function to prevent unnecessary re-renders
(prevProps, nextProps) => {
  // Check if builds arrays are the same
  if (prevProps.builds.length !== nextProps.builds.length) return false;
  
  // Deep compare builds if lengths are same
  for (let i = 0; i < prevProps.builds.length; i++) {
    const prevBuild = prevProps.builds[i];
    const nextBuild = nextProps.builds[i];
    
    // Check if builds are structurally equal
    if (JSON.stringify(prevBuild) !== JSON.stringify(nextBuild)) {
      return false;
    }
  }
  
  // Check enemy
  if (JSON.stringify(prevProps.enemy) !== JSON.stringify(nextProps.enemy)) {
    return false;
  }
  
  // Check all other props
  return (
    prevProps.xAxisStat === nextProps.xAxisStat &&
    JSON.stringify(prevProps.xAxisRange) === JSON.stringify(nextProps.xAxisRange) &&
    prevProps.yMetric === nextProps.yMetric &&
    prevProps.combatType === nextProps.combatType &&
    prevProps.attackDirection === nextProps.attackDirection &&
    prevProps.isPvP === nextProps.isPvP &&
    prevProps.skillPotency === nextProps.skillPotency &&
    prevProps.skillFlatAdd === nextProps.skillFlatAdd &&
    prevProps.hitsPerCast === nextProps.hitsPerCast &&
    prevProps.weakenSkillPotency === nextProps.weakenSkillPotency &&
    prevProps.weakenSkillFlatAdd === nextProps.weakenSkillFlatAdd &&
    prevProps.cooldownTime === nextProps.cooldownTime &&
    prevProps.castTime === nextProps.castTime &&
    prevProps.skillCooldownSpecialization === nextProps.skillCooldownSpecialization &&
    prevProps.useCDR === nextProps.useCDR &&
    prevProps.useAttackSpeed === nextProps.useAttackSpeed
  );
});
