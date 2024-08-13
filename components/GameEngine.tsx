import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';
import { Particle } from './types';
import { checkAndAddBlackCircles, removeCircleFromArray, createParticles, limitBlackCircles } from './circleUtils';
import Camera from './Camera';
import IvorySquare from './IvorySquare';
import Minimap from './Minimap';

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
      ivorySquare: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
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
      this.setState({ circles });
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

        p.checkGameOver();
        p.checkGameWin();

        // Adjust camera position
        cameraOffset.x = ivorySquare.x - p.width / 2;
        cameraOffset.y = ivorySquare.y - p.height / 2;

        p.pop();

        // Check and add black circles
        checkAndAddBlackCircles(p, circles, ivorySquare, velocity, this.removeCircleFromArray, limitBlackCircles);

        // Store the current position of the ivory square
        this.previousPositions.push({ x: ivorySquare.x, y: ivorySquare.y });
        if (this.previousPositions.length > 1800) {
          this.previousPositions.shift(); // Keep only the last 30 seconds of positions (assuming 60 FPS)
        }

        // Remove circles that are out of view
        circles = circles.filter(circle => circle.x >= 0 && circle.x <= p.width && circle.y >= 0 && circle.y <= p.height);
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
            removeCircleFromArray(circles, circle, createParticles); // Remove the black circle upon collision
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
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <div>
        <IvorySquare circles={this.state.circles} timer={this.state.timer} />
        <Minimap playerPosition={this.state.ivorySquare} circles={this.state.circles} />
        <div ref={this.myRef}></div>
      </div>
    );
  }
}

export default GameEngine;
