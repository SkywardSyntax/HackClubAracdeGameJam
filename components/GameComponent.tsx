import React from 'react';
import p5 from 'p5';

interface GameComponentProps {
  gameStarted: boolean;
  onGameOver: () => void;
  onGameWin: () => void;
}

interface GameComponentState {
  timer: number;
  gameStarted: boolean;
}

class GameComponent extends React.Component<GameComponentProps, GameComponentState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private timerInterval: NodeJS.Timeout | null;

  constructor(props: GameComponentProps) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      timer: 60,
      gameStarted: false
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
      if (this.state.gameStarted) {
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
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
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
    return <div ref={this.myRef}></div>;
  }
}

export default GameComponent;
