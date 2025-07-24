import { Build } from "./types";

export interface ParsedStats {
  [key: string]: number | string;
}

type TokenType =
  | "header"
  | "stat_name"
  | "value"
  | "percentage"
  | "weapon_damage"
  | "separator"
  | "unknown";

interface Token {
  type: TokenType;
  content: string;
  lineIndex: number;
}

export function parseTextToBuild(
  text: string,
  buildName: string = "Imported Build"
): Build {
  // remove all text UNTIL the last line that contains "Main Stats"
  let lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const mainStatsLine = lines.findLastIndex((line) =>
    line.includes("Main Stats")
  );
  lines = lines
    .slice(mainStatsLine + 1)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const tokens = tokenizeLines(lines);
  const stats = parseTokens(tokens, lines);

  // Map parsed stats to Build interface
  const build: Build = {
    name: buildName,
    minDMG: stats.minDMG || 0,
    maxDMG: stats.maxDMG || 0,
    ...(stats.offhandMinDMG && stats.offhandMaxDMG
      ? {
          offhandMinDMG: stats.offhandMinDMG,
          offhandMaxDMG: stats.offhandMaxDMG,
        }
      : {}),

    // PvE
    speciesDamageBoost: parseStatValue(stats["Species Damage Boost"]),
    pveDamageMultiplier: parsePercentage(stats["PVE Damage Multiplier"]),

    // Attack stats
    bonusDamage: parseStatValue(stats["Bonus Damage"]),

    // Critical stats
    rangedCritical: parseStatValue(stats["Ranged Critical Hit Chance"]),
    meleeCritical: parseStatValue(stats["Melee Critical Hit Chance"]),
    magicCritical: parseStatValue(stats["Magic Critical Hit Chance"]),
    criticalDamage: parsePercentage(stats["Critical Damage"]),

    // Heavy attack stats
    rangedHeavyAttack: parseStatValue(stats["Ranged Heavy Attack Chance"]),
    meleeHeavyAttack: parseStatValue(stats["Melee Heavy Attack Chance"]),
    magicHeavyAttack: parseStatValue(stats["Magic Heavy Attack Chance"]),

    // Hit stats
    rangedHit: parseStatValue(stats["Ranged Hit Chance"]),
    meleeHit: parseStatValue(stats["Melee Hit Chance"]),
    magicHit: parseStatValue(stats["Magic Hit Chance"]),

    // Skill stats
    skillDamageBoost: parseStatValue(stats["Skill Damage Boost"]),
    weakenChance: parseStatValue(stats["Weaken Chance"]),

    // Off-hand chance
    offhandChance:
      (parsePercentage(stats["Off-Hand Weapon Attack Chance"]) || 0) / 100,

    shieldBlockPenetrationChance: parsePercentage(
      stats["Shield Block Penetration Chance"]
    ),

    // Defense stats
    meleeDefense: parseStatValue(stats["Melee Defense"]),
    rangedDefense: parseStatValue(stats["Ranged Defense"]),
    magicDefense: parseStatValue(stats["Magic Defense"]),

    // Endurance stats
    meleeEndurance: parseStatValue(stats["Melee Endurance"]),
    rangedEndurance: parseStatValue(stats["Ranged Endurance"]),
    magicEndurance: parseStatValue(stats["Magic Endurance"]),

    // Evasion stats
    meleeEvasion: parseStatValue(stats["Melee Evasion"]),
    rangedEvasion: parseStatValue(stats["Ranged Evasion"]),
    magicEvasion: parseStatValue(stats["Magic Evasion"]),

    // Heavy Attack Evasion stats
    meleeHeavyAttackEvasion: parseStatValue(
      stats["Melee Heavy Attack Evasion"]
    ),
    rangedHeavyAttackEvasion: parseStatValue(
      stats["Ranged Heavy Attack Evasion"]
    ),
    magicHeavyAttackEvasion: parseStatValue(
      stats["Magic Heavy Attack Evasion"]
    ),

    // Resistance stats
    damageReduction: parseStatValue(stats["Damage Reduction"]),
    skillDamageResistance: parseStatValue(stats["Skill Damage Resistance"]),

    // Positional stats
    backHitChance: parseStatValue(stats["Back Hit Chance"]),
    sideHitChance: parseStatValue(stats["Side Hit Chance"]),
    backHeavyAttackChance: parseStatValue(stats["Back Heavy Attack Chance"]),
    sideHeavyAttackChance: parseStatValue(stats["Side Heavy Attack Chance"]),
    backCriticalHit: parseStatValue(stats["Back Critical Hit"]),
    sideCriticalHit: parseStatValue(stats["Side Critical Hit"]),
  };

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(build).filter(([_, value]) => value !== undefined)
  ) as Build;
}

function tokenizeLines(lines: string[]): Token[] {
  const tokens: Token[] = [];
  const headers = [
    "Search for stats..",
    "Favorites",
    "Attack",
    "Critical",
    "Hit",
    "Protection",
    "Attributes",
    "Resources",
    "Movement",
    "Skills",
    "Resistance",
    "Crowd Control",
    "PvP",
    "Boss",
    "Missing",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if it's a header
    if (headers.includes(line)) {
      tokens.push({ type: "header", content: line, lineIndex: i });
      continue;
    }

    // Check for weapon damage marker
    if (line === "Max Damage") {
      tokens.push({ type: "weapon_damage", content: line, lineIndex: i });
      continue;
    }

    // Check for separator
    if (line === "~") {
      tokens.push({ type: "separator", content: line, lineIndex: i });
      continue;
    }

    // Check if it's just a value (number with optional formatting)
    // Support both decimal dots (631.8) and decimal commas (631,8)
    if (/^[-\d,\s]+\.?\d*%?s?$/.test(line) || /^\(\d+\.?\d*%\)$/.test(line) || /^[\d\s]+,\d{1,2}$/.test(line)) {
      tokens.push({ type: "value", content: line, lineIndex: i });
      continue;
    }

    // Check if it's a stat line with value and percentage
    // Support both decimal dots and commas
    if (/^(.+?)\s+([\d,\s.-]+)\s*\((\d+\.?\d*)%\)$/.test(line)) {
      tokens.push({ type: "stat_name", content: line, lineIndex: i });
      continue;
    }

    // Check if it's a stat line with just a value
    // Support both decimal dots and commas
    if (/^(.+?)\s+([-\d,\s\.%]+)$/.test(line)) {
      tokens.push({ type: "stat_name", content: line, lineIndex: i });
      continue;
    }

    // Otherwise, it might be just a stat name
    tokens.push({ type: "stat_name", content: line, lineIndex: i });
  }

  return tokens;
}

