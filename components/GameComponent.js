import { useEffect, useState } from 'react';
import styles from './Game.module.css';

function GameComponent() {
  const [playerPosition, setPlayerPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [holes, setHoles] = useState(generateHoles());
  const [lastResetTime, setLastResetTime] = useState(Date.now());

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setPlayerPosition((prevPosition) => {
        let newPosition = { ...prevPosition };
        if (key === 'ArrowUp') newPosition.y -= 10;
        if (key === 'ArrowDown') newPosition.y += 10;
        if (key === 'ArrowLeft') newPosition.x -= 10;
        if (key === 'ArrowRight') newPosition.x += 10;
        return newPosition;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkCollision = () => {
      for (let hole of holes) {
        const distance = Math.sqrt((playerPosition.x - hole.x) ** 2 + (playerPosition.y - hole.y) ** 2);
        if (distance < 25) {
          const currentTime = Date.now();
          if (currentTime - lastResetTime < 60000) {
            alert('Game Over');
            setPlayerPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          } else {
            setLastResetTime(currentTime);
            setPlayerPosition((prevPosition) => ({
              x: prevPosition.x - 100,
              y: prevPosition.y - 100,
            }));
          }
          break;
        }
      }
    };

    checkCollision();
  }, [playerPosition, holes, lastResetTime]);

  return (
    <div className={styles.desertBackground}>
      <div
        className={styles.ivorySquare}
        style={{ left: playerPosition.x, top: playerPosition.y }}
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
