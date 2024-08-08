import p5 from 'p5';

let blackHole;
let astronaut;
let trash = [];
let gold = [];
let pullStrength = 0.01;

function setup() {
  createCanvas(windowWidth, windowHeight);
  blackHole = new BlackHole(width / 2, height / 2);
  astronaut = new Astronaut();
  for (let i = 0; i < 10; i++) {
    trash.push(new Trash());
    gold.push(new Gold());
  }
}

function draw() {
  background(0);
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
}

class BlackHole {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill(0);
    ellipse(this.x, this.y, 100, 100);
  }
}

class Astronaut {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = 20;
    this.speed = 2;
  }

  update() {
    let angle = atan2(blackHole.y - this.y, blackHole.x - this.x);
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
    this.speed += pullStrength;
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

class Trash {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = 10;
  }

  update() {
    let angle = atan2(blackHole.y - this.y, blackHole.x - this.x);
    this.x += cos(angle) * pullStrength;
    this.y += sin(angle) * pullStrength;
  }

  display() {
    fill(150);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

class Gold {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = 10;
  }

  update() {
    let angle = atan2(blackHole.y - this.y, blackHole.x - this.x);
    this.x += cos(angle) * pullStrength;
    this.y += sin(angle) * pullStrength;
  }

  display() {
    fill(255, 215, 0);
    ellipse(this.x, this.y, this.size, this.size);
  }
}
