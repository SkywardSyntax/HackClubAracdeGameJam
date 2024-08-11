import React from 'react';
import p5 from 'p5';

class GameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    let velocity = { x: 0, y: 0 };
    let keysPressed = {};
    let circles = [];
    let timer = 60000; // 60 seconds
    let lastResetTime = Date.now();

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.rectMode(p.CENTER);
      for (let i = 0; i < 10; i++) {
        circles.push({
          x: p.random(p.width),
          y: p.random(p.height),
        });
      }
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.fill('#F5F5DC');
      p.noStroke();
      p.rect(ivorySquare.x, ivorySquare.y, 50, 50);

      if (keysPressed['ArrowUp']) velocity.y -= 0.5;
      if (keysPressed['ArrowDown']) velocity.y += 0.5;
      if (keysPressed['ArrowLeft']) velocity.x -= 0.5;
      if (keysPressed['ArrowRight']) velocity.x += 0.5;

      ivorySquare.x += velocity.x;
      ivorySquare.y += velocity.y;

      velocity.x *= 0.9;
      velocity.y *= 0.9;

      p.fill(0);
      circles.forEach((circle) => {
        p.ellipse(circle.x, circle.y, 50, 50);
      });

      p.checkGameOver();
      p.checkGameWin();
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

    p.updateCircles = () => {
      circles = [];
      for (let i = 0; i < 10; i++) {
        circles.push({
          x: p.random(p.width),
          y: p.random(p.height),
        });
      }
    };

    p.checkGameOver = () => {
      circles.forEach((circle) => {
        if (
          ivorySquare.x >= circle.x - 25 &&
          ivorySquare.x <= circle.x + 25 &&
          ivorySquare.y >= circle.y - 25 &&
          ivorySquare.y <= circle.y + 25
        ) {
          timer -= 30000; // Decrement timer by 30 seconds
          if (timer <= 0) {
            this.props.onGameOver();
          } else {
            ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
            lastResetTime = Date.now();
          }
        }
      });
    };

    p.checkGameWin = () => {
      if (ivorySquare.y <= 0) {
        this.props.onGameWin();
      }
    };

    setInterval(p.updateCircles, 1000);

    setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastResetTime < 30000) { // 30 seconds
        this.props.onGameOver();
      } else {
        ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
        lastResetTime = currentTime;
      }
    }, 100);
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}

export default GameComponent;
