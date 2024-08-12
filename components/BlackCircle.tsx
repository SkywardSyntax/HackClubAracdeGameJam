import React from 'react';
import p5 from 'p5';

interface Circle {
  x: number;
  y: number;
}

interface BlackCirclesState {
  circles: Circle[];
  keysPressed: { [key: string]: boolean };
}

class BlackCircles extends React.Component<{}, BlackCirclesState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: {}) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      circles: [],
      keysPressed: {}
    };
  }

  Sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      this.setState({
        circles: Array.from({ length: 10 }, () => ({
          x: p.random(p.width),
          y: p.random(p.height),
        }))
      });
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.fill(0);
      p.noStroke();
      this.state.circles.forEach((circle) => {
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
      const visibleCircles = this.state.circles.filter(circle => {
        return (
          circle.x >= 0 &&
          circle.x <= p.width &&
          circle.y >= 0 &&
          circle.y <= p.height
        );
      });

      if (visibleCircles.length < 10) {
        const newCircles = Array.from({ length: 10 - visibleCircles.length }, () => ({
          x: p.random(p.width),
          y: p.random(p.height),
        }));
        this.setState((prevState) => ({
          circles: [...prevState.circles, ...newCircles]
        }));
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

export default BlackCircles;
