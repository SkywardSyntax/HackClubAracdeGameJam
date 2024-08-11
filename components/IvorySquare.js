import React from 'react';
import p5 from 'p5';

class IvorySquare extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let position = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    let velocity = { x: 0, y: 0 };
    let keysPressed = {};

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.rectMode(p.CENTER);
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.fill('#F5F5DC');
      p.noStroke();
      p.rect(position.x, position.y, 50, 50);

      if (keysPressed['ArrowUp']) velocity.y -= 0.5;
      if (keysPressed['ArrowDown']) velocity.y += 0.5;
      if (keysPressed['ArrowLeft']) velocity.x -= 0.5;
      if (keysPressed['ArrowRight']) velocity.x += 0.5;

      position.x += velocity.x;
      position.y += velocity.y;

      velocity.x *= 0.9;
      velocity.y *= 0.9;
    };

    p.keyPressed = () => {
      keysPressed[p.key] = true;
    };

    p.keyReleased = () => {
      keysPressed[p.key] = false;
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      position = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}

export default IvorySquare;
