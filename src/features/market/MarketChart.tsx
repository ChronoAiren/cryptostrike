import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameStateContext';

export const MarketChart: React.FC = () => {
  const { priceHistory, entryPrice, currentPrice, selectedCoin, battlePhase, playerMove } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 320;
    const height = 82;
    canvas.width = width;
    canvas.height = height;

    const ps = priceHistory;
    if (ps.length < 2) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const mn = Math.min(...ps) * 0.997;
    const mx = Math.max(...ps) * 1.003;
    const rng = mx - mn || 1;
    const sy = (v: number) => height - ((v - mn) / rng) * height * 0.86 - height * 0.07;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 53, 79, 0.35)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (height / 4) * i);
      ctx.lineTo(width, (height / 4) * i);
      ctx.stroke();
    }

    // Bet zone — draw BEFORE entry line so it sits behind
    const isTrading = battlePhase === 'mkt' || battlePhase === 'res';
    const activeEntry = isTrading ? entryPrice : ps[0];
    const ey = sy(activeEntry);

    if (playerMove && playerMove !== 'hold' && isTrading) {
      const betUp = playerMove === 'call';
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = betUp ? '#93E5B1' : '#FF9B9B';
      if (betUp) { ctx.fillRect(0, 0, width, ey); } else { ctx.fillRect(0, ey, width, height - ey); }
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = betUp ? '#93E5B1' : '#FF9B9B';
      ctx.font = 'bold 9px Rajdhani, sans-serif';
      ctx.fillText(betUp ? '▲ CALL' : '▼ PUT', 5, betUp ? ey - 8 : ey + 14);
      ctx.restore();
    }

    // Entry line
    ctx.save();
    ctx.strokeStyle = 'rgba(243, 195, 125, 0.72)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, ey);
    ctx.lineTo(width, ey);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(243, 195, 125, 0.88)';
    ctx.font = 'bold 8px Outfit, sans-serif';
    ctx.fillText('ENTRY', 4, ey - 3);
    ctx.restore();

    // Price line
    const up = currentPrice >= activeEntry;
    ctx.beginPath();
    ctx.strokeStyle = up ? '#93E5B1' : '#FF9B9B';
    ctx.lineWidth = 2;
    ps.forEach((p, i) => {
      const x = i / (ps.length - 1) * width;
      const y = sy(p);
      if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
    });
    ctx.stroke();

    // Fill
    ctx.beginPath();
    ps.forEach((p, i) => {
      const x = i / (ps.length - 1) * width;
      const y = sy(p);
      if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = up ? 'rgba(147, 229, 177, 0.06)' : 'rgba(255, 155, 155, 0.06)';
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(width - 1, sy(currentPrice), 4, 0, Math.PI * 2);
    ctx.fillStyle = up ? '#93E5B1' : '#FF9B9B';
    ctx.fill();
  }, [priceHistory, entryPrice, currentPrice, battlePhase, selectedCoin, playerMove]);

  return (
    <div style={{ width: '100%', height: '82px', margin: '4px 0', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '5px' }} />
    </div>
  );
};

export const formatPrice = (val: number): string => {
  if (val >= 1000) return '$' + (+val.toFixed(2)).toLocaleString();
  if (val >= 1) return '$' + val.toFixed(4);
  return '$' + val.toFixed(6);
};
