import { useEffect, useState } from 'react';

function IvorySquare() {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setPosition((prevPosition) => {
        let newPosition = { ...prevPosition };
        if (key === 'ArrowUp') newPosition.y -= 10;
        if (key === 'ArrowDown') newPosition.y += 10;
        if (key === 'ArrowLeft') newPosition.x -= 10;
        if (key === 'ArrowRight') newPosition.x += 10;
        return newPosition;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="ivory-square"
      style={{ left: position.x, top: position.y }}
    ></div>
  );
}

export default IvorySquare;
