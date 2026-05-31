import React from 'react';
import type { WearableItem } from '../../data/wearables';

interface PurchaseModalProps {
  item: WearableItem;
  gold: number;
  gems: number;
  onBuy: (currency: 'gold' | 'gems') => void;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ item, gold, gems, onBuy, onClose }) => {
  const canGold = gold >= item.price && item.price > 0;
  const canGems = gems >= item.gemCost && item.gemCost > 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 100%)',
        border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '20px',
        padding: '24px', maxWidth: '300px', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '40px' }}>{item.emoji}</div>
        <div style={{ fontSize: '14px', fontFamily: 'var(--font-accent)', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-primary)' }}>
          {item.name}
        </div>
        <div style={{ fontSize: '8px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-main)' }}>
          {item.description}
        </div>
        <div style={{ fontSize: '8px', color: 'var(--color-mint)', fontWeight: 600, fontFamily: 'var(--font-accent)' }}>
          {item.statBonus}
        </div>

        <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px' }}>
          PURCHASE WITH
        </div>

        {/* Gold buy */}
        <button
          onClick={() => onBuy('gold')}
          disabled={!canGold}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px', cursor: canGold ? 'pointer' : 'not-allowed',
            background: canGold ? 'rgba(243,195,125,0.1)' : 'rgba(255,255,255,0.02)',
            border: canGold ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.05)',
            color: canGold ? 'var(--color-gold)' : 'var(--text-muted)',
            fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: canGold ? 1 : 0.5, transition: 'all 0.15s',
          }}
        >
          💰 {item.price} GOLD {!canGold && `(need ${item.price - gold})`}
        </button>

        {/* Gem buy */}
        {item.gemCost > 0 && (
          <button
            onClick={() => onBuy('gems')}
            disabled={!canGems}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', cursor: canGems ? 'pointer' : 'not-allowed',
              background: canGems ? 'rgba(147,130,255,0.1)' : 'rgba(255,255,255,0.02)',
              border: canGems ? '1.5px solid var(--color-purple)' : '1.5px solid rgba(255,255,255,0.05)',
              color: canGems ? 'var(--color-purple)' : 'var(--text-muted)',
              fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: canGems ? 1 : 0.5, transition: 'all 0.15s',
            }}
          >
            💎 {item.gemCost} GEMS {!canGems && `(need ${item.gemCost - gems})`}
          </button>
        )}

        <button onClick={onClose} style={{
          width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
          background: 'transparent', border: '1.5px solid rgba(255,255,255,0.06)',
          color: 'var(--text-secondary)', fontFamily: 'var(--font-accent)', fontSize: '11px',
          fontWeight: 600, letterSpacing: '1px',
        }}>
          CANCEL
        </button>
      </div>
    </div>
  );
};
