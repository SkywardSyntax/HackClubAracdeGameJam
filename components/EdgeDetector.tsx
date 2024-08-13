import { Position, Velocity } from './types';

export function determineEdge(position: Position, velocity: Velocity): string {
  const { x, y } = position;
  const { x: vx, y: vy } = velocity;

  if (Math.abs(vx) > Math.abs(vy)) {
    if (vx > 0) {
      return 'right';
    } else {
      return 'left';
    }
  } else {
    if (vy > 0) {
      return 'bottom';
    } else {
      return 'top';
    }
  }
}

export function determineClosestEdge(position: Position, initialPosition: Position): string {
  const { x, y } = position;
  const { x: initialX, y: initialY } = initialPosition;

  const deltaX = x - initialX;
  const deltaY = y - initialY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      return 'right';
    } else {
      return 'left';
    }
  } else {
    if (deltaY > 0) {
      return 'bottom';
    } else {
      return 'top';
    }
  }
}
