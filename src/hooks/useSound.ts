export const useSound = () => {
  const playRollSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if audio can't play
    });
  };

  const playImpactSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2062/2062-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {
      // Silently fail if audio can't play
    });
  };

  return { playRollSound, playImpactSound };
};