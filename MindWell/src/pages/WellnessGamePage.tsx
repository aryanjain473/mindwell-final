import React from 'react';
import { useParams } from 'react-router-dom';
import HeartCalmGame from '../components/wellness-games/HeartCalmGame';
import GratitudeWheelGame from '../components/wellness-games/GratitudeWheelGame';
import LotusBloomGame from '../components/wellness-games/LotusBloomGame';
import CandleFocusGame from '../components/wellness-games/CandleFocusGame';
import ThoughtCloudGame from '../components/wellness-games/ThoughtCloudGame';
import DreamWavesGame from '../components/wellness-games/DreamWavesGame';
import AnulomVilomGame from '../components/wellness-games/AnulomVilomGame';
import MusicListeningGame from '../components/wellness-games/MusicListeningGame';

const WellnessGamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();

  const renderGame = () => {
    switch (gameId) {
      case 'music-listening':
        return <MusicListeningGame />;
      case 'heart-calm':
        return <HeartCalmGame />;
      case 'gratitude-wheel':
        return <GratitudeWheelGame />;
      case 'lotus-bloom':
        return <LotusBloomGame />;
      case 'candle-focus':
        return <CandleFocusGame />;
      case 'thought-cloud':
        return <ThoughtCloudGame />;
      case 'dream-waves':
        return <DreamWavesGame />;
      case 'anulom-vilom':
        return <AnulomVilomGame />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game not found</h1>
              <p className="text-gray-600 dark:text-gray-400">The requested game does not exist.</p>
            </div>
          </div>
        );
    }
  };

  return <>{renderGame()}</>;
};

export default WellnessGamePage;

