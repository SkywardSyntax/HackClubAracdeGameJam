import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';

interface GameEngineProps {
  gameStarted: boolean;
  onGameOver: () => void;
  onGameWin: () => void;
}

interface GameEngineState {
  timer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
}

class GameEngine extends React.Component<GameEngineProps, GameEngineState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private timerInterval: NodeJS.Timeout | null;
  private myP5: p5 | undefined;
  private previousPositions: { x: number, y: number }[] = [];
  private particles: Particle[] = [];

  constructor(props: GameEngineProps) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      timer: 60
    };
    this.timerInterval = null;
  }

  Sketch = (p: p5) => {
    let ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    let velocity = { x: 0, y: 0 };
    let keysPressed: { [key: string]: boolean } = {};
    let circles: { x: number, y: number, opacity: number }[] = [];
    let lastResetTime = Date.now();
    let gameOver = false;
    let cameraOffset = { x: 0, y: 0 };

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
        circles.push({ x, y, opacity: 255 });
      }
    };

    p.draw = () => {
      if (gameOver) return;

      p.background('#EDC9AF');
      if (this.props.gameStarted) {
        p.push();
        p.translate(-cameraOffset.x, -cameraOffset.y);

        p.fill('#F5F5DC');
        p.noStroke();
        p.rect(ivorySquare.x, ivorySquare.y, 50, 50);

        if (keysPressed['ArrowUp']) velocity.y -= 1.0;
        if (keysPressed['ArrowDown']) velocity.y += 1.0;
        if (keysPressed['ArrowLeft']) velocity.x -= 1.0;
        if (keysPressed['ArrowRight']) velocity.x += 1.0;

        ivorySquare.x += velocity.x;
        ivorySquare.y += velocity.y;

        velocity.x *= 0.9;
        velocity.y *= 0.9;

        p.fill(0);
        circles.forEach((circle) => {
          p.fill(0, 0, 0, circle.opacity);
          p.ellipse(circle.x, circle.y, 50, 50);
        });

        this.particles.forEach((particle, index) => {
          p.fill(0, 0, 0, particle.opacity);
          p.ellipse(particle.x, particle.y, 5, 5);
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.opacity -= 5;
          if (particle.opacity <= 0) {
            this.particles = this.particles.filter((_, i) => i !== index);
          }
        });

        p.checkGameOver();
        p.checkGameWin();

        // Adjust camera position
        cameraOffset.x = ivorySquare.x - p.width / 2;
        cameraOffset.y = ivorySquare.y - p.height / 2;

        p.pop();

        // Check and add black circles
        this.checkAndAddBlackCircles(p);

        // Store the current position of the ivory square
        this.previousPositions.push({ x: ivorySquare.x, y: ivorySquare.y });
        if (this.previousPositions.length > 1800) {
          this.previousPositions.shift(); // Keep only the last 30 seconds of positions (assuming 60 FPS)
        }
      }
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
          this.setState((prevState) => ({ timer: prevState.timer - 30 })); // Decrement timer by 30 seconds
          if (this.state.timer <= 0) {
            gameOver = true;
            this.props.onGameOver();
          } else {
            // Set the ivory square back 30 seconds in space and time
            const resetPosition = this.previousPositions[0];
            ivorySquare = { x: resetPosition.x, y: resetPosition.y };
            lastResetTime = Date.now();
            this.removeCircle(circle); // Remove the black circle upon collision
            this.previousPositions = []; // Clear the previous positions
          }
        }
      });
    };

    p.checkGameWin = () => {
      if (ivorySquare.y <= 0) {
        gameOver = true;
        this.props.onGameWin();
      }
    };

    this.checkAndAddBlackCircles = (p: p5) => {
      const visibleCircles = circles?.filter(circle => {
        return (
          circle.x >= cameraOffset.x &&
          circle.x <= cameraOffset.x + p.width &&
          circle.y >= cameraOffset.y &&
          circle.y <= cameraOffset.y + p.height
        );
      });

      const offScreenCircles = circles?.filter(circle => {
        return (
          circle.x < cameraOffset.x ||
          circle.x > cameraOffset.x + p.width ||
          circle.y < cameraOffset.y ||
          circle.y > cameraOffset.y + p.height
        );
      });

      offScreenCircles?.forEach(circle => {
        this.removeCircle(circle);
      });

      if (visibleCircles?.length < 10) {
        const spawnRadius = 100;
        for (let i = visibleCircles.length; i < 10; i++) {
          let x, y;
          const edge = determineEdge({ x: ivorySquare.x, y: ivorySquare.y }, velocity);
          switch (edge) {
            case 'top':
              x = p.random(cameraOffset.x, cameraOffset.x + p.width);
              y = cameraOffset.y - spawnRadius;
              break;
            case 'right':
              x = cameraOffset.x + p.width + spawnRadius;
              y = p.random(cameraOffset.y, cameraOffset.y + p.height);
              break;
            case 'bottom':
              x = p.random(cameraOffset.x, cameraOffset.x + p.width);
              y = cameraOffset.y + p.height + spawnRadius;
              break;
            case 'left':
              x = cameraOffset.x - spawnRadius;
              y = p.random(cameraOffset.y, cameraOffset.y + p.height);
              break;
            default:
              x = p.random(cameraOffset.x, cameraOffset.x + p.width);
              y = p.random(cameraOffset.y, cameraOffset.y + p.height);
              break;
          }
          circles.push({ x, y, opacity: 255 });
        }
      }
    };

    this.removeCircle = (circle: { x: number, y: number, opacity: number }) => {
      circles = circles.filter(c => c !== circle);
      this.createParticles(circle);
    };

    this.createParticles = (circle: { x: number, y: number, opacity: number }) => {
      const particles = Array.from({ length: 20 }, () => ({
        x: circle.x,
        y: circle.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        opacity: 255
      }));
      this.particles = [...this.particles, ...particles];
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}

export default GameEngine;
