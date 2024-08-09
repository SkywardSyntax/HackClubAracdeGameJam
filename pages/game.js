import { useEffect } from 'react';
import { mat4, mat3, vec3 } from 'gl-matrix';

function Game() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
        varying vec3 v_viewDirection;
        void main() {
          vec4 vertexPosition = u_modelViewMatrix * a_position;
          v_normal = u_normalMatrix * a_normal;
          v_lightDirection = u_lightPosition - vertexPosition.xyz;
          v_viewDirection = -vertexPosition.xyz;
          gl_Position = u_projectionMatrix * vertexPosition;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        varying vec3 v_normal;
        varying vec3 v_lightDirection;
        varying vec3 v_viewDirection;
        uniform vec3 u_lightColor;
        uniform vec3 u_ambientLight;
        void main() {
          vec3 normal = normalize(v_normal);
          vec3 lightDirection = normalize(v_lightDirection);
          vec3 viewDirection = normalize(v_viewDirection);
          float diff = max(dot(normal, lightDirection), 0.0);
          vec3 diffuse = diff * u_lightColor;
          vec3 ambient = u_ambientLight;
          vec3 reflectDirection = reflect(-lightDirection, normal);
          float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
          vec3 specular = spec * u_lightColor;
          vec3 finalColor = ambient + diffuse + specular;
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

      const createSphere = (radius, latitudeBands, longitudeBands) => {
        const positions = [];
        const normals = [];
        const indices = [];

        for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
          const theta = latNumber * Math.PI / latitudeBands;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            const u = 1 - (longNumber / longitudeBands);
            const v = 1 - (latNumber / latitudeBands);

            normals.push(x);
            normals.push(y);
            normals.push(z);
            positions.push(radius * x);
            positions.push(radius * y);
            positions.push(radius * z);
          }
        }

        for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
          for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
          }
        }

        return {
          positions: new Float32Array(positions),
          normals: new Float32Array(normals),
          indices: new Uint16Array(indices),
        };
      };

      const sketch = (gl) => {
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

        const sphere = createSphere(1, 30, 30);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

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

        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
      };

      sketch(gl);

      return () => {
        document.body.removeChild(canvas);
      };
    }
  }, []);

  return null;
}

export default Game;
