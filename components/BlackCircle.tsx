import React from 'react';
import p5 from 'p5';

interface Circle {
  x: number;
  y: number;
  opacity: number;
}

interface BlackCirclesState {
  circles: Circle[];
  keysPressed: { [key: string]: boolean };
  playerPosition: { x: number, y: number };
}

class BlackCircles extends React.Component<{}, BlackCirclesState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: {}) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      circles: [],
      keysPressed: {},
      playerPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
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
          do {
            x = p.random(this.state.playerPosition.x - spawnRadius, this.state.playerPosition.x + spawnRadius);
            y = p.random(this.state.playerPosition.y - spawnRadius, this.state.playerPosition.y + spawnRadius);
          } while (p.dist(x, y, this.state.playerPosition.x, this.state.playerPosition.y) < spawnRadius);
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
