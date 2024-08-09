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
        attribute vec3 a_normal;
        uniform mat4 u_modelViewMatrix;
        uniform mat4 u_projectionMatrix;
        uniform mat3 u_normalMatrix;
        uniform vec3 u_lightPosition;
        varying vec3 v_normal;
        varying vec3 v_lightDirection;
        void main() {
          vec4 vertexPosition = u_modelViewMatrix * a_position;
          v_normal = u_normalMatrix * a_normal;
          v_lightDirection = u_lightPosition - vertexPosition.xyz;
          gl_Position = u_projectionMatrix * vertexPosition;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        varying vec3 v_normal;
        varying vec3 v_lightDirection;
        uniform vec3 u_lightColor;
        uniform vec3 u_ambientLight;
        uniform sampler2D u_texture;
        void main() {
          vec3 normal = normalize(v_normal);
          vec3 lightDirection = normalize(v_lightDirection);
          float diff = max(dot(normal, lightDirection), 0.0);
          vec3 diffuse = diff * u_lightColor;
          vec3 ambient = u_ambientLight;
          vec4 textureColor = texture2D(u_texture, gl_FragCoord.xy / 512.0);
          vec3 finalColor = (ambient + diffuse) * textureColor.rgb;
          gl_FragColor = vec4(finalColor, 1.0);
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
      const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
      const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
      const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
      const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');
      const lightPositionLocation = gl.getUniformLocation(program, 'u_lightPosition');
      const lightColorLocation = gl.getUniformLocation(program, 'u_lightColor');
      const ambientLightLocation = gl.getUniformLocation(program, 'u_ambientLight');
      const textureLocation = gl.getUniformLocation(program, 'u_texture');

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = [
        -1, -1, 0,
         1, -1, 0,
        -1,  1, 0,
         1,  1, 0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      const normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(normalAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

      const modelViewMatrix = mat4.create();
      const projectionMatrix = mat4.create();
      const normalMatrix = mat3.create();
      mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
      mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
      mat3.normalFromMat4(normalMatrix, modelViewMatrix);

      gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);
      gl.uniform3fv(lightPositionLocation, [1.0, 1.0, 1.0]);
      gl.uniform3fv(lightColorLocation, [1.0, 1.0, 1.0]);
      gl.uniform3fv(ambientLightLocation, [0.2, 0.2, 0.2]);
      gl.uniform1i(textureLocation, 0);

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
