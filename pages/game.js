import { useEffect, useState, useRef } from 'react';
import styles from '../components/Game.module.css';
import GameComponent from '../components/GameComponent';

function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [ivorySquarePosition, setIvorySquarePosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const lastResetTimeRef = useRef(Date.now());

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  const handleGameWin = () => {
    setGameWon(true);
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

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const checkGameWin = () => {
      if (ivorySquarePosition.y <= 0) {
        handleGameWin();
      }
    };

    const interval = setInterval(checkGameWin, 100);
    return () => clearInterval(interval);
  }, [ivorySquarePosition]);

  useEffect(() => {
    const checkGameOver = () => {
      // Assuming holes are available in the GameComponent
      const holes = document.querySelectorAll(`.${styles.blackHole}`);
      for (let hole of holes) {
        const holeRect = hole.getBoundingClientRect();
        if (
          ivorySquarePosition.x >= holeRect.left &&
          ivorySquarePosition.x <= holeRect.right &&
          ivorySquarePosition.y >= holeRect.top &&
          ivorySquarePosition.y <= holeRect.bottom
        ) {
          handleGameOver();
          return;
        }
      }
    };

    const interval = setInterval(checkGameOver, 100);
    return () => clearInterval(interval);
  }, [ivorySquarePosition]);

  useEffect(() => {
    const handleGameReset = () => {
      const currentTime = Date.now();
      if (currentTime - lastResetTimeRef.current < 60000) {
        handleGameOver();
      } else {
        setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
        lastResetTimeRef.current = currentTime;
      }
    };

    const interval = setInterval(() => {
      // Assuming holes are available in the GameComponent
      const holes = document.querySelectorAll(`.${styles.blackHole}`);
      for (let hole of holes) {
        const holeRect = hole.getBoundingClientRect();
        if (
          ivorySquarePosition.x >= holeRect.left &&
          ivorySquarePosition.x <= holeRect.right &&
          ivorySquarePosition.y >= holeRect.top &&
          ivorySquarePosition.y <= holeRect.bottom
        ) {
          handleGameReset();
          return;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [ivorySquarePosition]);

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
      {!gameStarted && !gameOver && !gameWon && (
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
      )}
      {gameStarted && <GameComponent onGameOver={handleGameOver} onGameWin={handleGameWin} />}
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
