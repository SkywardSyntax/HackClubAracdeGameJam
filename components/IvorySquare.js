import { useEffect, useState } from 'react';
import { mat4 } from 'gl-matrix';

function IvorySquare() {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [keysPressed, setKeysPressed] = useState({});
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setKeysPressed((prevKeys) => ({ ...prevKeys, [key]: true }));
    };

    const handleKeyUp = (event) => {
      const { key } = event;
      setKeysPressed((prevKeys) => ({ ...prevKeys, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVelocity((prevVelocity) => {
        let newVelocity = { x: 0, y: 0 };
        if (keysPressed['ArrowUp']) newVelocity.y -= 5;
        if (keysPressed['ArrowDown']) newVelocity.y += 5;
        if (keysPressed['ArrowLeft']) newVelocity.x -= 5;
        if (keysPressed['ArrowRight']) newVelocity.x += 5;
        return newVelocity;
      });

      setPosition((prevPosition) => ({
        x: prevPosition.x + velocity.x,
        y: prevPosition.y + velocity.y,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [keysPressed, velocity]);

  return (
    <div
      className="ivory-square"
      style={{ left: position.x, top: position.y }}
    ></div>
  );
}

export default IvorySquare;
