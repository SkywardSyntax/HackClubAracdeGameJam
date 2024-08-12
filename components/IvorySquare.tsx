import React from 'react';
import p5 from 'p5';
import { Position, Velocity } from './types';
import Camera from './Camera';

interface State {
  position: Position;
  velocity: Velocity;
  keysPressed: { [key: string]: boolean };
  cameraOffset: Position;
}

class IvorySquare extends React.Component<{}, State> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: {}) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      velocity: { x: 0, y: 0 },
      keysPressed: {},
      cameraOffset: { x: 0, y: 0 }
    };
  }

  Sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.rectMode(p.CENTER);
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.push();
      p.translate(-this.state.cameraOffset.x, -this.state.cameraOffset.y);

      p.fill('#F5F5DC');
      p.noStroke();
      p.rect(this.state.position.x, this.state.position.y, 50, 50);

      if (this.state.keysPressed['ArrowUp']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, y: prevState.velocity.y - 1.5 } }));
      if (this.state.keysPressed['ArrowDown']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, y: prevState.velocity.y + 1.5 } }));
      if (this.state.keysPressed['ArrowLeft']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, x: prevState.velocity.x - 1.5 } }));
      if (this.state.keysPressed['ArrowRight']) this.setState((prevState) => ({ velocity: { ...prevState.velocity, x: prevState.velocity.x + 1.5 } }));

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
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <div>
        <Camera playerPosition={this.state.position} zoomLevel={1} />
        <div ref={this.myRef}></div>
      </div>
    );
  }
}

export default IvorySquare;
