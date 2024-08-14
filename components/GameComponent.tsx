import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';
import { Position, Velocity, Particle } from './types';
import { checkAndAddBlackCircles, removeCircleFromArray, createParticles, limitBlackCircles } from './circleUtils';
import Minimap from './Minimap';

interface GameComponentProps {
  gameStarted: boolean;
  onGameOver: () => void;
  onGameWin: () => void;
}

interface GameComponentState {
  timer: number;
  gameStarted: boolean;
  isDashing: boolean;
  dashCooldown: number;
  lastDashTime: number;
  lastSpacePressTime: number;
  ivorySquare: Position;
  circles: { x: number, y: number, opacity: number }[];
  velocity: Velocity;
  particles: Particle[];
}

class GameComponent extends React.Component<GameComponentProps, GameComponentState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private timerInterval: NodeJS.Timeout | null;
  private previousPositions: { x: number, y: number }[] = [];
  private myP5: p5 | undefined;

  constructor(props: GameComponentProps) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      timer: 60,
      gameStarted: false,
      isDashing: false,
      dashCooldown: 0,
      lastDashTime: 0,
      lastSpacePressTime: 0,
      ivorySquare: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      circles: [],
      velocity: { x: 0, y: 0 },
      particles: []
    };
    this.timerInterval = null;
  }

  Sketch = (p: p5) => {
    let velocity: Velocity = { x: 0, y: 0 };
    let keysPressed: { [key: string]: boolean } = {};
    let circles: { x: number, y: number, opacity: number }[] = [];
    let lastResetTime = Date.now();
    let gameOver = false;
    let cameraOffset: Position = { x: 0, y: 0 };

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
    };

    p.draw = () => {
      try {
        if (gameOver) return;

        p.background('#EDC9AF');
        if (this.state.gameStarted) {
          p.push();
          p.translate(-cameraOffset.x, -cameraOffset.y);

          p.fill('#F5F5DC');
          p.noStroke();
          p.rect(this.state.ivorySquare.x, this.state.ivorySquare.y, 50, 50);

          if (keysPressed['ArrowUp']) velocity.y -= 1.0;
          if (keysPressed['ArrowDown']) velocity.y += 1.0;
          if (keysPressed['ArrowLeft']) velocity.x -= 1.0;
          if (keysPressed['ArrowRight']) velocity.x += 1.0;

          if (keysPressed[' '] && !this.state.isDashing && this.state.dashCooldown <= 0) {
            const currentTime = p.millis();
            if (currentTime - this.state.lastSpacePressTime < 300) { // Double-tap detection within 300ms
              this.setState((prevState) => ({
                isDashing: true,
                dashCooldown: 60, // Cooldown period of 60 frames
                lastDashTime: currentTime,
                velocity: {
                  x: prevState.velocity.x * 2,
                  y: prevState.velocity.y * 2
                }
              }));
            }
            this.setState({ lastSpacePressTime: currentTime });
          }

          if (this.state.isDashing) {
            this.setState((prevState) => ({
              isDashing: false
            }));
          }

          if (this.state.dashCooldown > 0) {
            this.setState((prevState) => ({
              dashCooldown: prevState.dashCooldown - 1
            }));
          }

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

  componentDidUpdate(prevProps: GameComponentProps) {
    if (this.props.gameStarted && !prevProps.gameStarted) {
      this.setState({ timer: 60 }); // Reset the timer when the game is restarted
    }
  }

  componentWillUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startGame = () => {
    if (!this.state.gameStarted) {
      this.setState({ gameStarted: true, timer: 60 });
      this.timerInterval = setInterval(() => {
        if (this.state.gameStarted) {
          this.setState((prevState) => ({ timer: prevState.timer - 1 }));
          if (this.state.timer <= 0) {
            this.props.onGameOver();
          }
        }
      }, 1000);
    }
  };

  render() {
    return (
      <div>
        <Minimap playerPosition={this.state.ivorySquare} circles={this.state.circles} style={{ top: '10px', left: '10px', width: '200px', height: '200px', zIndex: 2 }} ivorySquare={{
          x: 0,
          y: 0
        }} />
        <div ref={this.myRef}></div>
      </div>
    );
  }
}

export default GameComponent;
