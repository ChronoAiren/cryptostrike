import React from 'react';
import { AudioProvider } from './context/AudioContext';
import { GameStateProvider, useGame } from './context/GameStateContext';
import { PhoneWrapper } from './components/layout/PhoneWrapper';
import { OnboardingTooltip } from './components/feedback/OnboardingTooltip';
import { LoadingOverlay } from './components/feedback/LoadingOverlay';
import { SplashScreen } from './features/splash/SplashScreen';
import { WelcomeScreen } from './features/onboarding/WelcomeScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { MyCharacterScreen } from './features/character/MyCharacterScreen';
import { ClassSelectScreen } from './features/classSelection/ClassSelectScreen';
import { ItemEquipScreen } from './features/inventory/ItemEquipScreen';
import { ItemsScreen } from './features/inventory/ItemsScreen';
import { CoinChooseScreen } from './features/coinSelection/CoinChooseScreen';
import { BattleScreen } from './features/battle/BattleScreen';
import { VSScreen } from './features/battle/VSScreen';
import { EndScreen } from './features/gameSummary/EndScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { VfxTestScreen } from './features/sprites/VfxTestScreen';

const MainApp: React.FC = () => {
  const { currentScreen } = useGame();

  const renderActiveScreen = () => {
    if (window.location.hash === '#vfx') {
      return <VfxTestScreen />;
    }
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'home':
        return <HomeScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'myCharacter':
        return <MyCharacterScreen />;
      case 'items':
        return <ItemsScreen />;
      case 'classSelect':
        return <ClassSelectScreen />;
      case 'itemEquip':
        return <ItemEquipScreen />;
      case 'coinChoose':
        return <CoinChooseScreen />;
      case 'vs':
        return <VSScreen />;
      case 'battle':
        return <BattleScreen />;
      case 'end':
        return <EndScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <PhoneWrapper wide={currentScreen === 'battle'}>
      {renderActiveScreen()}
      <OnboardingTooltip />
      <LoadingOverlay />
    </PhoneWrapper>
  );
};

const App: React.FC = () => {
  return (
    <AudioProvider>
      <GameStateProvider>
        <MainApp />
      </GameStateProvider>
    </AudioProvider>
  );
};

export default App;
