import React from 'react';
import p5 from 'p5';
import { Position, Velocity, Circle, Particle } from './types';
import Camera from './Camera';
import Minimap from './Minimap';
import { createParticles } from './circleUtils';

interface State {
  position: Position;
  velocity: Velocity;
  keysPressed: { [key: string]: boolean };
  cameraOffset: Position;
  isDashing: boolean;
  dashCooldown: number;
  lastDashTime: number;
  lastSpacePressTime: number;
  size: number;
  timer: number;
}

interface Props {
  circles: Circle[];
  timer: number;
}

class IvorySquare extends React.Component<Props, State> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: Props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      position: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 },
      velocity: { x: 0, y: 0 },
      keysPressed: {},
      cameraOffset: { x: 0, y: 0 },
      isDashing: false,
      dashCooldown: 0,
      lastDashTime: 0,
      lastSpacePressTime: 0,
      size: 50,
      timer: 0
    };
  }

  pulsateIvorySquare = (p: p5) => {
    const proximityThreshold = 100;
    let isCloseToBlackCircle = false;

    if (this.props.circles) {
      this.props.circles.forEach((circle) => {
        const distance = p.dist(this.state.position.x, this.state.position.y, circle.x, circle.y);
        if (distance < proximityThreshold) {
          isCloseToBlackCircle = true;
        }
      });
    }

    if (isCloseToBlackCircle) {
      const time = p.millis() / 1000;
      const pulsateFactor = 1 + 0.1 * p.sin(time * 2 * p.PI);
      this.setState({ size: 50 * pulsateFactor });
    } else {
      this.setState({ size: 50 });
    }
  };

  jumpIvorySquare = (p: p5) => {
    if (this.state.keysPressed['j']) {
      this.setState((prevState) => ({
        position: {
          x: prevState.position.x,
          y: prevState.position.y - 50
        }
      }));
    }
  };

  Sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.rectMode(p.CENTER);
    };

    p.draw = () => {
      try {
        p.background('#EDC9AF');
        p.push();
        p.translate(-this.state.cameraOffset.x, -this.state.cameraOffset.y);

        this.pulsateIvorySquare(p);
        this.jumpIvorySquare(p);

        p.fill('#F5F5DC');
        p.noStroke();
        p.rect(this.state.position.x, this.state.position.y, this.state.size, this.state.size);

        if (this.state.keysPressed['ArrowUp']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, y: prevState.velocity.y - 1.5 } }));
        if (this.state.keysPressed['ArrowDown']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, y: prevState.velocity.y + 1.5 } }));
        if (this.state.keysPressed['ArrowLeft']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, x: prevState.velocity.x - 1.5 } }));
        if (this.state.keysPressed['ArrowRight']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, x: prevState.velocity.x + 1.5 } }));

        if (this.state.keysPressed[' '] && !this.state.isDashing && this.state.dashCooldown <= 0) {
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
          position: {
            x: prevState.position.x + prevState.velocity.x,
            y: prevState.position.y + prevState.velocity.y
          },
          velocity: {
            x: prevState.velocity.x * 0.9,
            y: prevState.velocity.y * 0.9
          }
        }));

        p.pop();

        // Update the timer state
        this.setState({ timer: this.props.timer });
      } catch (error) {
        console.error('Error during game loop:', error);
      }
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

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      this.setState({
        position: { x: p.windowWidth / 2, y: p.windowHeight / 2 }
      });
    };
  };

  componentDidMount() {
    if (this.myRef.current) {
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }
  }

  render() {
    return (
      <div>
        <Camera playerPosition={this.state.position} zoomLevel={1} />
        <Minimap playerPosition={this.state.position} circles={this.props.circles} ivorySquare={{
          x: 0,
          y: 0
        }} />
        <div ref={this.myRef}></div>
        <div className="timer">Timer: {this.state.timer}</div>
      </div>
    );
  }
}

export default IvorySquare;
