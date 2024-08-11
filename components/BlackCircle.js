import { useEffect, useState } from 'react';

function BlackCircle({ position }) {
  return (
    <div
      className="black-hole"
      style={{ left: position.x, top: position.y }}
    ></div>
  );
}

function generateRandomPosition() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  };
}

function BlackCircles() {
  const [holes, setHoles] = useState(Array.from({ length: 10 }, generateRandomPosition));

  useEffect(() => {
    const interval = setInterval(() => {
      setHoles(Array.from({ length: 10 }, generateRandomPosition));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {holes.map((position, index) => (
        <BlackCircle key={index} position={position} />
      ))}
    </>
  );
}

export default BlackCircles;
