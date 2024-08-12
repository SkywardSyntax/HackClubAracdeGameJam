import React from 'react';
import p5 from 'p5';
import { determineEdge } from './EdgeDetector';

interface Circle {
  x: number;
  y: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
}

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

      this.checkAndAddBlackCircles(p);
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

    this.checkAndAddBlackCircles = (p: p5) => {
      const visibleCircles = this.state.circles?.filter(circle => {
        return (
          circle.x >= 0 &&
          circle.x <= p.width &&
          circle.y >= 0 &&
          circle.y <= p.height
        );
      });

      const offScreenCircles = this.state.circles?.filter(circle => {
        return (
          circle.x < 0 ||
          circle.x > p.width ||
          circle.y < 0 ||
          circle.y > p.height
        );
      });

      offScreenCircles?.forEach(circle => {
        this.removeCircle(circle);
      });

      if (visibleCircles?.length < 10) {
        const spawnRadius = 100;
        for (let i = visibleCircles.length; i < 10; i++) {
          let x, y;
          const edge = determineEdge(this.state.playerPosition, this.state.playerVelocity);
          switch (edge) {
            case 'top':
              x = p.random(p.width);
              y = -spawnRadius;
              break;
            case 'right':
              x = p.width + spawnRadius;
              y = p.random(p.height);
              break;
            case 'bottom':
              x = p.random(p.width);
              y = p.height + spawnRadius;
              break;
            case 'left':
              x = -spawnRadius;
              y = p.random(p.height);
              break;
            default:
              x = p.random(p.width);
              y = p.random(p.height);
              break;
          }
          this.setState((prevState) => ({
            circles: [...prevState.circles, { x, y, opacity: 255 }]
          }));
        }
      }
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
