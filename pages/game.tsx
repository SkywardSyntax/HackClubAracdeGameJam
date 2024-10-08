import { useState } from 'react';
import styles from '../components/Game.module.css';
import GameComponent from '../components/GameEngine';
import Minimap from '../components/Minimap';

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
      <Minimap playerPosition={{ x: 0, y: 0 }} circles={[]} ivorySquare={{ x: 0, y: 0 }} />
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
