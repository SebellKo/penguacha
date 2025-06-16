import React, { useEffect, useRef, useState } from 'react';
import Assets from '../assets.json';

interface BackgroundMusicProps {
  isEnabled: boolean;
  volume?: number;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ 
  isEnabled, 
  volume = 0.3 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isEnabled) {
      audio.play().catch(error => {
        console.log('Audio autoplay prevented:', error);
      });
    } else {
      audio.pause();
    }
  }, [isEnabled, isLoaded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      src={Assets.audio.backgroundMusic.url}
      loop
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};

export default BackgroundMusic;
