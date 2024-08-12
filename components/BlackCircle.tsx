import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';
import { Circle, Particle } from './types';
import { checkAndAddBlackCircles, removeCircle } from './circleUtils';

interface BlackCirclesState {
  circles: Circle[];
  particles: Particle[];
  keysPressed: { [key: string]: boolean };
  playerPosition: { x: number, y: number };
  playerVelocity: { x: number, y: number };
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
      playerPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      playerVelocity: { x: 0, y: 0 }
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

      checkAndAddBlackCircles(p, this.state.circles, this.state.playerPosition, this.state.playerVelocity, this.removeCircle);
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

    this.removeCircle = (circle: Circle) => {
      this.setState((prevState) => ({
        circles: prevState.circles?.filter(c => c !== circle)
      }));
      this.createParticles(circle);
    };

    this.createParticles = (circle: Circle) => {
      const particles = Array.from({ length: 20 }, () => ({
        x: circle.x,
        y: circle.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        opacity: 255
      }));
      this.setState((prevState) => ({
        particles: [...prevState.particles, ...particles]
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
