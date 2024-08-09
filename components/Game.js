import { useState, useEffect } from 'react';
import styles from './Game.module.css';

export default function Game() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loopholes, setLoopholes] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      alert(`Game over! Your score is ${score}`);
    }
  }, [timeLeft, score]);

  const createLoophole = () => {
    const newLoophole = {
      id: Date.now(),
      x: Math.random() * 90,
      y: Math.random() * 90,
    };
    setLoopholes((prevLoopholes) => [...prevLoopholes, newLoophole]);
  };

  const handleLoopholeClick = (id) => {
    setScore((prevScore) => prevScore + 1);
    setLoopholes((prevLoopholes) => prevLoopholes.filter((loophole) => loophole.id !== id));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      const gl = canvas.getContext('webgl');

      if (!gl) {
        console.error('WebGL not supported');
        return;
      }

      const vertexShaderSource = `
        attribute vec4 a_position;
        void main() {
          gl_Position = a_position;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1, 0, 0, 1);
        }
      `;

      const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const createProgram = (gl, vertexShader, fragmentShader) => {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error('Error linking program:', gl.getProgramInfoLog(program));
          gl.deleteProgram(program);
          return null;
        }
        return program;
      };

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      const program = createProgram(gl, vertexShader, fragmentShader);

      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = [
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      return () => {
        document.body.removeChild(canvas);
      };
    }
  }, []);

  return (
    <div className={styles.game}>
      <h1 className={styles.gameTitle}>Loopholes Game</h1>
      <p>Score: {score}</p>
      <p>Time Left: {timeLeft}s</p>
      <button onClick={createLoophole}>Create Loophole</button>
      <div className={styles.loopholesContainer}>
        {loopholes.map((loophole) => (
          <div
            key={loophole.id}
            className={styles.loophole}
            style={{ top: `${loophole.y}%`, left: `${loophole.x}%` }}
            onClick={() => handleLoopholeClick(loophole.id)}
          />
        ))}
      </div>
    </div>
  );
}
