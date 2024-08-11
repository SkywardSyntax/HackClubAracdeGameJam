import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import p5 from 'p5';
import styles from '../components/Game.module.css';
import GameComponent from '../components/GameComponent'; // P2618

function Game() {
  const [gameStarted, setGameStarted] = useState(false); // P57da
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [ivorySquarePosition, setIvorySquarePosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const lastResetTimeRef = useRef(Date.now());
  const [keysPressed, setKeysPressed] = useState({});
  const [timer, setTimer] = useState(60); // 60 seconds

  const startGame = () => {
    setGameStarted(true); // P3c40
    setGameOver(false);
    setGameWon(false);
    setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    setTimer(60); // Reset timer to 60 seconds
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
      setKeysPressed((prevKeys) => ({ ...prevKeys, [key]: true }));
    };

    const handleKeyUp = (event) => {
      const { key } = event;
      setKeysPressed((prevKeys) => ({ ...prevKeys, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIvorySquarePosition((prevPosition) => {
        let newPosition = { ...prevPosition };
        if (keysPressed['ArrowUp']) newPosition.y -= 5;
        if (keysPressed['ArrowDown']) newPosition.y += 5;
        if (keysPressed['ArrowLeft']) newPosition.x -= 5;
        if (keysPressed['ArrowRight']) newPosition.x += 5;
        return newPosition;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [keysPressed]);

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
      const holes = document.querySelectorAll(`.${styles.blackHole}`);
      for (let hole of holes) {
        const holeRect = hole.getBoundingClientRect();
        if (
          ivorySquarePosition.x >= holeRect.left &&
          ivorySquarePosition.x <= holeRect.right &&
          ivorySquarePosition.y >= holeRect.top &&
          ivorySquarePosition.y <= holeRect.bottom
        ) {
          setTimer((prevTimer) => prevTimer - 30); // Decrement timer by 30 seconds
          if (timer <= 0) {
            handleGameOver();
          } else {
            setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
            lastResetTimeRef.current = Date.now();
          }
          return;
        }
      }
    };

    const interval = setInterval(checkGameOver, 100);
    return () => clearInterval(interval);
  }, [ivorySquarePosition, timer]);

  useEffect(() => {
    const handleGameReset = () => {
      const currentTime = Date.now();
      if (currentTime - lastResetTimeRef.current < 30000) { // 30 seconds
        handleGameOver();
      } else {
        setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
        lastResetTimeRef.current = currentTime;
      }
    };

    const interval = setInterval(() => {
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

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            handleGameOver();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  return (
    <div className={styles.desertBackground}>
      {!gameStarted && !gameOver && !gameWon && (
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
      )}
      {gameStarted && <GameComponent gameStarted={gameStarted} onGameOver={handleGameOver} onGameWin={handleGameWin} />} {/* Pd0d0 */}
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
      {gameStarted && (
        <div className={styles.timer}>
          Time: {timer}
        </div>
      )}
    </div>
  );
}

export default Game;
