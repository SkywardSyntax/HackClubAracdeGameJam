import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';
import { Particle } from './types';
import { checkAndAddBlackCircles, removeCircleFromArray, createParticles, limitBlackCircles } from './circleUtils';
import Camera from './Camera';
import Minimap from './Minimap';
import LoopholeEnforcer from './LoopholeEnforcer';

interface GameEngineProps {
  gameStarted: boolean;
  onGameOver: () => void;
  onGameWin: () => void;
}

interface GameEngineState {
  timer: number;
  circles: { x: number, y: number, opacity: number }[];
  ivorySquare: { x: number, y: number };
}

interface LoopholeEnforcerProps {
  circles: { x: number, y: number, opacity: number }[];
  playerPosition: { x: number, y: number };
  canRenderNewCircle: (circles: { x: number, y: number, opacity: number }[], playerPosition: { x: number, y: number }) => boolean;
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
      timer: 60,
      circles: [],
      ivorySquare: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 }
    };
    this.timerInterval = null;
  }

  Sketch = (p: p5) => {
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
        } while (p.dist(x, y, this.state.ivorySquare.x, this.state.ivorySquare.y) < spawnRadius);
        circles.push({ x, y, opacity: 255 });
      }
      this.setState({ circles });
    };

    p.draw = () => {
      try {
        if (gameOver) return;

        p.background('#EDC9AF');
        if (this.props.gameStarted) {
          p.push();
          p.translate(-cameraOffset.x, -cameraOffset.y);

          p.fill('#F5F5DC');
          p.noStroke();
          p.rect(this.state.ivorySquare.x, this.state.ivorySquare.y, 50, 50);

          if (keysPressed['ArrowUp']) velocity.y -= 1.0;
          if (keysPressed['ArrowDown']) velocity.y += 1.0;
          if (keysPressed['ArrowLeft']) velocity.x -= 1.0;
          if (keysPressed['ArrowRight']) velocity.x += 1.0;

          this.setState((prevState) => ({
            ivorySquare: {
              x: prevState.ivorySquare.x + velocity.x,
              y: prevState.ivorySquare.y + velocity.y
            }
          }));

          velocity.x *= 0.9;
          velocity.y *= 0.9;

          p.fill(0);
          if (circles) {
            circles.forEach((circle) => {
              p.fill(0, 0, 0, circle.opacity);
              p.ellipse(circle.x, circle.y, 50, 50);
            });
          }

          if (this.particles) {
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
          }

          this.checkGameOver();
          this.checkGameWin();

          // Adjust camera position
          cameraOffset.x = this.state.ivorySquare.x - p.width / 2;
          cameraOffset.y = this.state.ivorySquare.y - p.height / 2;

          p.pop();

          // Check and add black circles
          checkAndAddBlackCircles(p, circles, this.state.ivorySquare, velocity, removeCircleFromArray, limitBlackCircles);

          // Store the current position of the ivory square
          this.previousPositions.push({ x: this.state.ivorySquare.x, y: this.state.ivorySquare.y });
          if (this.previousPositions.length > 1800) {
            this.previousPositions.shift(); // Keep only the last 30 seconds of positions (assuming 60 FPS)
          }

          // Remove circles that are out of view
          circles = circles.filter(circle => circle.x >= 0 && circle.x <= p.width && circle.y >= 0 && circle.y <= p.height);

          // Update the state with the current positions of the ivory square and circles
          this.setState({ circles });
        }
      } catch (error) {
        console.error('Error during game loop:', error);
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
      this.setState({
        ivorySquare: { x: p.windowWidth / 2, y: p.windowHeight / 2 }
      });
    };
  };

  checkGameOver = () => {
    this.state.circles.forEach((circle) => {
      if (
        this.state.ivorySquare.x >= circle.x - 25 &&
        this.state.ivorySquare.x <= circle.x + 25 &&
        this.state.ivorySquare.y >= circle.y - 25 &&
        this.state.ivorySquare.y <= circle.y + 25
      ) {
        this.setState((prevState) => ({ timer: prevState.timer - 30 })); // Decrement timer by 30 seconds
        if (this.state.timer <= 0) {
          this.props.onGameOver();
        } else {
          // Set the ivory square back 30 seconds in space and time
          const resetPosition = this.previousPositions[0];
          this.setState({
            ivorySquare: { x: resetPosition.x, y: resetPosition.y }
          });
          removeCircleFromArray(this.state.circles, circle, createParticles); // Remove the black circle upon collision
          this.previousPositions = []; // Clear the previous positions
        }
      }
    });
  };

  checkGameWin = () => {
    if (this.state.ivorySquare.y <= 0) {
      this.props.onGameWin();
    }
  };

  componentDidMount() {
    if (this.myRef.current) {
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }
  }

  render() {
    return (
      <div>
        <Minimap playerPosition={this.state.ivorySquare} circles={this.state.circles} ivorySquare={this.state.ivorySquare} />
        <div ref={this.myRef}></div>
      </div>
    );
  }
}

export default GameEngine;
