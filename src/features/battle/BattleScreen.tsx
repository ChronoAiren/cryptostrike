import React, { useEffect, useRef, useState } from 'react';
import { useGame, ITEMS } from '../../context/GameStateContext';
import { FighterSprite } from '../sprites/FighterSprite';
import { VfxSprite } from '../sprites/VfxSprite';
import { derivePlayerPose, deriveEnemyPose } from '../sprites/deriveFighterPose';
import { ItemIcon } from '../sprites/ItemIcon';
import { MarketChart, formatPrice } from '../market/MarketChart';
import { ExitConfirmDialog } from '../../components/feedback/ExitConfirmDialog';

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return match;
}

/* ─── Damage number spawner ─── */
function spawnDmg(container: HTMLElement, text: string, cls: string, x: number, y: number) {
  const el = document.createElement('div');
  el.className = 'dmg-n ' + cls;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  container.appendChild(el);
  setTimeout(() => el.remove(), 1150);
}

/* ─── GBA HP bar color helper ─── */
function gbaHpColor(pct: number) {
  if (pct > 50) return 'gba-g';
  if (pct > 25) return 'gba-y';
  return 'gba-r';
}

function gbaHpPct(hp: number, maxHp: number) {
  return Math.max(0, (hp / maxHp) * 100);
}

/* ─── Stat bar percentage for GBA ─── */
function statPct(val: number, max: number) {
  return Math.min(100, Math.round((val / max) * 100));
}

