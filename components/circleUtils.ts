import { Circle, Particle, Position, Velocity } from './types';

export function checkAndAddBlackCircles(
  p: p5,
  circles: Circle[],
  playerPosition: Position,
  playerVelocity: Velocity,
  removeCircleFromArray: (circles: Circle[], circle: Circle, createParticles: (circle: Circle) => Particle[]) => void,
  limitBlackCircles: (circles: Circle[], maxCircles: number) => Circle[]
) {
  try {
    if (!circles) {
      return;
    }

    circles.forEach((circle) => {
      if (
        playerPosition.x >= circle.x - 25 &&
        playerPosition.x <= circle.x + 25 &&
        playerPosition.y >= circle.y - 25 &&
        playerPosition.y <= circle.y + 25
      ) {
        removeCircleFromArray(circles, circle, createParticles);
      }
    });

    spawnBlackCircles(p, circles, playerPosition);
    circles = limitBlackCircles(circles, 10);
  } catch (error) {
    console.error('Error in checkAndAddBlackCircles:', error);
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

export function spawnBlackCircles(
  p: p5,
  circles: Circle[],
  playerPosition: Position
) {
  try {
    const spawnRadius = 200; // Radius around the player where new circles can spawn
    const numCirclesToSpawn = 5; // Number of circles to spawn each time
    const initialSpawnRadius = 100; // Radius around the initial player spawn where no circles should spawn

    for (let i = 0; i < numCirclesToSpawn; i++) {
      let x, y;
      do {
        const angle = p.random(p.TWO_PI);
        const distance = p.random(spawnRadius);
        x = playerPosition.x + distance * p.cos(angle);
        y = playerPosition.y + distance * p.sin(angle);
      } while (p.dist(x, y, playerPosition.x, playerPosition.y) < initialSpawnRadius);

      circles.push({ x, y, opacity: 255 });
    }

    circles = limitBlackCircles(circles, 10);
  } catch (error) {
    console.error('Error in spawnBlackCircles:', error);
  }
}

export function limitBlackCircles(circles: Circle[], maxCircles: number): Circle[] {
  if (circles.length > maxCircles) {
    return circles.slice(0, maxCircles);
  }
  return circles;
}

export function spawnBlackCircleOutsideView(
  p: p5,
  playerPosition: Position,
  playerVelocity: Velocity
): Circle {
  const edge = determineEdge(playerPosition, playerVelocity);
  let newCircle;
  switch (edge) {
    case 'right':
      newCircle = { x: p.width + 50, y: p.random(p.height), opacity: 255 };
      break;
    case 'left':
      newCircle = { x: -50, y: p.random(p.height), opacity: 255 };
      break;
    case 'bottom':
      newCircle = { x: p.random(p.width), y: p.height + 50, opacity: 255 };
      break;
    case 'top':
      newCircle = { x: p.random(p.width), y: -50, opacity: 255 };
      break;
    default:
      newCircle = { x: p.random(p.width), y: p.random(p.height), opacity: 255 };
  }
  return newCircle;
}

export function removeCircleFromArray(circles: Circle[], circle: Circle, createParticles: (circle: Circle) => Particle[]): void {
  const index = circles.indexOf(circle);
  if (index !== -1) {
    circles.splice(index, 1);
    const particles = createParticles(circle);
    // Add particles to the game (assuming there's a global particles array)
    // particlesArray.push(...particles);
  }

  circles = limitBlackCircles(circles, 10);
}