function parseTokens(tokens: Token[], lines: string[]): any {
  const stats: any = {};
  let weaponDamageCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "header") {
      continue;
    }

    if (token.type === "weapon_damage") {
      // Parse weapon damage sequence: Max Damage, value, ~, value
      if (
        i + 3 < tokens.length &&
        tokens[i + 1].type === "value" &&
        tokens[i + 2].type === "separator" &&
        tokens[i + 3].type === "value"
      ) {
        const minVal = parseStatValue(tokens[i + 1].content) || 0;
        const maxVal = parseStatValue(tokens[i + 3].content) || 0;

        if (weaponDamageCount === 0) {
          stats.minDMG = minVal;
          stats.maxDMG = maxVal;
        } else if (weaponDamageCount === 1) {
          stats.offhandMinDMG = minVal;
          stats.offhandMaxDMG = maxVal;
        }

        weaponDamageCount++;
        i += 3; // Skip the processed tokens
      }
      continue;
    }

    if (token.type === "stat_name") {
      const line = lines[token.lineIndex];

      // Parse stat with value and percentage on same line
      const percentMatch = line.match(
        /^(.+?)\s+([\d,\s.-]+)\s*\((\d+\.?\d*)%\)$/
      );
      if (percentMatch) {
        const statName = percentMatch[1].trim();
        const rawValueStr = percentMatch[2];
        
        // Use the same decimal comma handling
        let rawValue;
        const decimalCommaMatch = rawValueStr.match(/^([\d\s]+),(\d{1,2})$/);
        if (decimalCommaMatch) {
          const integerPart = decimalCommaMatch[1].replace(/\s/g, '');
          const decimalPart = decimalCommaMatch[2];
          rawValue = parseFloat(`${integerPart}.${decimalPart}`);
        } else {
          rawValue = parseFloat(rawValueStr.replace(/,/g, ""));
        }
        
        const percentValue = parseFloat(percentMatch[3]);
        stats[statName] = rawValue;
        stats[`${statName} Percent`] = percentValue;
        continue;
      }

      // Parse stat with value on same line
      const simpleMatch = line.match(/^(.+?)\s+([-\d,\s\.%]+)$/);
      if (simpleMatch) {
        const statName = simpleMatch[1].trim();
        const value = simpleMatch[2].trim();

        // Special handling for Attack Speed - store both time and percentage values
        if (statName === "Attack Speed") {
          if (value.endsWith("s")) {
            stats["Attack Speed Time"] = value;
          } else {
            stats[statName] = value;
          }
        } else {
          stats[statName] = value;
        }
        continue;
      }

      // Check if next token is a value (multi-line stat)
      if (i + 1 < tokens.length && tokens[i + 1].type === "value") {
        const statName = line.trim();
        const value = tokens[i + 1].content;

        // Check if there's a percentage value after
        if (
          i + 2 < tokens.length &&
          tokens[i + 2].type === "value" &&
          tokens[i + 2].content.match(/^\(\d+\.?\d*%\)$/)
        ) {
          const percentMatch =
            tokens[i + 2].content.match(/^\((\d+\.?\d*)%\)$/);
          if (percentMatch) {
            stats[statName] = value;
            stats[`${statName} Percent`] = parseFloat(percentMatch[1]);
            i += 2; // Skip both value tokens
            continue;
          }
        }

        // Special handling for Attack Speed - store both time and percentage values
        if (statName === "Attack Speed") {
          if (value.endsWith("s")) {
            stats["Attack Speed Time"] = value;
          } else {
            stats[statName] = value;
          }
        } else {
          stats[statName] = value;
        }
        i += 1; // Skip the value token
      }
    }
  }

  return stats;
}

function parseStatValue(
  value: string | number | undefined
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  
  // Handle both comma as decimal separator (631,8) and as thousand separator (1,000)
  // If the value has a comma followed by 1-2 digits at the end, treat it as decimal
  const str = String(value);
  const decimalCommaMatch = str.match(/^([\d\s]+),(\d{1,2})$/);
  if (decimalCommaMatch) {
    // Replace comma with dot for decimal: "631,8" -> "631.8"
    const integerPart = decimalCommaMatch[1].replace(/\s/g, '');
    const decimalPart = decimalCommaMatch[2];
    return parseFloat(`${integerPart}.${decimalPart}`);
  }
  
  // Otherwise, remove commas (thousand separators) and parse
  return parseFloat(str.replace(/[,%]/g, ""));
}

function parsePercentage(
  value: string | number | undefined
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;

  const str = String(value);
  const match = str.match(/([-\d.]+)%/);
  if (match) {
    return parseFloat(match[1]);
  }

  const num = parseFloat(str.replace(/[,%]/g, ""));
  return isNaN(num) ? undefined : num;
}