export const BattleScreen: React.FC = () => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const {
    round,
    battlePhase,
    playerState,
    enemyState,
    battleLog,
    playerMove,
    enemyMove,
    entryPrice,
    currentPrice,
    activeItems,
    useActiveItem: triggerActiveItem,
    setPlayerAction,
    user,
    selectedCoin,
    equippedItems,
    enemyEquippedItems,
    damageReport,
    isPlayerAttacking,
    isEnemyAttacking,
    isPlayerHit,
    isEnemyHit,
    animationPhase,
    turnOwner,
    showCritFlash,
    showDamageNumber,
    timerVal,
    damageDealtDisplay,
    accuracyDisplay,
    setLoading,
  } = useGame();

  const desktop = useMediaQuery('(min-width: 769px)');
  const landscape = useMediaQuery('(orientation: landscape)');
  const rowLayout = desktop || landscape;
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const dmgcRef = useRef<HTMLDivElement>(null);

  // Auto scroll battle logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLog]);

  // Stars background
  useEffect(() => {
    const c = starsRef.current;
    if (!c) return;
    const p = c.parentElement;
    if (!p) return;
    c.width = p.offsetWidth || 600;
    c.height = p.offsetHeight || 300;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * c.width;
      const y = Math.random() * c.height * 0.6;
      const r = Math.random() < 0.1 ? 0.8 : 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.2})`;
      ctx.fill();
    }
  }, []);

  // Damage number effects
  useEffect(() => {
    if (!showDamageNumber || !damageReport || !dmgcRef.current) return;
    const dc = dmgcRef.current;

    if (turnOwner === 'player' && damageReport.playerDamage > 0) {
      spawnDmg(dc, '-' + damageReport.playerDamage, damageReport.isCrit ? 'dmg-wht' : 'dmg-gold', 60, 30);
      if (damageReport.isCrit) setTimeout(() => spawnDmg(dc, 'CRIT!', 'dmg-wht', 46, 10), 100);
    }
    if (turnOwner === 'player' && damageReport.playerEffectType === 'buf') {
      const txt = damageReport.abilityType === 'def' ? '▲DEF' : '▲ATK';
      spawnDmg(dc, txt, 'dmg-gold', 55, 55);
    }
    if (turnOwner === 'player' && damageReport.playerEffectType === 'deb' && damageReport.abilityType) {
      const txt = damageReport.abilityType === 'atk' ? '▼ATK' : '▼DEF';
      spawnDmg(dc, txt, 'dmg-gold', 55, 65);
    }
    if (turnOwner === 'player' && damageReport.playerEffectType === 'def') spawnDmg(dc, 'SHIELD', 'dmg-gold', 46, 55);
    if (turnOwner === 'enemy' && damageReport.enemyDamage > 0) {
      spawnDmg(dc, '-' + damageReport.enemyDamage, 'dmg-red', 210, 70);
    }
    if (damageReport.playerEffectType === 'hold' && damageReport.playerDamage === 0) spawnDmg(dc, '+HP', 'dmg-grn', 215, 68);
  }, [showDamageNumber, turnOwner, damageReport]);

  if (!playerState || !enemyState || !selectedCoin) return null;

  // During player's turn animation, enemy damage hasn't visually happened yet
  const pendingEnemyDmg = turnOwner === 'player' && animationPhase !== 'idle'
    ? (damageReport?.enemyDamage ?? 0)
    : 0;
  const displayPlayerHp = Math.min(playerState.maxHp, playerState.hp + pendingEnemyDmg);
  const playerHpPct = gbaHpPct(displayPlayerHp, playerState.maxHp);
  const enemyHpPct = gbaHpPct(enemyState.hp, enemyState.maxHp);

  // Effective stats from buffs/debuffs for realtime display
  const atkMult = playerState.buffs.filter(b => b.type === 'atk' && b.multiplier).reduce((a, b) => a * (b.multiplier ?? 1), 1);
  const atkDebuff = playerState.debuffs.filter(d => d.type === 'atk' && d.multiplier).reduce((a, d) => a * (d.multiplier ?? 1), 1);
  const effectiveAtk = playerState.atk * atkMult * atkDebuff;
  const defBonus = playerState.buffs.filter(b => b.type === 'def' && b.amount).reduce((a, b) => a + (b.amount ?? 0), 0);
  const effectiveDef = Math.min(0.75, playerState.def + defBonus);

  // Shield from DEFEND action
  const shield = playerState.buffs.find(b => b.type === 'shield');
  const shieldHp = shield?.amount ?? 0;

  const playerPose = derivePlayerPose({
    animationPhase,
    isAttacking: isPlayerAttacking,
    isHit: isPlayerHit,
    isEnemy: false,
    playerEffectType: damageReport?.playerEffectType,
    turnOwner,
  });

  const enemyPose = deriveEnemyPose({
    animationPhase,
    isAttacking: isEnemyAttacking,
    isHit: isEnemyHit,
    isEnemy: true,
    enemyEffectType: damageReport?.enemyDamage ? 'atk' : undefined,
    turnOwner,
  });

  const getPhaseColorClass = () => {
    switch (battlePhase) {
      case 'rpg': return 'p-grn';
      case 'mkt': return 'p-ylw';
      case 'res': return 'p-red';
    }
  };

  const actionLabels: Record<string, { lbl: string; sub: string; type: string; typeCls: string }> = {
    attack: { lbl: 'ATTACK', sub: 'Deal damage', type: '▲ CALL', typeCls: 'ab-call' },
    buff: { lbl: 'BUFF', sub: 'Boost ATK', type: '▲ CALL', typeCls: 'ab-call' },
    defend: { lbl: 'DEFEND', sub: 'Boost DEF', type: '▼ PUT', typeCls: 'ab-put' },
    debuff: { lbl: 'DEBUFF', sub: 'Weaken enemy', type: '▼ PUT', typeCls: 'ab-put' },
    hold: { lbl: 'HOLD', sub: 'Skip — Hodler heals', type: '⏸ HOLD', typeCls: 'ab-hold' },
  };

  const timerTotal = battlePhase === 'rpg' ? 10 : 15;
  const timerPct = Math.max(0, (timerVal / timerTotal) * 100);

  // Equipped passive gear (non-active items)
  const passiveGear = equippedItems
    .map(id => ({ id, item: ITEMS.find(i => i.id === id) }))
    .filter(({ item }) => item && !item.isActive)
    .map(({ item }) => item!);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Crit Flash Overlay */}
      {showCritFlash && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: '#FFF', opacity: 0.8, zIndex: 100,
            pointerEvents: 'none',
            animation: 'critFlash 0.12s ease-in-out 3',
          }}
        />
      )}

      {/* ═══ TOPBAR ═══ */}
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '2px solid var(--border-dim)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--color-gold)', letterSpacing: '1px' }}>
          CRYPTOSTRIKE
        </div>
        <span className="pill p-neu" style={{ fontSize: '8px' }}>Round {round}</span>
        <span className="pill p-gld" style={{ fontSize: '8px' }}>{selectedCoin.symbol}</span>
        <span className={`pill ${getPhaseColorClass()}`} style={{ fontSize: '8px' }}>{battlePhase.toUpperCase()}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
          <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--color-gold)', fontWeight: 700 }}>💰{user.gold}</span>
          <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--color-purple)', fontWeight: 700 }}>💎{user.gems}</span>
        </div>
      </div>

      {/* ═══ BODY: side-by-side on desktop, stacked on mobile ═══ */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: rowLayout ? 'row' : 'column',
        minHeight: 0, overflow: 'hidden',
      }}>
        {/* ═══ ARENA (sprite stage + GBA panels) ═══ */}
        <div
          style={{
            flex: rowLayout ? '0 0 40%' : '0 0 auto',
            position: 'relative',
            minHeight: rowLayout ? '100%' : '160px',
            background: 'linear-gradient(180deg,#040810 0%,#070F1A 35%,#0A1520 65%,#0C1A28 100%)',
            overflow: 'hidden',
            borderBottom: rowLayout ? 'none' : '2px solid var(--border-dim)',
            borderRight: rowLayout ? '2px solid var(--border-dim)' : 'none',
          }}
        >
        {/* Stars */}
        <canvas ref={starsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        {/* Ground */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '42px',
          background: 'linear-gradient(0deg,#091A09 0%,#0D240D 60%,transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '42px',
          backgroundImage:
            'repeating-linear-gradient(90deg,rgba(34,197,94,.06) 0,rgba(34,197,94,.06) 1px,transparent 1px,transparent 48px),' +
            'repeating-linear-gradient(0deg,rgba(34,197,94,.04) 0,rgba(34,197,94,.04) 1px,transparent 1px,transparent 12px)',
        }} />

        {/* PLAYER GROUP — bottom-left (sprite above, stats below) */}
        <div style={{
          position: 'absolute', left: '8px', bottom: '8px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', zIndex: 5,
          transition: 'transform 0.15s ease-out',
          transform:
            turnOwner === 'player' && (animationPhase === 'launch' || animationPhase === 'impact')
              && damageReport?.playerEffectType === 'atk'
              ? 'translateX(36px)'
              : turnOwner === 'enemy' && animationPhase === 'impact'
                ? 'translateX(-12px)'
                : 'translateX(0)',
        }}>
          <FighterSprite
            characterKey={playerState.spriteKey}
            equippedItems={equippedItems}
            pose={playerPose}
            playing={playerPose === 'idle' || battlePhase === 'res'}
            loop={playerPose !== 'attack'}
            isEnemy={false}
            status={playerState.buffs.length > 0 ? 'buffed' : playerState.debuffs.length > 0 ? 'debuffed' : 'none'}
            size={80}
            impact={isPlayerHit}
          />
          {/* Player stats panel — HP dominant, combat stats grouped, utility stats lighter */}
          <div style={{
            background: 'var(--gba-bg)', border: '3px solid var(--gba-border)',
            borderRadius: '4px', padding: '5px 8px 5px', minWidth: '140px',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,.04), 0 4px 20px rgba(0,0,0,.7)',
          }}>
            {/* Name row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--gba-text)', letterSpacing: '0.5px' }}>
                {user.avatar} {user.username.toUpperCase()}
              </span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--gba-dim)' }}>
                Lv{Math.ceil(displayPlayerHp / 20)}
              </span>
            </div>

            {/* HP bar — prominent, full width */}
            <div style={{ marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--gba-text)' }}>HP</span>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#fff', fontWeight: 700 }}>
                  {Math.ceil(displayPlayerHp)}
                </span>
              </div>
              <div className="gba-bar-bg" style={{ height: '8px' }}>
                <div className={`gba-bar-fill ${gbaHpColor(playerHpPct)}`} style={{ width: `${playerHpPct}%`, height: '100%' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--gba-dim)', textAlign: 'right', marginTop: '1px' }}>
                {Math.ceil(displayPlayerHp)}/{playerState.maxHp}
              </div>
            </div>

            {/* Shield bar (DEFEND action) — appears below HP when shield is active */}
            {shieldHp > 0 && (
              <div style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#60A5FA' }}>SHIELD</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#93C5FD' }}>
                    {Math.ceil(shieldHp)}
                  </span>
                </div>
              </div>
            )}

            {/* Combat stats — ATK + DEF paired, same visual weight */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
              {[
                { l: 'ATK', v: effectiveAtk, m: 1.6, c: '#EF4444', f: (v: number) => v.toFixed(1) },
                { l: 'DEF', v: effectiveDef, m: 0.65, c: '#38BDF8', f: (v: number) => Math.round(v * 100) + '%' },
              ].map(s => (
                <div key={s.l} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--gba-dim)' }}>{s.l}</span>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--gba-text)' }}>{s.f(s.v)}</span>
                  </div>
                  <div style={{ height: '3px', background: '#040E04', borderRadius: '1px', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${statPct(s.v, s.m)}%`, background: s.c, borderRadius: '1px', transition: 'width .55s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Utility stats — SPD + LCK paired, thinner bars */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
              {[
                { l: 'SPD', v: playerState.spd, m: 80, c: '#22C55E', f: (v: number) => Math.round(v).toString() },
                { l: 'LCK', v: playerState.lk, m: 35, c: '#F0B429', f: (v: number) => Math.round(v).toString() },
              ].map(s => (
                <div key={s.l} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--gba-dim)' }}>{s.l}</span>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--gba-text)' }}>{s.f(s.v)}</span>
                  </div>
                  <div style={{ height: '2px', background: '#040E04', borderRadius: '1px', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${statPct(s.v, s.m)}%`, background: s.c, borderRadius: '1px', transition: 'width .55s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Buffs/debuffs — compact badges with direction arrows */}
            {(playerState.buffs.length > 0 || playerState.debuffs.length > 0) && (
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', borderTop: '1px solid rgba(155,188,15,.1)', paddingTop: '3px' }}>
                {playerState.buffs.map((b, i) => (
                  <span key={i} style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', background: '#0D2B00', color: 'var(--gba-text)', border: '1px solid #1B4A00', padding: '1px 3px', borderRadius: '2px' }}>
                    {b.type === 'atk' ? '▲' : '▲'}{b.type.toUpperCase()}+{b.roundsRemaining >= 99 ? '∞' : b.roundsRemaining}
                  </span>
                ))}
                {playerState.debuffs.map((d, i) => (
                  <span key={i} style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', background: '#2B0000', color: '#EF4444', border: '1px solid #4A0000', padding: '1px 3px', borderRadius: '2px' }}>
                    {d.type === 'atk' ? '▼' : '▼'}{d.type.toUpperCase()}-{d.roundsRemaining}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ENEMY GROUP — top-right (panel above, sprite below, like GBA Pokemon) */}
        <div style={{
          position: 'absolute', right: '8px', top: '8px', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px',
          transition: 'transform 0.15s ease-out',
          transform:
            turnOwner === 'enemy' && (animationPhase === 'launch' || animationPhase === 'impact')
              ? 'translateX(-36px)'
              : turnOwner === 'player' && animationPhase === 'impact'
                && damageReport?.playerEffectType === 'atk'
                ? 'translateX(12px)'
                : 'translateX(0)',
        }}>
          <div className="gba-panel-e" style={{ position: 'static', minWidth: '120px', boxShadow: 'none', margin: 0, padding: '6px 10px 6px' }}>
            <div className="gba-name-row">
              <span className="gba-name">{enemyState.name.toUpperCase()}</span>
              <span className="gba-lv">Lv{Math.ceil(enemyState.hp / 20)}</span>
            </div>
            <div className="gba-hp-row">
              <span className="gba-hp-lbl">HP</span>
              <div className="gba-bar-bg">
                <div className={`gba-bar-fill ${gbaHpColor(enemyHpPct)}`} style={{ width: `${enemyHpPct}%` }} />
              </div>
            </div>
            <div className="gba-hp-nums">
              <span>{Math.ceil(enemyState.hp)}</span>/<span>{enemyState.maxHp}</span>
            </div>
            <div className="gba-status-row">
              {enemyState.buffs.map((b, i) => (
                <span key={i} className="gba-tag b">{b.type === 'atk' ? 'ATK+' : 'DEF+'} {b.roundsRemaining >= 99 ? '∞' : b.roundsRemaining}</span>
              ))}
              {enemyState.debuffs.map((d, i) => (
                <span key={i} className="gba-tag d">{d.type === 'atk' ? 'ATK-' : 'TR-'} {d.roundsRemaining}</span>
              ))}
            </div>
          </div>
          <FighterSprite
            characterKey={enemyState.spriteKey}
            equippedItems={enemyEquippedItems}
            pose={enemyPose}
            playing={enemyPose === 'idle' || battlePhase === 'res'}
            loop={enemyPose !== 'attack'}
            isEnemy={true}
            status={enemyState.buffs.length > 0 ? 'buffed' : enemyState.debuffs.length > 0 ? 'debuffed' : 'none'}
            size={80}
            impact={isEnemyHit}
          />
        </div>

        {/* Damage numbers container */}
        <div ref={dmgcRef} className="dmg-cont" />

        {/* ═══ VFX Overlays ═══ */}
        {(animationPhase === 'launch' || animationPhase === 'impact') && damageReport && (() => {
          const dr = damageReport;
          const isPlayerTurn = turnOwner === 'player';
          const isEnemyTurn = turnOwner === 'enemy';
          const peff = dr.playerEffectType;

          // Determine VFX action and position
          let vfxAction: 'attack' | 'defense' | 'buff' | 'debuff' | 'heal' | null = null;
          let vfxPos: Record<string, string> = {};

          if (isPlayerTurn && dr.playerDamage > 0 && (peff === 'atk' || peff === 'deb')) {
            // Player attack/debuff → ON enemy sprite (top-right)
            vfxAction = peff === 'atk' ? 'attack' : 'debuff';
            vfxPos = rowLayout
              ? { right: '10%', top: '25px' }
              : { right: '8%', top: '22%' };
          } else if (isEnemyTurn && dr.enemyDamage > 0) {
            // Enemy attack → ON player sprite (bottom-left)
            vfxAction = 'attack';
            vfxPos = rowLayout
              ? { left: '8%', bottom: '25px' }
              : { left: '6%', bottom: '28%' };
          } else if (isPlayerTurn && (peff === 'def' || peff === 'buf')) {
            // Self buff/defense → RIGHT of player sprite
            vfxAction = peff === 'def' ? 'defense' : 'buff';
            vfxPos = rowLayout
              ? { left: '30%', bottom: '30px' }
              : { left: '32%', top: '40%' };
          } else if (isPlayerTurn && peff === 'hold') {
            // Heal → RIGHT of player sprite, slightly higher
            vfxAction = 'heal';
            vfxPos = rowLayout
              ? { left: '30%', bottom: '50px' }
              : { left: '32%', top: '32%' };
          }

          if (!vfxAction) return null;

          return (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25 }}>
              <div style={{ position: 'absolute', ...vfxPos, transform: 'translate(-50%, 0)' }}>
                <VfxSprite
                  action={vfxAction}
                  playing
                  size={64}
                  fps={12}
                  frameCount={10}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* ═══ CHART + ACTIONS ═══ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto',
        ...(rowLayout ? { fontSize: '11px' } : {}),
      }}>
        {/* Chart */}
        <div style={{ flexShrink: 0, padding: rowLayout ? '6px 10px' : '8px 12px', borderBottom: '2px solid var(--border-dim)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.8px' }}>{selectedCoin.symbol}/USDT</span>
              <span style={{ fontFamily: 'var(--font-accent)', fontSize: 'clamp(14px,2.2vw,18px)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatPrice(currentPrice)}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: currentPrice >= entryPrice ? 'var(--color-mint)' : 'var(--color-coral)',
              }}>
                {currentPrice >= entryPrice ? '+' : ''}{(((currentPrice - entryPrice) / entryPrice) * 100).toFixed(3)}%
              </span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--text-muted)' }}>
              <div>Entry</div>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '10px', color: 'var(--text-secondary)' }}>{formatPrice(entryPrice)}</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-mint)', flexShrink: 0 }} />
              Price
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--color-gold)', borderRadius: '1px', flexShrink: 0 }} />
              Entry
            </span>
            {playerMove && playerMove !== 'hold' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: playerMove === 'call' ? 'var(--color-mint)' : 'var(--color-coral)',
                }} />
                {playerMove === 'call' ? 'Bet UP' : 'Bet DOWN'}
              </span>
            )}
          </div>

          <MarketChart />

          {/* Bet badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Your bet:</span>
            <span className={`abadge ${playerMove ? (playerMove === 'call' ? 'ab-call' : playerMove === 'put' ? 'ab-put' : 'ab-hold') : 'ab-wait'}`}>
              {playerMove ? (playerMove === 'call' ? '▲ CALL / BUY' : playerMove === 'put' ? '▼ PUT / SELL' : '⏸ HOLD') : 'Waiting...'}
            </span>
            <span className="pill p-neu" style={{ fontSize: '8px' }}>
              Enemy: {enemyMove ? (enemyMove === 'call' ? '▲ CALL' : enemyMove === 'put' ? '▼ PUT' : '⏸ HOLD') : '???'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: rowLayout ? '4px 10px' : '8px 12px',
          gap: rowLayout ? '4px' : '6px', minHeight: 0,
        }}>
          {/* Timer */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-muted)', marginBottom: '2px' }}>
              <span>{battlePhase === 'rpg' ? 'Choose action' : 'Resolving market...'}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{timerVal > 0 ? `${timerVal}s` : ''}</span>
            </div>
            <div style={{ height: '5px', background: 'var(--border-dim)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${timerPct}%`,
                background: timerVal > 5 ? 'var(--color-mint)' : timerVal > 2 ? '#F59E0B' : 'var(--color-coral)',
                transition: 'width 0.1s linear, background 0.6s',
              }} />
            </div>
          </div>

          {/* Action grid (only in RPG phase) */}
          {battlePhase === 'rpg' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              flexShrink: 0,
            }}>
              {['attack', 'buff', 'defend', 'debuff'].map((a) => {
                const al = actionLabels[a];
                const isCall = a === 'attack' || a === 'buff';
                return (
                  <div
                    key={a}
                    onClick={() => setPlayerAction(a as 'attack' | 'buff' | 'defend' | 'debuff' | 'hold')}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      padding: rowLayout ? '5px 4px' : '8px 6px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.13s',
                      border: `1.5px solid var(--border-dim)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1px',
                      userSelect: 'none',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isCall ? '#93E5B1' : '#FF9B9B'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {a === 'attack' ? (
                        <><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14.5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.83 8 21v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14l-4 4M10 10l4-4"/></>
                      ) : a === 'buff' ? (
                        <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
                      ) : a === 'defend' ? (
                        <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>
                      ) : (
                        <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>
                      )}
                    </svg>
                    <div style={{ fontSize: rowLayout ? '10px' : 'clamp(11px,1.5vw,13px)', fontWeight: 700, color: 'var(--text-primary)' }}>{al.lbl}</div>
                    <div style={{ fontSize: rowLayout ? '7px' : '8px', color: 'var(--text-muted)' }}>{al.sub}</div>
                    <div style={{
                      fontSize: rowLayout ? '7px' : '8px', fontWeight: 600, marginTop: '1px',
                      color: isCall ? 'var(--color-mint)' : 'var(--color-coral)',
                    }}>{al.type}</div>
                  </div>
                );
              })}
              {/* HOLD — full width */}
              <div
                onClick={() => setPlayerAction('hold')}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '10px',
                  padding: '8px 6px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.13s',
                  border: '1.5px solid var(--border-dim)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  gridColumn: '1 / -1',
                  userSelect: 'none',
                }}
              >
                <svg width={rowLayout ? '14' : '18'} height={rowLayout ? '14' : '18'} viewBox="0 0 24 24" fill="none" stroke="#F3C37D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                <div style={{ fontSize: rowLayout ? '10px' : 'clamp(11px,1.5vw,13px)', fontWeight: 700, color: 'var(--text-primary)' }}>HOLD</div>
                <div style={{ fontSize: rowLayout ? '7px' : '8px', color: 'var(--text-muted)' }}>Skip — Hodler heals +8 HP</div>
                <div style={{ fontSize: rowLayout ? '7px' : '8px', fontWeight: 600, marginTop: '1px', color: 'var(--color-gold)' }}>⏸ HOLD</div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic',
            }}>
              {battlePhase === 'mkt' ? '⚡ Order locked! Watching the candle...' : '⚔️ Combat resolving...'}
            </div>
          )}

          {/* Equipped gear strip */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: rowLayout ? '5px' : '6px', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '2px' }}>EQUIPPED GEAR</div>
            <div className="wear-strip">
              {['outfit', 'weapon', 'accessory'].map(sl => {
                const item = passiveGear.find(i => i.slot === sl);
                return (
                  <div key={sl} className={`wslot ${item ? 'active' : 'empty'}`}>
                    <span className="ws-ico">{item ? item.icon : '—'}</span>
                    {item && (
                      <div className="ws-info">
                        <div className="ws-name">{item.name}</div>
                        <div className="ws-stat">{item.statText}</div>
                        <div className="ws-type">{sl}</div>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Active items */}
              {activeItems.length > 0 && (
                <>
                  <div style={{ width: '1px', height: '30px', background: 'var(--border-dim)', flexShrink: 0, alignSelf: 'center' }} />
                  {activeItems.map(it => (
                    <div
                      key={it.id}
                      className={`wslot active-item ${it.used ? 'used' : ''}`}
                      onClick={() => { if (!it.used && battlePhase === 'rpg') triggerActiveItem(it.id); }}
                    >
                      <ItemIcon itemId={it.id} size={16} />
                      <div className="ws-info">
                        <div className="ws-name">{it.name}</div>
                        <div className="ws-stat">{it.statText}</div>
                        <div className="ws-type">item</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Result panel */}
          {battlePhase === 'res' && damageReport && (
            <div style={{
              flexShrink: 0, background: 'var(--bg-card)',
              border: '1px solid var(--border-dim)', borderRadius: '10px',
              padding: '8px 10px', fontSize: '10px',
              animation: 'popIn 0.25s ease',
              maxHeight: '100px', overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trade:</span>
                <span style={{
                  fontWeight: 700,
                  color: playerMove === 'hold' ? 'var(--color-gold)' : damageReport.playerCorrect ? 'var(--color-mint)' : 'var(--color-coral)',
                }}>
                  {playerMove === 'hold' ? 'HOLD' : damageReport.playerCorrect ? '✓ CORRECT' : '✗ WRONG'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price moved:</span>
                <span style={{ fontFamily: 'var(--font-accent)', color: damageReport.playerCorrect && playerMove !== 'hold' ? 'var(--color-mint)' : 'var(--color-coral)' }}>
                  {damageReport.priceDriftPercent > 0 ? '+' : ''}{(damageReport.priceDriftPercent * 100).toFixed(3)}%
                </span>
              </div>
              {damageReport.isCrit && (
                <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', fontSize: '8px', fontFamily: 'var(--font-pixel)', letterSpacing: '1px', margin: '2px 0' }}>
                  ⚡ CRITICAL!
                </div>
              )}
              <div style={{
                borderTop: '1px solid var(--border-dim)', paddingTop: '4px', marginTop: '2px',
                display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700,
              }}>
                <span style={{ color: 'var(--color-mint)' }}>Dealt: -{damageReport.playerDamage} HP</span>
                <span style={{ color: 'var(--color-coral)' }}>Took: -{damageReport.enemyDamage} HP</span>
              </div>
            </div>
          )}

          {/* Battle log */}
          <div className="blog" style={{ flexShrink: 0 }}>
            <div className="blog-hdr">BATTLE LOG</div>
            {battleLog.slice(-3).map((log, i) => (
              <div key={i} style={{ fontSize: '8px', color: 'var(--text-muted)', lineHeight: '1.3', fontStyle: 'normal' }}>{log}</div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
      </div>

      {/* ═══ STATUSBAR ═══ */}
      <div style={{
        background: 'var(--bg-card)', borderTop: '2px solid var(--border-dim)',
        padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px',
        flexShrink: 0, flexWrap: 'wrap', fontSize: '10px',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>Round <b style={{ color: 'var(--text-primary)' }}>{round}</b></span>
        <span style={{ color: 'var(--text-muted)' }}>Accuracy <b style={{ color: 'var(--text-primary)' }}>{accuracyDisplay}</b></span>
        <span style={{ color: 'var(--text-muted)' }}>Dmg <b style={{ color: 'var(--text-primary)' }}>{damageDealtDisplay}</b></span>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => setShowExitConfirm(true)}
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border-dim)', borderRadius: '8px',
              padding: '4px 10px', fontSize: '10px', cursor: 'pointer',
              fontFamily: 'var(--font-accent)',
            }}
          >
            ↩ Exit
          </button>
        </div>
      </div>

      <ExitConfirmDialog
        visible={showExitConfirm}
        onStay={() => setShowExitConfirm(false)}
        onExit={() => {
          setShowExitConfirm(false);
          setLoading(true, 'Exiting battle...');
          setTimeout(() => window.location.reload(), 400);
        }}
      />
    </div>
  );
};
