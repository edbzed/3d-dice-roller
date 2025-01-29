import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSound } from './hooks/useSound';

function Die({ value, isRolling, animationClass }: { value: number; isRolling: boolean; animationClass: string }) {
  const getRandomRotation = () => {
    const rotations = [
      [0, 0, 0],        // 1 on front
      [0, 90, 0],       // 2 on right
      [-90, 0, 0],      // 3 on top
      [90, 0, 0],       // 4 on bottom
      [0, -90, 0],      // 5 on left
      [180, 0, 0],      // 6 on back
    ];
    return rotations[value - 1];
  };

  const [x, y, z] = getRandomRotation();
  const rollStyle = isRolling ? {
    animation: 'tumble 2s ease-out forwards',
    transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
  } : {
    transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
  };

  return (
    <div 
      className={`die-container ${isRolling ? animationClass : ''}`}
      role="img"
      aria-label={`Die showing ${value}`}
    >
      <div className="shadow"></div>
      <div className="die" style={rollStyle}>
        <div className="face front">
          <span className="dot"></span>
        </div>
        <div className="face right">
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="face top">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="face bottom">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="face left">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="face back">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [wallImpact, setWallImpact] = useState(false);
  const { playRollSound, playImpactSound } = useSound();
  
  // Track combinations using a ref to avoid re-renders
  const combinationsRef = useRef<Set<string>>(new Set());
  const lastRollRef = useRef<string>('');

  const generateRandomNumber = () => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return (buffer[0] & 0x7FFFFFFF) % 6 + 1;
  };

  const generateUniqueCombination = () => {
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      const d1 = generateRandomNumber();
      const d2 = generateRandomNumber();
      const combination = `${d1},${d2}`;
      
      // If we've seen all combinations, reset the tracking
      if (combinationsRef.current.size === 36) {
        combinationsRef.current.clear();
      }
      
      // Don't repeat the last roll and prefer unseen combinations
      if (combination !== lastRollRef.current && !combinationsRef.current.has(combination)) {
        combinationsRef.current.add(combination);
        lastRollRef.current = combination;
        return [d1, d2];
      }
      
      attempts++;
    }
    
    // If we couldn't find a unique combination, just generate random numbers
    return [generateRandomNumber(), generateRandomNumber()];
  };

  const rollDice = useCallback(() => {
    if (isRolling) return;
    
    setIsRolling(true);
    playRollSound();
    
    // Animate intermediate values
    const rollInterval = setInterval(() => {
      setDice1(generateRandomNumber());
      setDice2(generateRandomNumber());
    }, 100);
    
    setTimeout(() => {
      setWallImpact(true);
      playImpactSound();
      clearInterval(rollInterval);
      
      // Generate final values ensuring good distribution
      const [finalDice1, finalDice2] = generateUniqueCombination();
      setDice1(finalDice1);
      setDice2(finalDice2);
      
      setTimeout(() => setWallImpact(false), 150);
    }, 1000);
    
    setTimeout(() => {
      setIsRolling(false);
    }, 2000);
  }, [isRolling, playRollSound, playImpactSound]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isRolling) {
        event.preventDefault();
        rollDice();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [rollDice, isRolling]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full relative">
        {/* Game Scene */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600">
          <div className="w-full h-full flex items-center justify-center perspective-1000">
            <div className="scene">
              <div className={`wall back-wall ${wallImpact ? 'impact' : ''}`}>
                <div className="wall-texture"></div>
              </div>
              
              <div className="wall left-wall">
                <div className="wall-texture"></div>
              </div>
              
              <div className="wall right-wall">
                <div className="wall-texture"></div>
              </div>
              
              <div className="floor">
                <div className="floor-texture"></div>
                <div className="ground-shadow"></div>
              </div>

              <div className="game-content flex items-center justify-center min-h-screen">
                <div className="flex justify-center gap-48">
                  <Die value={dice1} isRolling={isRolling} animationClass="rolling-1" />
                  <Die value={dice2} isRolling={isRolling} animationClass="rolling-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UI Overlay */}
        <div className="fixed inset-0 z-50">
          {/* Controls */}
          <div className="absolute bottom-24 right-8">
            <button
              onClick={rollDice}
              disabled={isRolling}
              className={`
                py-4 px-8 rounded-lg text-white font-semibold text-lg
                transition-all duration-200 shadow-lg
                ${isRolling 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 active:transform active:scale-95'
                }
              `}
              aria-label="Roll dice"
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          </div>

          {/* Footer */}
          <div className="fixed bottom-8 left-0 right-0 text-center text-sm text-white p-4">
            Copyright © 2025 Ed Bates (TECHBLIP LLC)<br />
            This software is released under the Apache-2.0 License. See the LICENSE file for details
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;