import { Circle, Particle, Position, Velocity } from './types';

export function checkAndAddBlackCircles(
  p: p5,
  circles: Circle[],
  playerPosition: Position,
  playerVelocity: Velocity,
  removeCircleFromArray: (circle: Circle) => void
) {
  circles.forEach((circle) => {
    if (
      playerPosition.x >= circle.x - 25 &&
      playerPosition.x <= circle.x + 25 &&
      playerPosition.y >= circle.y - 25 &&
      playerPosition.y <= circle.y + 25
    ) {
      removeCircleFromArray(circle);
    }
  });
}

export function removeCircleFromArray(
  circles: Circle[],
  circle: Circle,
  createParticles: (circle: Circle) => void
) {
  const index = circles.indexOf(circle);
  if (index > -1) {
    circles.splice(index, 1);
    createParticles(circle);
  }
}

export function createParticles(circle: Circle): Particle[] {
  return Array.from({ length: 20 }, () => ({
    x: circle.x,
    y: circle.y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    opacity: 255
  }));
}

export function isCircleOutOfView(circle: Circle, p: p5): boolean {
  return circle.x < 0 || circle.x > p.width || circle.y < 0 || circle.y > p.height;
}
