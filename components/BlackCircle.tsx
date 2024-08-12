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
        this.fadeOutCircle(circle);
      });

      if (visibleCircles?.length < 10) {
        const newCircles = Array.from({ length: 10 - visibleCircles.length }, () => ({
          x: p.random(p.width),
          y: p.random(p.height),
          opacity: 255
        }));
        this.setState((prevState) => ({
          circles: [...prevState.circles, ...newCircles]
        }));
      }
    };

    this.fadeOutCircle = (circle: Circle) => {
      const interval = setInterval(() => {
        this.setState((prevState) => {
          const updatedCircles = prevState.circles?.map(c => {
            if (c === circle) {
              return { ...c, opacity: c.opacity - 5 };
            }
            return c;
          });
          return { circles: updatedCircles };
        });

        if (circle.opacity <= 0) {
          clearInterval(interval);
          this.setState((prevState) => ({
            circles: prevState.circles?.filter(c => c !== circle)
          }));
        }
      }, 50);
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
