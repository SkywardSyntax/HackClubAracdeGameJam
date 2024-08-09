import { useEffect } from 'react';
import { mat4, mat3, vec3 } from 'gl-matrix';
import styles from './Game.module.css';

function GameComponent() {
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
        attribute vec2 a_texCoord;
        uniform mat4 u_modelViewMatrix;
        uniform mat4 u_projectionMatrix;
        uniform mat3 u_normalMatrix;
        uniform vec3 u_lightPosition;
        varying vec3 v_normal;
        varying vec3 v_lightDirection;
        varying vec3 v_viewDirection;
        varying vec2 v_texCoord;
        void main() {
          vec4 vertexPosition = u_modelViewMatrix * a_position;
          v_normal = u_normalMatrix * a_normal;
          v_lightDirection = u_lightPosition - vertexPosition.xyz;
          v_viewDirection = -vertexPosition.xyz;
          v_texCoord = a_texCoord;
          gl_Position = u_projectionMatrix * vertexPosition;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        varying vec3 v_normal;
        varying vec3 v_lightDirection;
        varying vec3 v_viewDirection;
        varying vec2 v_texCoord;
        uniform vec3 u_lightColor;
        uniform vec3 u_ambientLight;
        uniform sampler2D u_texture;
        uniform sampler2D u_normalMap;
        uniform sampler2D u_parallaxMap;
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
          vec4 textureColor = texture2D(u_texture, v_texCoord);
          vec3 finalColor = (ambient + diffuse + specular) * textureColor.rgb;

          // Ambient Occlusion
          float ao = texture2D(u_parallaxMap, v_texCoord).r;
          finalColor *= ao;

          // Light Twisting Effect
          float distance = length(v_texCoord - vec2(0.5, 0.5));
          float twistFactor = 1.0 - smoothstep(0.4, 0.5, distance);
          vec2 twistedTexCoord = vec2(
            cos(twistFactor * 3.14159) * (v_texCoord.x - 0.5) - sin(twistFactor * 3.14159) * (v_texCoord.y - 0.5) + 0.5,
            sin(twistFactor * 3.14159) * (v_texCoord.x - 0.5) + cos(twistFactor * 3.14159) * (v_texCoord.y - 0.5) + 0.5
          );
          vec4 twistedTextureColor = texture2D(u_texture, twistedTexCoord);
          finalColor = mix(finalColor, twistedTextureColor.rgb, twistFactor);

          // Gravitational Lensing
          float lensingFactor = 1.0 / (1.0 + distance * distance);
          finalColor *= lensingFactor;

          // Relativistic Effects
          float relativisticFactor = 1.0 / sqrt(1.0 - distance * distance);
          finalColor *= relativisticFactor;

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

      const sketch = (gl) => {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
        const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
        const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
        const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
        const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');
        const lightPositionLocation = gl.getUniformLocation(program, 'u_lightPosition');
        const lightColorLocation = gl.getUniformLocation(program, 'u_lightColor');
        const ambientLightLocation = gl.getUniformLocation(program, 'u_ambientLight');
        const textureLocation = gl.getUniformLocation(program, 'u_texture');
        const normalMapLocation = gl.getUniformLocation(program, 'u_normalMap');
        const parallaxMapLocation = gl.getUniformLocation(program, 'u_parallaxMap');

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

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const texCoords = [
          0, 0,
          1, 0,
          0, 1,
          1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

        const normalMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, normalMap);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 255, 255]));

        const parallaxMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, parallaxMap);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));

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

        gl.enableVertexAttribArray(texCoordAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

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
        gl.uniform1i(normalMapLocation, 1);
        gl.uniform1i(parallaxMapLocation, 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, normalMap);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, parallaxMap);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      sketch(gl);

      return () => {
        document.body.removeChild(canvas);
      };
    }
  }, []);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.blackHole}></div>
      <div className={styles.blackHoleGlow}></div>
    </div>
  );
}

export default GameComponent;
