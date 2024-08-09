import { useEffect } from 'react';

function Game() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p5 = require('p5');

      let blackHole;
      let astronaut;
      let trash = [];
      let gold = [];
      let pullStrength = 0.01;

      const sketch = (p) => {
        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
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
            p.fill(0);
            p.ellipse(this.x, this.y, 100, 100);
          }
        }

        class Astronaut {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.size = 20;
            this.speed = 2;
          }

          update() {
            let angle = p.atan2(blackHole.y - this.y, blackHole.x - this.x);
            this.x += p.cos(angle) * this.speed;
            this.y += p.sin(angle) * this.speed;
            this.speed += pullStrength;
          }

          display() {
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

      const p5Instance = new p5(sketch);

      return () => {
        p5Instance.remove();
      };
    }
  }, []);

  return null;
}

export default Game;
