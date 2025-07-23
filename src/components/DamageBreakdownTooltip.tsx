import React from "react";
import { DamageBreakdown } from "../types";

interface DamageBreakdownTooltipProps {
  breakdown: DamageBreakdown | null;
  xValue: number;
  xAxisStat: string;
}

export const DamageBreakdownTooltip: React.FC<DamageBreakdownTooltipProps> = ({
  breakdown,
  xValue,
  xAxisStat,
}) => {
  if (!breakdown) return null;

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(1);

  return (
    <div className="damage-breakdown-tooltip">
      <h4>Damage Breakdown</h4>
      <div className="breakdown-item">
        <strong>
          {xAxisStat}: {xValue}
        </strong>
      </div>

      <div className="breakdown-section">
        <h5>Chances</h5>
        <div className="breakdown-item">
          Hit Chance: <span>{formatPercent(breakdown.hitChance)}</span>
        </div>
        <div className="breakdown-item">
          Crit Chance: <span>{formatPercent(breakdown.critChance)}</span>
        </div>
        <div className="breakdown-item">
          Glance Chance: <span>{formatPercent(breakdown.glanceChance)}</span>
        </div>
        <div className="breakdown-item">
          Normal Chance: <span>{formatPercent(breakdown.normalChance)}</span>
        </div>
        <div className="breakdown-item">
          Heavy Chance: <span>{formatPercent(breakdown.heavyChance)}</span>
        </div>
      </div>

      <div className="breakdown-section">
        <h5>Damage</h5>
        <div className="breakdown-item">
          Base Damage: <span>{formatNumber(breakdown.baseDamage)}</span>
        </div>
        <div className="breakdown-item">
          Skill Multiplier:{" "}
          <span>{formatNumber(breakdown.skillMultiplier)}</span>
        </div>
        <div className="breakdown-item">
          Defense Reduction:{" "}
          <span>{formatPercent(breakdown.defenseReduction)}</span>
        </div>
        <div className="breakdown-item">
          Expected Final Damage:{" "}
          <span>{formatNumber(breakdown.finalDamage)}</span>
        </div>
        <div className="breakdown-item">
          <strong>
            Single Hit Damage: {formatNumber(breakdown.expectedDamage)}
          </strong>
        </div>
      </div>
    </div>
  );
};
