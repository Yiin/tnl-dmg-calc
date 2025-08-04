import { describe, it, expect } from 'vitest';
import { calculateActualCastTime, calculateActualCooldown, calculateDPS } from './calculations';
import { Build, Enemy } from './types';

describe('Attack Speed Calculations', () => {
  it('should calculate actual cast time based on attack speed', () => {
    // Base case: no attack speed modifier
    expect(calculateActualCastTime(3.6)).toBe(3.6);
    
    // With attack speed time of 0.36s (base 1.0s)
    expect(calculateActualCastTime(3.6, 0.36)).toBe(1.296);
    
    // With attack speed time of 0.5s (base 1.0s)
    expect(calculateActualCastTime(3.6, 0.5)).toBe(1.8);
    
    // With attack speed time of 0.42s (from the example)
    expect(calculateActualCastTime(3.6, 0.42)).toBeCloseTo(1.512, 3);
  });

  it('should use attack speed in DPS calculations', () => {
    const build: Build = {
      name: 'Test Build',
      minDMG: 100,
      maxDMG: 200,
      meleeCritical: 1000,
      meleeHit: 2000,
      meleeHeavyAttack: 500,
      attackSpeedTime: 0.5, // 50% faster than base
    };
    
    const enemy: Enemy = {
      name: 'Test Enemy',
      meleeDefense: 1000,
      meleeEvasion: 500,
      meleeEndurance: 800,
      meleeHeavyAttackEvasion: 200,
    };
    
    const dpsWithoutAttackSpeed = calculateDPS(
      { ...build, attackSpeedTime: undefined },
      enemy,
      'melee',
      'front',
      1,    // cooldown
      2,    // cast time
      false // PvE
    );
    
    const dpsWithAttackSpeed = calculateDPS(
      build,
      enemy,
      'melee',
      'front',
      1,    // cooldown
      2,    // cast time
      false // PvE
    );
    
    // DPS should be higher with faster attack speed
    expect(dpsWithAttackSpeed).toBeGreaterThan(dpsWithoutAttackSpeed);
    
    // The ratio should match the attack speed improvement
    // With 0.5s attack speed (base 1.0s), cast time becomes 1s instead of 2s
    const expectedRatio = 2; // 2s cast time / 1s actual cast time
    const actualRatio = dpsWithAttackSpeed / dpsWithoutAttackSpeed;
    expect(actualRatio).toBeCloseTo(expectedRatio, 1);
  });
});

describe('Cooldown Speed Calculations', () => {
  it('should calculate actual cooldown based on cooldown speed', () => {
    // Base case: no cooldown speed
    expect(calculateActualCooldown(60)).toBe(60);
    
    // With cooldown speed of 53.8% (from the example)
    expect(calculateActualCooldown(60, 53.8, 9)).toBeCloseTo(33.16, 2);
    
    // With cooldown speed of 40.9%
    const reduction409 = 40.9 / (40.9 + 100); // ~0.290
    expect(calculateActualCooldown(10, 40.9)).toBeCloseTo(10 * (1 - reduction409), 2);
    
    // With specialization only
    expect(calculateActualCooldown(60, 0, 9)).toBe(51);
  });

  it('should use cooldown speed in DPS calculations', () => {
    const build: Build = {
      name: 'Test Build',
      minDMG: 100,
      maxDMG: 200,
      meleeCritical: 1000,
      meleeHit: 2000,
      meleeHeavyAttack: 500,
      cooldownSpeed: 50, // 50% cooldown speed stat
    };
    
    const enemy: Enemy = {
      name: 'Test Enemy',
      meleeDefense: 1000,
      meleeEvasion: 500,
      meleeEndurance: 800,
      meleeHeavyAttackEvasion: 200,
    };
    
    // Test with a skill that has 10s cooldown and 1s cast time
    const dpsWithoutCooldownSpeed = calculateDPS(
      { ...build, cooldownSpeed: undefined },
      enemy,
      'melee',
      'front',
      10,   // cooldown
      1,    // cast time
      false // PvE
    );
    
    const dpsWithCooldownSpeed = calculateDPS(
      build,
      enemy,
      'melee',
      'front',
      10,   // cooldown
      1,    // cast time
      false, // PvE
      1.0,  // skillPotency
      0,    // skillFlatAdd
      1,    // hitsPerCast
      0,    // weakenSkillPotency
      0,    // weakenSkillFlatAdd
      0     // skillCooldownSpecialization
    );
    
    // DPS should be higher with cooldown speed
    expect(dpsWithCooldownSpeed).toBeGreaterThan(dpsWithoutCooldownSpeed);
    
    // With 50% cooldown speed, the actual cooldown should be:
    // 10 * (1 - 50/(50+100)) = 10 * (1 - 0.333) = 6.67s
    const expectedRatio = 10 / 6.67;
    const actualRatio = dpsWithCooldownSpeed / dpsWithoutCooldownSpeed;
    expect(actualRatio).toBeCloseTo(expectedRatio, 1);
  });
});