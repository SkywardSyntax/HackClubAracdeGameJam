import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import p5 from 'p5';
import styles from '../components/Game.module.css';

const GameComponent = dynamic(() => import('../components/GameComponent'), { ssr: false });

function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [ivorySquarePosition, setIvorySquarePosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const lastResetTimeRef = useRef(Date.now());
  const [keysPressed, setKeysPressed] = useState({});
  const [timer, setTimer] = useState(60000); // 60 seconds

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setIvorySquarePosition({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    setTimer(60000); // Reset timer to 60 seconds
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
          setTimer((prevTimer) => prevTimer - 30000); // Decrement timer by 30 seconds
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

  const Sketch = (p) => {
    let ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    let velocity = { x: 0, y: 0 };
    let keysPressed = {};
    let circles = [];
    let timer = 60000; // 60 seconds
    let lastResetTime = Date.now();
    let gameOver = false;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.rectMode(p.CENTER);
      const spawnRadius = 100; // Radius around the ivory square where no black holes can spawn
      for (let i = 0; i < 10; i++) {
        let x, y;
        do {
          x = p.random(p.width);
          y = p.random(p.height);
        } while (p.dist(x, y, ivorySquare.x, ivorySquare.y) < spawnRadius);
        circles.push({ x, y });
      }
    };

    p.draw = () => {
      if (gameOver) return;

      p.background('#EDC9AF');
      p.fill('#F5F5DC');
      p.noStroke();
      p.rect(ivorySquare.x, ivorySquare.y, 50, 50);

      if (keysPressed['ArrowUp']) velocity.y -= 0.5;
      if (keysPressed['ArrowDown']) velocity.y += 0.5;
      if (keysPressed['ArrowLeft']) velocity.x -= 0.5;
      if (keysPressed['ArrowRight']) velocity.x += 0.5;

      ivorySquare.x += velocity.x;
      ivorySquare.y += velocity.y;

      velocity.x *= 0.9;
      velocity.y *= 0.9;

      p.fill(0);
      circles.forEach((circle) => {
        p.ellipse(circle.x, circle.y, 50, 50);
      });

      p.checkGameOver();
      p.checkGameWin();
    };

    p.keyPressed = () => {
      keysPressed[p.key] = true;
    };

    p.keyReleased = () => {
      keysPressed[p.key] = false;
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    };

    p.checkGameOver = () => {
      circles.forEach((circle) => {
        if (
          ivorySquare.x >= circle.x - 25 &&
          ivorySquare.x <= circle.x + 25 &&
          ivorySquare.y >= circle.y - 25 &&
          ivorySquare.y <= circle.y + 25
        ) {
          timer -= 30000; // Decrement timer by 30 seconds
          if (timer <= 0) {
            gameOver = true;
            handleGameOver();
          } else {
            ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
            lastResetTime = Date.now();
          }
        }
      });
    };

    p.checkGameWin = () => {
      if (ivorySquare.y <= 0) {
        gameOver = true;
        handleGameWin();
      }
    };

    setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastResetTime < 0) { // 30 seconds
        gameOver = true;
        handleGameOver();
      } else {
        ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
        lastResetTime = currentTime;
      }
    }, 100);
  };

  useEffect(() => {
    const myP5 = new p5(Sketch);
    return () => myP5.remove();
  }, []);

  return (
    <div className={styles.desertBackground}>
      {!gameStarted && !gameOver && !gameWon && (
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
      )}
      {gameStarted && <div id="p5-canvas"></div>}
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
