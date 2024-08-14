import React from 'react';
import p5 from 'p5';

interface MinimapProps {
  playerPosition: { x: number, y: number };
  circles: { x: number, y: number }[];
  ivorySquare: { x: number, y: number };
  style?: React.CSSProperties;
}

class Minimap extends React.Component<MinimapProps> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: MinimapProps) {
    super(props);
    this.myRef = React.createRef();
    if (typeof window !== 'undefined') {
      this.state = {
        playerPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        circles: [],
        ivorySquare: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      };
    } else {
      this.state = {
        playerPosition: { x: 0, y: 0 },
        circles: [],
        ivorySquare: { x: 0, y: 0 }
      };
    }
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

        // Add logic to ensure the player ivory square pulses if it's near black circles
        const proximityThreshold = 100;
        let isCloseToBlackCircle = false;

        this.props.circles.forEach((circle) => {
          const distance = p.dist(this.props.ivorySquare.x, this.props.ivorySquare.y, circle.x, circle.y);
          if (distance < proximityThreshold) {
            isCloseToBlackCircle = true;
          }
        });

        if (isCloseToBlackCircle) {
          const time = p.millis() / 1000;
          const pulsateFactor = 1 + 0.1 * p.sin(time * 2 * p.PI);
          p.rect(this.props.ivorySquare.x / 10, this.props.ivorySquare.y / 10, 5 * pulsateFactor, 5 * pulsateFactor);
        } else {
          p.rect(this.props.ivorySquare.x / 10, this.props.ivorySquare.y / 10, 5, 5);
        }
      } catch (error) {
        console.error('Error in Minimap draw method:', error);
      }
    };
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }
  }

  componentDidUpdate() {
    if (this.myP5) {
      this.myP5.remove();
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }
  }

  render() {
    return <div ref={this.myRef} className="minimap" style={this.props.style}></div>;
  }
}

export default Minimap;
