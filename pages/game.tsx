import { useState } from 'react';
import styles from '../components/Game.module.css';
import GameComponent from '../components/GameEngine';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const startGame = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setGameWon(false);
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  const handleGameWin = () => {
    setGameWon(true);
    setGameStarted(false);
  };

  return (
    <div className={styles.desertBackground}>
      {!gameStarted && !gameOver && !gameWon && (
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
      )}
      {gameStarted && <GameComponent gameStarted={gameStarted} onGameOver={handleGameOver} onGameWin={handleGameWin} />}
      {gameOver && (
        <div className={styles.gameOverMessage}>
          Game Over
        </div>
      )}
      {gameWon && (
        <div className={styles.winMessage}>
          You Win!
        </div>
      )}
    </div>
  );
}

export default Game;
