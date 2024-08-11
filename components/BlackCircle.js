import React from 'react';
import p5 from 'p5';

class BlackCircles extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let circles = [];

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      for (let i = 0; i < 10; i++) {
        circles.push({
          x: p.random(p.width),
          y: p.random(p.height),
        });
      }
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.fill(0);
      p.noStroke();
      circles.forEach((circle) => {
        p.ellipse(circle.x, circle.y, 50, 50);
      });
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
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
