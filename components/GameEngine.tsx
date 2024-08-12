import React from 'react';
import p5 from 'p5';

interface GameEngineProps {
  gameStarted: boolean;
  onGameOver: () => void;
  onGameWin: () => void;
}

interface GameEngineState {
  timer: number;
}

class GameEngine extends React.Component<GameEngineProps, GameEngineState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private timerInterval: NodeJS.Timeout | null;
  private myP5: p5 | undefined;

  constructor(props: GameEngineProps) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      timer: 60
    };
    this.timerInterval = null;
  }

  Sketch = (p: p5) => {
    let ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
    let velocity = { x: 0, y: 0 };
    let keysPressed: { [key: string]: boolean } = {};
    let circles: { x: number, y: number }[] = [];
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
        circles.push({ x, y });
      }
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

        // Adjust camera position
        cameraOffset.x = ivorySquare.x - p.width / 2;
        cameraOffset.y = ivorySquare.y - p.height / 2;

        p.pop();

        // Check and add black circles
        this.checkAndAddBlackCircles(p);
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
            ivorySquare = { x: p.windowWidth / 2, y: p.windowHeight / 2 };
            lastResetTime = Date.now();
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

    this.checkAndAddBlackCircles = (p: p5) => {
      const visibleCircles = circles.filter(circle => {
        return (
          circle.x >= cameraOffset.x &&
          circle.x <= cameraOffset.x + p.width &&
          circle.y >= cameraOffset.y &&
          circle.y <= cameraOffset.y + p.height
        );
      });

      if (visibleCircles.length < 10) {
        const spawnRadius = 100;
        for (let i = visibleCircles.length; i < 10; i++) {
          let x, y;
          do {
            x = p.random(p.width);
            y = p.random(p.height);
          } while (p.dist(x, y, ivorySquare.x, ivorySquare.y) < spawnRadius);
          circles.push({ x, y });
        }
      }
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}

export default GameEngine;
