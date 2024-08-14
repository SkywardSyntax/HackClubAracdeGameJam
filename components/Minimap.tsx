import React from 'react';
import p5 from 'p5';

interface MinimapProps {
  playerPosition: { x: number, y: number };
  circles: { x: number, y: number }[];
  ivorySquare: { x: number, y: number };
}

class Minimap extends React.Component<MinimapProps> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: MinimapProps) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(200, 200);
    };

    p.draw = () => {
      try {
        if (!this.props.playerPosition) {
          throw new Error('playerPosition is undefined');
        }
        p.background(255);
        p.fill(0);
        this.props.circles.forEach((circle) => {
          p.ellipse(circle.x / 10, circle.y / 10, 5, 5);
        });
        p.fill(255, 0, 0);
        p.rect(this.props.playerPosition.x / 10, this.props.playerPosition.y / 10, 5, 5);
        p.fill(255, 255, 0);
        p.rect(this.props.ivorySquare.x / 10, this.props.ivorySquare.y / 10, 5, 5);
      } catch (error) {
        console.error('Error in Minimap draw method:', error);
      }
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentDidUpdate() {
    if (this.myP5) {
      this.myP5.remove();
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }
  }

  render() {
    return <div ref={this.myRef} style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '200px', border: '1px solid black' }}></div>;
  }
}

export default Minimap;
