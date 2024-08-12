import React from 'react';
import p5 from 'p5';
import { Position } from './types';

interface CameraProps {
  playerPosition: Position;
  zoomLevel: number;
}

interface CameraState {
  cameraOffset: Position;
  currentZoom: number;
}

class Camera extends React.Component<CameraProps, CameraState> {
  private myRef: React.RefObject<HTMLDivElement>;
  private myP5: p5 | undefined;

  constructor(props: CameraProps) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      cameraOffset: { x: 0, y: 0 },
      currentZoom: 1
    };
  }

  Sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
      p.background('#EDC9AF');
      p.push();
      p.translate(-this.state.cameraOffset.x, -this.state.cameraOffset.y);
      p.scale(this.state.currentZoom);

      // Render the game elements here

      p.pop();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentDidUpdate(prevProps: CameraProps) {
    if (prevProps.playerPosition !== this.props.playerPosition) {
      this.updateCameraPosition();
    }
    if (prevProps.zoomLevel !== this.props.zoomLevel) {
      this.smoothZoom();
    }
  }

  updateCameraPosition = () => {
    this.setState({
      cameraOffset: {
        x: this.props.playerPosition.x - window.innerWidth / 2,
        y: this.props.playerPosition.y - window.innerHeight / 2
      }
    });
  };

  smoothZoom = () => {
    const zoomDifference = this.props.zoomLevel - this.state.currentZoom;
    const zoomStep = zoomDifference / 10;
    this.setState((prevState) => ({
      currentZoom: prevState.currentZoom + zoomStep
    }));
  };

  render() {
    return <div ref={this.myRef}></div>;
  }
}

export default Camera;
