import { useState, useEffect } from 'react';
import p5 from 'p5';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sketch = (p) => {
        let blackHole;
        let astronaut;
        let trash = [];
        let gold = [];
        let pullStrength = 0.01;

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          blackHole = new BlackHole(p.width / 2, p.height / 2);
          astronaut = new Astronaut();
          for (let i = 0; i < 10; i++) {
            trash.push(new Trash());
            gold.push(new Gold());
          }
        };

        p.draw = () => {
          p.background(0);
          blackHole.display();
          astronaut.update();
          astronaut.display();
          for (let t of trash) {
            t.update();
            t.display();
          }
          for (let g of gold) {
            g.update();
            g.display();
          }
          pullStrength += 0.0001;
        };

        class BlackHole {
          constructor(x, y) {
            this.x = x;
            this.y = y;
          }

          display() {
            p.fill(0);
            p.ellipse(this.x, this.y, 100, 100);
          }
        }

        class Astronaut {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.size = 20;
            this.speed = 2;
          }

          update() {
            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * this.speed;
            this.y += p.sin(angle) * this.speed;
            this.speed += pullStrength;
          }

          display() {
            p.fill(255);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }

        class Trash {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.size = 10;
          }

          update() {
            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * pullStrength;
            this.y += p.sin(angle) * pullStrength;
          }

          display() {
            p.fill(150);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }

        class Gold {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.size = 10;
          }

          update() {
            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * pullStrength;
            this.y += p.sin(angle) * pullStrength;
          }

          display() {
            p.fill(255, 215, 0);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }
      };

      const p5Instance = new p5(sketch);

      return () => {
        p5Instance.remove();
      };
    }
  }, []);

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
