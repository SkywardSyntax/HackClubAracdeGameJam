import { useEffect, useState } from 'react';
import styles from '../components/Game.module.css';
import GameComponent from '../components/GameComponent';

function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
  };

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
