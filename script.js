const canvas = document.querySelector("#table"),
  context = canvas.getContext("2d"),
  restart = document.getElementById("reset"),
  hit = new Audio(),
  wall = new Audio(),
  comScore = new Audio(),
  userScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

let level = 2;

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  velocityX: 5,
  velocityY: 5,
  speed: 7,
  color: "dodgerblue",
};

const user = {
  x: 0,
  y: (canvas.height - 100) / 2,
  width: 10,
  height: 80,
  score: 0,
  color: "dodgerblue",
};

const com = {
  x: canvas.width - 10,
  y: (canvas.height - 100) / 2,
  width: 10,
  height: 80,
  score: 0,
  color: "dodgerblue",
};

const net = {
  x: (canvas.width - 2) / 2,
  y: 0,
  width: 0.4,
  height: 7,
  color: "dodgerblue",
};

function drawRect(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, true);
  context.closePath();
  context.fill();
}

canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt) {
  let rect = canvas.getBoundingClientRect();

  user.y = evt.clientY - rect.top - user.height / 2;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = -ball.velocityX;
  ball.speed = ball.speed;
}

function resetPaddle() {
  com.x = canvas.width - 10;
  com.y = (canvas.height - 100) / 2;
  user.x = 0;
  user.y = (canvas.height - 100) / 2;
}

function drawNet() {
  for (let i = 0; i <= canvas.height; i += 16) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

function drawText(text, x, y) {
  context.fillStyle = "dodgerblue";
  context.font = "lighter 30px serif";
  context.fillText(text, x, y);
}

function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
}

function update(level) {
  level = this.level;
  if (ball.x - ball.radius < 0) {
    com.score++;
    comScore.play();
    resetBall();
    ball.speed += 0.1;
    resetPaddle();
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    userScore.play();
    resetBall();
    ball.speed += 0.1;
    resetPaddle();
  }

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // computer plays for itself, and we must be able to beat it
  // simple AI
  com.y += (ball.y - (com.y + com.height / 2)) * 0.1;

  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.velocityY = -ball.velocityY;
    wall.play();
  }

  let player = ball.x + ball.radius < canvas.width / 2 ? user : com;

  if (collision(ball, player)) {
    hit.play();
    let collidePoint = ball.y - (player.y + player.height / 2);
    // normalize the value of collidePoint, we need to get numbers between -1 and 1.
    // -player.height/2 < collide Point < player.height/2
    collidePoint = collidePoint / (player.height / 2);

    // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
    // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
    // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
    // Math.PI/4 = 45degrees
    let angleRad = (Math.PI / 4) * collidePoint;

    // change the X and Y velocity direction
    let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    if (level == 2 || level == 3) {
      ball.speed += 0.1;
    }
  }
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#000"); //Clear Canvas

  drawText(user.score, canvas.width / 4, canvas.height / 10); //User Score

  drawText(com.score, (3 * canvas.width) / 4, canvas.height / 10); //Com Score

  drawNet();

  drawRect(user.x, user.y, user.width, user.height, user.color); //User Paddle

  drawRect(com.x, com.y, com.width, com.height, com.color); //Com Paddle

  drawArc(ball.x, ball.y, ball.radius, ball.color);
}

let fps = 50; //Frame Per Second

setInterval(function game() {
  update(2);
  render();
}, 1000 / fps);

function restartGame() {
  resetBall();
  resetPaddle();
  user.score = 0;
  com.score = 0;
}

restart.addEventListener("click", () => {
  restartGame();
  panelRemover();
});

// Panel little animate

const cog = document.querySelector(".fas.fa-cog"),
  x = document.querySelector(".fas.fa-times"),
  panel = document.querySelector(".panel");

function panelRemover() {
  panel.classList.remove("active");
  cog.style.transform = `translateY(0%)`;
  cog.style.opacity = `1`;
}

cog.addEventListener("click", function () {
  panel.classList.add("active");
  cog.style.transform = `translateY(-100%)`;
  cog.style.opacity = `0`;
});

x.addEventListener("click", panelRemover);

// Ligth and Dark theme

const dark = document.querySelector(".dark");
const light = document.querySelector(".light");
const main = document.querySelector("main");

light.addEventListener("click", function () {
  main.classList.add("light-mode");
  main.classList.remove("dark-mode");
  panelRemover();
});

dark.addEventListener("click", function () {
  main.classList.add("dark-mode");
  main.classList.remove("light-mode");
  panelRemover();
});
