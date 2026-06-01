import React, { useMemo } from 'react';
import { useGame, ITEMS } from '../../context/GameStateContext';
import { FighterSprite } from '../sprites/FighterSprite';
import { ItemIcon } from '../sprites/ItemIcon';
import { OVERLAY_SPRITES } from '../../data/wearables';

export const ItemEquipScreen: React.FC = () => {
  const { selectedClass, equippedItems, toggleEquipItem, goCoinsScreen, goToClassSelect, user } = useGame();

  const isEquipped = (id: string) => equippedItems.includes(id);
  const overlaySources = useMemo(
    () => user.cosmeticItems.filter(id => OVERLAY_SPRITES[id]).map(id => OVERLAY_SPRITES[id]),
    [user.cosmeticItems]
  );
  const spriteKey = selectedClass || 'char_one';

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)', display: 'flex', flexDirection: 'column', padding: '20px 16px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)', top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)', bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: '12px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', letterSpacing: '2px', background: 'linear-gradient(135deg, #F3C37D, #93E5B1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
            Equip Items
          </h2>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            Gear up before battle — stats apply even without visible sprites.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '8px', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px', background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: '6px', color: 'var(--color-gold)' }}>
            PREVIEW
          </span>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {selectedClass && (
              <div style={{ transform: 'scale(1.15)', margin: '6px 0' }}>
                <FighterSprite characterKey={spriteKey} overlaySources={overlaySources} pose="idle" playing loop size={110} />
              </div>
            )}
            {equippedItems.length > 0 && (
              <div style={{ position: 'absolute', left: '-44px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {equippedItems.map(id => {
                  const item = ITEMS.find(it => it.id === id);
                  return (
                    <div key={id} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px' }}>
                      {item ? <ItemIcon itemId={id} size={22} /> : <span style={{ fontSize: '14px' }}>?</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
            {equippedItems.length === 0
              ? 'Tap items below to equip'
              : `Equipped: ${equippedItems.map(id => ITEMS.find(it => it.id === id)?.name).join(', ')}`}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingBottom: '10px' }}>
          {ITEMS.map((it) => {
            const equipped = isEquipped(it.id);
            const limitReached = equippedItems.length >= 3;
            return (
              <div
                key={it.id}
                onClick={() => toggleEquipItem(it.id)}
                style={{
                  background: equipped ? 'rgba(243,195,125,0.06)' : 'rgba(255,255,255,0.02)',
                  border: equipped ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '10px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  opacity: !equipped && limitReached ? 0.4 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {equipped && <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '10px', color: 'var(--color-gold)', fontWeight: 'bold' }}>✓</div>}
                <div style={{ marginBottom: '4px' }}>
                  <ItemIcon itemId={it.id} size={32} />
                </div>
                <h4 style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.2, fontFamily: 'var(--font-accent)', letterSpacing: '0.3px' }}>{it.name}</h4>
                <div style={{ fontSize: '9px', color: 'var(--color-mint)', marginTop: '4px', fontWeight: 600 }}>{it.statText}</div>
                <div style={{ fontSize: '7px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{it.slot}</div>
              </div>
            );
          })}
        </div>

        <div style={{ flexShrink: 0, paddingTop: '10px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px', fontFamily: 'var(--font-main)' }}>
            Equipped: <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{equippedItems.length}</span>/3
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={goToClassSelect}
              style={{
                flex: 1, padding: '12px',
                background: 'transparent', color: 'var(--text-secondary)',
                border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-accent)', letterSpacing: '1.5px',
              }}
            >
              ← BACK
            </button>
            <button
              onClick={goCoinsScreen}
              style={{
                flex: 1, padding: '12px',
                background: 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)',
                color: '#0a0a1a', border: 'none', borderRadius: '12px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-accent)', letterSpacing: '1.5px',
              }}
            >
              NEXT →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
