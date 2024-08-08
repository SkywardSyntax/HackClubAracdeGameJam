import { useState, useEffect } from 'react';
import styles from './Game.module.css';

export default function Game() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loopholes, setLoopholes] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      alert(`Game over! Your score is ${score}`);
    }
  }, [timeLeft, score]);

  const createLoophole = () => {
    const newLoophole = {
      id: Date.now(),
      x: Math.random() * 90,
      y: Math.random() * 90,
    };
    setLoopholes((prevLoopholes) => [...prevLoopholes, newLoophole]);
  };

  const handleLoopholeClick = (id) => {
    setScore((prevScore) => prevScore + 1);
    setLoopholes((prevLoopholes) => prevLoopholes.filter((loophole) => loophole.id !== id));
  };

  return (
    <div className={styles.game}>
      <h1 className={styles.gameTitle}>Loopholes Game</h1>
      <p>Score: {score}</p>
      <p>Time Left: {timeLeft}s</p>
      <button onClick={createLoophole}>Create Loophole</button>
      <div className={styles.loopholesContainer}>
        {loopholes.map((loophole) => (
          <div
            key={loophole.id}
            className={styles.loophole}
            style={{ top: `${loophole.y}%`, left: `${loophole.x}%` }}
            onClick={() => handleLoopholeClick(loophole.id)}
          />
        ))}
      </div>
    </div>
  );
}
