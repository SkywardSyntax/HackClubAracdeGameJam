import { useEffect } from 'react';
import p5 from 'p5';

function Game() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let blackHole;
      let astronaut;
      let trash = [];
      let gold = [];
      let pullStrength = 0.01;

      let blackHoleShader;
      let astronautShader;

      const sketch = (p) => {
        p.preload = () => {
          blackHoleShader = p.loadShader('shaders/blackHole.vert', 'shaders/blackHole.frag');
          astronautShader = p.loadShader('shaders/astronaut.vert', 'shaders/astronaut.frag');
        };

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
          blackHole = new BlackHole(p.width / 2, p.height / 2);
          astronaut = new Astronaut();
          for (let i = 0; i < 10; i++) {
            trash.push(new Trash());
            gold.push(new Gold());
          }
        };

        p.draw = () => {
          p.background(0);
          blackHole.display();
          astronaut.update();
          astronaut.display();
          for (let t of trash) {
            t.update();
            t.display();
          }
          for (let g of gold) {
            g.update();
            g.display();
          }
          pullStrength += 0.0001;
        };

        class BlackHole {
          constructor(x, y) {
            this.x = x;
            this.y = y;
          }

          display() {
            p.shader(blackHoleShader);
            p.fill(0);
            p.ellipse(this.x, this.y, 100, 100);
          }
        }

        class Astronaut {
          constructor() {
            this.x = 0;
            this.y = 0;
            this.size = 20;
            this.speed = 2;
            this.xSpeed = 0;
            this.ySpeed = 0;
          }

          update() {
            if (p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(65)) {
              this.xSpeed = -2;
            } else if (p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(68)) {
              this.xSpeed = 2;
            } else {
              this.xSpeed = 0;
            }

            if (p.keyIsDown(p.UP_ARROW) || p.keyIsDown(87)) {
              this.ySpeed = -2;
            } else if (p.keyIsDown(p.DOWN_ARROW) || p.keyIsDown(83)) {
              this.ySpeed = 2;
            } else {
              this.ySpeed = 0;
            }

            this.x += this.xSpeed;
            this.y += this.ySpeed;

            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * this.speed;
            this.y += p.sin(angle) * this.speed;
            this.speed += pullStrength;
          }

          display() {
            p.shader(astronautShader);
            p.fill(255);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }

        class Trash {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.size = 10;
          }

          update() {
            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * pullStrength;
            this.y += p.sin(angle) * pullStrength;
          }

          display() {
            p.fill(150);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }

        class Gold {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.size = 10;
          }

          update() {
            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * pullStrength;
            this.y += p.sin(angle) * pullStrength;
          }

          display() {
            p.fill(255, 215, 0);
            p.ellipse(this.x, this.y, this.size, this.size);
          }
        }
      };

      let p5Instance;
      try {
        p5Instance = new p5(sketch);
      } catch (error) {
        console.error('Error creating p5 instance:', error);
        alert('An error occurred while creating the game. Please try again later.');
      }

      return () => {
        try {
          p5Instance.remove();
        } catch (error) {
          console.error('Error removing p5 instance:', error);
          alert('An error occurred while removing the game. Please try again later.');
        }
      };
    }
  }, []);

  return null;
}

export default Game;
