import React from 'react';

interface LoopholeEnforcerProps {
  circles: { x: number, y: number, opacity: number }[];
  playerPosition: { x: number, y: number };
}

class LoopholeEnforcer extends React.Component<LoopholeEnforcerProps> {
  static canRenderNewCircle(circles: { x: number, y: number, opacity: number }[], playerPosition: { x: number, y: number }) {
    const visibleCircles = circles.filter(circle => {
      return (
        circle.x >= playerPosition.x - window.innerWidth / 2 &&
        circle.x <= playerPosition.x + window.innerWidth / 2 &&
        circle.y >= playerPosition.y - window.innerHeight / 2 &&
        circle.y <= playerPosition.y + window.innerHeight / 2
      );
    });

    return visibleCircles.length < 10;
  }

  render() {
    return (
      <div>
        {LoopholeEnforcer.canRenderNewCircle(this.props.circles, this.props.playerPosition) ? "OK to render new circle" : "Cannot render new circle"}
      </div>
    );
  }
}

export default LoopholeEnforcer;
