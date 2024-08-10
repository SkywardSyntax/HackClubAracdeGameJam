import { useEffect, useState } from 'react';
import styles from '../components/Game.module.css';
import GameComponent from '../components/GameComponent';

function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [ivorySquarePosition, setIvorySquarePosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setIvorySquarePosition((prevPosition) => {
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

  return (
    <div className={styles.desertBackground}>
      {!gameStarted && !gameOver && (
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
      )}
      {gameStarted && <GameComponent onGameOver={handleGameOver} />}
      {gameOver && (
        <div className={styles.gameOverMessage}>
          Game Over
        </div>
      )}
    </div>
  );
}

export default Game;
