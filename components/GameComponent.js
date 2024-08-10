import { useEffect, useState, useRef } from 'react';
import styles from './Game.module.css';
import IvorySquare from './IvorySquare';
import BlackCircle from './BlackCircle';

function GameComponent({ onGameOver, onGameWin }) {
  const [playerPosition, setPlayerPosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const [holes, setHoles] = useState(generateHoles());
  const lastResetTimeRef = useRef(Date.now());
  const [ivorySquarePosition, setIvorySquarePosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [keysPressed, setKeysPressed] = useState({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setKeysPressed((prevKeys) => ({ ...prevKeys, [key]: true }));
    };

    const handleKeyUp = (event) => {
      const { key } = event;
      setKeysPressed((prevKeys) => ({ ...prevKeys, [key]: false }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVelocity((prevVelocity) => {
        let newVelocity = { x: 0, y: 0 };
        if (keysPressed['ArrowUp']) newVelocity.y -= 0.5;
        if (keysPressed['ArrowDown']) newVelocity.y += 0.5;
        if (keysPressed['ArrowLeft']) newVelocity.x -= 0.5;
        if (keysPressed['ArrowRight']) newVelocity.x += 0.5;
        return newVelocity;
      });

      setIvorySquarePosition((prevPosition) => ({
        x: prevPosition.x + velocity.x,
        y: prevPosition.y + velocity.y,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [keysPressed, velocity]);

  useEffect(() => {
    const handleResize = () => {
      setPlayerPosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
      setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const checkGameOver = () => {
      for (let hole of holes) {
        if (
          ivorySquarePosition.x >= hole.x &&
          ivorySquarePosition.x <= hole.x + 50 &&
          ivorySquarePosition.y >= hole.y &&
          ivorySquarePosition.y <= hole.y + 50
        ) {
          onGameOver();
          return;
        }
      }
    };

    const interval = setInterval(checkGameOver, 100);
    return () => clearInterval(interval);
  }, [ivorySquarePosition, holes, onGameOver]);

  useEffect(() => {
    const checkGameWin = () => {
      if (ivorySquarePosition.y <= 0) {
        onGameWin();
      }
    };

    const interval = setInterval(checkGameWin, 100);
    return () => clearInterval(interval);
  }, [ivorySquarePosition, onGameWin]);

  useEffect(() => {
    const handleGameReset = () => {
      const currentTime = Date.now();
      if (currentTime - lastResetTimeRef.current < 60000) {
        onGameOver();
      } else {
        setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
        lastResetTimeRef.current = currentTime;
      }
    };

    const interval = setInterval(() => {
      for (let hole of holes) {
        if (
          ivorySquarePosition.x >= hole.x &&
          ivorySquarePosition.x <= hole.x + 50 &&
          ivorySquarePosition.y >= hole.y &&
          ivorySquarePosition.y <= hole.y + 50
        ) {
          handleGameReset();
          return;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [ivorySquarePosition, holes, lastResetTimeRef, onGameOver]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleGameStart = () => {
        setIvorySquarePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        lastResetTimeRef.current = Date.now();
      };

      handleGameStart();
    }
  }, []);

  return (
    <div className={styles.desertBackground}>
      <IvorySquare />
      <BlackCircle />
      {holes.map((hole, index) => (
        <div
          key={index}
          className={styles.blackHole}
          style={{ left: hole.x, top: hole.y }}
        ></div>
      ))}
    </div>
  );
}

function generateHoles() {
  const holes = [];
  if (typeof window !== 'undefined') {
    for (let i = 0; i < 10; i++) {
      holes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });
    }
  }
  return holes;
}

export default GameComponent;
