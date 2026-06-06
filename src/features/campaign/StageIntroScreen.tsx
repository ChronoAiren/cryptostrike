import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameStateContext';
import { CLASSES, COINS } from '../../context/GameStateContext';

export const StageIntroScreen: React.FC = () => {
  const { campaign, advanceDialogue, startCampaignBattle, returnToCampaignMap, user, campaignProgress } = useGame();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const { selectedChapter, selectedStage, dialogueIndex } = campaign;

  const currentLine = selectedStage ? selectedStage.dialogue[dialogueIndex] : null;
  const isLastLine = selectedStage ? dialogueIndex >= selectedStage.dialogue.length - 1 : true;
  const enemyClass = selectedStage ? CLASSES[selectedStage.enemy.classKey] : null;
  const stageCoin = selectedStage ? COINS.find(c => c.id === selectedStage.coinId) : null;

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    const text = currentLine.text;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [dialogueIndex, currentLine]);

  if (!selectedChapter || !selectedStage || !currentLine) return null;

  const handleClick = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      advanceDialogue();
    }
  };

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case 'player': return '#22C55E';
      case 'enemy': return '#EF4444';
      case 'narrator': return '#94A3B8';
      default: return '#F1F5F9';
    }
  };

  const getSpeakerName = (speaker: string) => {
    switch (speaker) {
      case 'player': return 'You';
      case 'enemy': return selectedStage.enemy.name;
      case 'narrator': return 'Narrator';
      default: return 'Unknown';
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1a2d 50%, #0a0a1a 100%)',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleClick}
    >
      {/* Chapter header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: '10px',
          color: selectedChapter.theme,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '4px',
        }}>
          {selectedChapter.subtitle}
        </div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          color: '#F1F5F9',
        }}>
          {selectedStage.name}
        </div>
      </div>

      {/* Stage info */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          padding: '8px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>{enemyClass?.emoji || '?'}</div>
          <div style={{ fontSize: '11px', color: enemyClass?.color || '#F1F5F9' }}>
            {selectedStage.enemy.name}
          </div>
        </div>
        {stageCoin && (
          <div style={{
            padding: '8px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '2px' }}>{stageCoin.icon}</div>
            <div style={{ fontSize: '11px', color: '#F1F5F9' }}>
              {stageCoin.symbol}
            </div>
          </div>
        )}
        <div style={{
          padding: '8px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>⚔️</div>
          <div style={{ fontSize: '11px', color: '#F0B429' }}>
            HP: {Math.floor(selectedStage.enemy.baseHp * selectedStage.enemy.difficultyMultiplier)}
          </div>
        </div>
      </div>

      {/* Dialogue area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Character portraits */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          maxWidth: '300px',
          marginBottom: '20px',
        }}>
          {/* Player */}
          <div style={{
            opacity: currentLine.speaker === 'player' ? 1 : 0.4,
            transform: currentLine.speaker === 'player' ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '40px',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              border: '2px solid rgba(34, 197, 94, 0.3)',
            }}>
              {CLASSES['my_character'].emoji}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#22C55E',
              marginTop: '4px',
            }}>
              {user.username || 'My Character'} · Lv.{campaignProgress.level}
            </div>
          </div>

          {/* Enemy */}
          <div style={{
            opacity: currentLine.speaker === 'enemy' ? 1 : 0.4,
            transform: currentLine.speaker === 'enemy' ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '40px',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}>
              {enemyClass?.emoji || '?'}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#EF4444',
              marginTop: '4px',
            }}>
              {selectedStage.enemy.name}
            </div>
          </div>
        </div>

        {/* Dialogue box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: `2px solid ${getSpeakerColor(currentLine.speaker)}44`,
          borderRadius: '16px',
          padding: '16px 20px',
          width: '100%',
          maxWidth: '320px',
          minHeight: '100px',
          position: 'relative',
        }}>
          {/* Speaker name */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '16px',
            background: '#0a0a1a',
            padding: '2px 10px',
            borderRadius: '8px',
            border: `1px solid ${getSpeakerColor(currentLine.speaker)}44`,
          }}>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: getSpeakerColor(currentLine.speaker),
            }}>
              {getSpeakerName(currentLine.speaker)}
            </span>
          </div>

          {/* Text */}
          <div style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '16px',
            color: '#F1F5F9',
            lineHeight: 1.6,
            marginTop: '8px',
            minHeight: '50px',
          }}>
            {displayedText}
            {isTyping && (
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '16px',
                background: getSpeakerColor(currentLine.speaker),
                marginLeft: '2px',
                animation: 'blink 1s infinite',
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom area */}
      <div style={{
        marginTop: '20px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '16px',
        }}>
          {selectedStage.dialogue.map((_: unknown, idx: number) => (
            <div
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: idx === dialogueIndex
                  ? selectedChapter.theme
                  : idx < dialogueIndex
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); returnToCampaignMap(); }}
            style={{
              flex: 1,
              padding: '14px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#94A3B8',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ← Back
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isTyping) {
                if (isLastLine) {
                  startCampaignBattle();
                } else {
                  advanceDialogue();
                }
              } else {
                setDisplayedText(currentLine.text);
                setIsTyping(false);
              }
            }}
            style={{
              flex: 2,
              padding: '14px',
              background: isLastLine
                ? 'linear-gradient(135deg, #F0B429 0%, #E8A020 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              border: isLastLine
                ? '2px solid #F0B429'
                : '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: isLastLine ? '#0a0a1a' : '#F1F5F9',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
            }}
          >
            {isLastLine ? '⚔️ Start Battle' : 'Next →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
