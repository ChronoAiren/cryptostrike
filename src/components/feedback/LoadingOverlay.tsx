import React from 'react';
import { useGame } from '../../context/GameStateContext';

export const LoadingOverlay: React.FC = () => {
  const { loadingState } = useGame();

  if (!loadingState.visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5, 5, 15, 0.85)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
      gap: '16px',
    }}>
      {/* Spinner */}
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(243, 195, 125, 0.15)',
        borderTopColor: '#F3C37D',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      <div style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-main)',
        fontWeight: 500,
        letterSpacing: '0.3px',
      }}>
        {loadingState.message}
      </div>
    </div>
  );
};
