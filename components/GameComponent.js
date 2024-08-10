import { useEffect, useState } from 'react';
import styles from './Game.module.css';

function GameComponent({ onGameOver, onGameWin }) {
  const [playerPosition, setPlayerPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [holes, setHoles] = useState(generateHoles());
  const [lastResetTime, setLastResetTime] = useState(Date.now());
  const [ivorySquarePosition, setIvorySquarePosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setVelocity((prevVelocity) => {
        let newVelocity = { ...prevVelocity };
        if (key === 'ArrowUp') newVelocity.y -= 1;
        if (key === 'ArrowDown') newVelocity.y += 1;
        if (key === 'ArrowLeft') newVelocity.x -= 1;
        if (key === 'ArrowRight') newVelocity.x += 1;
        return newVelocity;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIvorySquarePosition((prevPosition) => ({
        x: prevPosition.x + velocity.x,
        y: prevPosition.y + velocity.y,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [velocity]);

  useEffect(() => {
    const handleResize = () => {
      setPlayerPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setIvorySquarePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      if (currentTime - lastResetTime < 60000) {
        onGameOver();
      } else {
        setIvorySquarePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setLastResetTime(currentTime);
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
  }, [ivorySquarePosition, holes, lastResetTime, onGameOver]);

  useEffect(() => {
    const handleGameStart = () => {
      setIvorySquarePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setLastResetTime(Date.now());
    };

    handleGameStart();
  }, []);

  return (
    <div className={styles.desertBackground}>
      <div
        className={styles.ivorySquare}
        style={{ left: ivorySquarePosition.x, top: ivorySquarePosition.y }}
      ></div>
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
  for (let i = 0; i < 10; i++) {
    holes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    });
  }
  return holes;
}

export default GameComponent;
