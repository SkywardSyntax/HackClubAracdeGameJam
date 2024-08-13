import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';
import { Circle, Particle } from './types';
import { checkAndAddBlackCircles, removeCircleFromArray, limitBlackCircles } from './circleUtils';

interface BlackCirclesState {
  circles: Circle[];
  particles: Particle[];
  keysPressed: { [key: string]: boolean };
  playerPosition: { x: number, y: number };
  playerVelocity: { x: number, y: number };
  isDashing: boolean;
  dashCooldown: number;
  lastDashTime: number;
  lastSpacePressTime: number;
}

class BlackCircles extends React.Component<{}, BlackCirclesState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: {}) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      circles: [],
      particles: [],
      keysPressed: {},
      playerPosition: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 },
      playerVelocity: { x: 0, y: 0 },
      isDashing: false,
      dashCooldown: 0,
      lastDashTime: 0,
      lastSpacePressTime: 0
    };
  }

  Sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      this.setState({
        circles: Array.from({ length: 10 }, () => ({
          x: p.random(p.width),
          y: p.random(p.height),
          opacity: 255
        }))
      });
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.fill(0);
      p.noStroke();
      this.state.circles.forEach((circle) => {
        p.fill(0, 0, 0, circle.opacity);
        p.ellipse(circle.x, circle.y, 50, 50);
      });

      this.state.particles.forEach((particle, index) => {
        p.fill(0, 0, 0, particle.opacity);
        p.ellipse(particle.x, particle.y, 5, 5);
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity -= 5;
        if (particle.opacity <= 0) {
          this.setState((prevState) => ({
            particles: prevState.particles.filter((_, i) => i !== index)
          }));
        }
      });

      checkAndAddBlackCircles(p, this.state.circles, this.state.playerPosition, this.state.playerVelocity, removeCircleFromArray, limitBlackCircles);

      if (this.state.keysPressed[' '] && !this.state.isDashing && this.state.dashCooldown <= 0) {
        const currentTime = p.millis();
        if (currentTime - this.state.lastSpacePressTime < 300) { // Double-tap detection within 300ms
          this.setState((prevState) => ({
            isDashing: true,
            dashCooldown: 60, // Cooldown period of 60 frames
            lastDashTime: currentTime,
            playerVelocity: {
              x: prevState.playerVelocity.x * 2,
              y: prevState.playerVelocity.y * 2
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

      // Update player position based on velocity
      this.setState((prevState) => ({
        playerPosition: {
          x: prevState.playerPosition.x + prevState.playerVelocity.x,
          y: prevState.playerPosition.y + prevState.playerVelocity.y
        },
        playerVelocity: {
          x: prevState.playerVelocity.x * 0.9,
          y: prevState.playerVelocity.y * 0.9
        }
      }));

      // Ensure no more than 10 black circles are on the screen at any time
      if (this.state.circles.length > 10) {
        this.setState((prevState) => ({
          circles: prevState.circles.slice(0, 10)
        }));
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.keyPressed = () => {
      this.setState((prevState) => ({
        keysPressed: { ...prevState.keysPressed, [p.key]: true }
      }));
    };

    p.keyReleased = () => {
      this.setState((prevState) => ({
        keysPressed: { ...prevState.keysPressed, [p.key]: false }
      }));
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}

export default BlackCircles;
