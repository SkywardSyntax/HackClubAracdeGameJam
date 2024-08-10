import { useEffect, useState } from 'react';
import styles from './Game.module.css';

function GameComponent() {
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
