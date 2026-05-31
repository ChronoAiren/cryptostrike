import React from 'react';

interface ItemIconProps {
  itemId: string;
  size?: number;
}

// Universal mobile-friendly item emojis
const ITEM_EMOJIS: Record<string, string> = {
  sblade: '⚔️',
  barmor: '🛡️',
  nboots: '👢',
  lshield: '📖',
  bflag: '🚩',
  wsurge: '🐋',
  fud: '💣',
  hstone: '💎',
  airdrop: '🪂',
};

export const ItemIcon: React.FC<ItemIconProps> = ({ itemId, size = 28 }) => {
  const emoji = ITEM_EMOJIS[itemId] || '❓';

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.7,
        lineHeight: 1,
      }}
    >
      {emoji}
    </div>
  );
};
