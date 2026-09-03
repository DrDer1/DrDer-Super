// ==========================================
// DrDer-Super — محرك اللعبة
// ==========================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const coinsEl = document.getElementById('coins');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const totalLevelsEl = document.getElementById('totalLevels');
const msgEl = document.getElementById('msg');
const uiEl = document.getElementById('ui');
const gameWrapperEl = document.getElementById('gameWrapper');
const hintEl = document.getElementById('hint');
const startScreenEl = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

const GRAVITY = 0.6;
const FRICTION = 0.8;

let keys = {};
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
});
document.addEventListener('keyup', e => keys[e.code] = false);

let coins = 0;
let lives = 3;
let levelIndex = 1; // 1 -> TOTAL_LEVELS
let level = null;
let player, camera;
let gameState = 'idle'; // idle, playing, won, dead, gameover, finished

totalLevelsEl.textContent = TOTAL_LEVELS;

startBtn.addEventListener('click', () => {
  startScreenEl.style.display = 'none';
  uiEl.classList.add('visible');
  gameWrapperEl.classList.add('visible');
  hintEl.classList.add('visible');
  coins = 0;
  lives = 3;
  coinsEl.textContent = coins;
  livesEl.textContent = lives;
  loadLevel(1);
  requestAnimationFrame(loop);
});

function resetPlayer() {
  player = {
    x: level.start.x, y: level.start.y,
    w: 30, h: 40,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    invincible: 0
  };
  camera = { x: 0 };
}

function loadLevel(num) {
  levelIndex = num;
  level = JSON.parse(JSON.stringify(getLevel(num)));
  levelEl.textContent = num;
  resetPlayer();
  gameState = 'playing';
  msgEl.style.display = 'none';
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function update() {
  if (gameState !== 'playing') {
    if (keys['Enter']) {
      if (gameState === 'won') {
        if (levelIndex + 1 <= TOTAL_LEVELS) {
          loadLevel(levelIndex + 1);
        } else {
          gameState = 'finished';
          msgEl.textContent = '🏆 أنهيت DrDer-Super بكل مراحلها! اضغط Enter للعب من جديد';
          msgEl.style.display = 'block';
        }
      } else if (gameState === 'gameover' || gameState === 'finished') {
        coins = 0; lives = 3;
        coinsEl.textContent = coins; livesEl.textContent = lives;
        loadLevel(1);
      }
    }
    return;
  }

  if (keys['ArrowRight']) { player.vx += 0.8; player.facing = 1; }
  if (keys['ArrowLeft']) { player.vx -= 0.8; player.facing = -1; }
  player.vx *= FRICTION;
  if (Math.abs(player.vx) > 7) player.vx = 7 * Math.sign(player.vx);

  if ((keys['Space'] || keys['ArrowUp']) && player.onGround) {
    player.vy = -13.5;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  if (player.vy > 15) player.vy = 15;

  // X collision
  player.x += player.vx;
  for (const p of level.platforms) {
    if (rectsOverlap(player, p)) {
      if (player.vx > 0) player.x = p.x - player.w;
      else if (player.vx < 0) player.x = p.x + p.w;
      player.vx = 0;
    }
  }
  if (player.x < 0) player.x = 0;

  // Y collision
  player.onGround = false;
  player.y += player.vy;
  for (const p of level.platforms) {
    if (rectsOverlap(player, p)) {
      if (player.vy > 0) { player.y = p.y - player.h; player.onGround = true; }
      else if (player.vy < 0) { player.y = p.y + p.h; }
      player.vy = 0;
    }
  }

  if (player.y > 500) loseLife();

  // coins
  level.coins = level.coins.filter(c => {
    const cRect = { x: c.x, y: c.y, w: 20, h: 20 };
    if (rectsOverlap(player, cRect)) {
      coins++;
      coinsEl.textContent = coins;
      return false;
    }
    return true;
  });

  // enemies
  if (player.invincible > 0) player.invincible--;
  for (const e of level.enemies) {
    e.x += e.dir * 2;
    if (e.x < e.range[0] || e.x > e.range[1]) e.dir *= -1;
    const eRect = { x: e.x, y: e.y, w: 30, h: 30 };
    if (rectsOverlap(player, eRect)) {
      if (player.vy > 2 && player.y + player.h - e.y < 20) {
        e.dead = true;
        player.vy = -9;
      } else if (player.invincible <= 0) {
        loseLife();
      }
    }
  }
  level.enemies = level.enemies.filter(e => !e.dead);

  // goal
  const goalRect = { x: level.goal.x, y: level.goal.y, w: 20, h: 80 };
  if (rectsOverlap(player, goalRect)) {
    gameState = 'won';
    msgEl.textContent = levelIndex < TOTAL_LEVELS
      ? `🎉 أتممت المرحلة ${levelIndex}! اضغط Enter للمرحلة التالية`
      : '🎉 هذه آخر مرحلة! اضغط Enter لإنهاء المغامرة';
    msgEl.style.display = 'block';
  }

  camera.x = player.x - 300;
  if (camera.x < 0) camera.x = 0;
  if (camera.x > level.width - canvas.width) camera.x = level.width - canvas.width;
}

function loseLife() {
  lives--;
  livesEl.textContent = lives;
  if (lives <= 0) {
    gameState = 'gameover';
    msgEl.textContent = '💀 انتهت المحاولات! اضغط Enter لإعادة البدء من المرحلة الأولى';
    msgEl.style.display = 'block';
  } else {
    player.invincible = 60;
    player.x = level.start.x;
    player.y = level.start.y;
    player.vx = 0; player.vy = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 6; i++) {
    const hx = (i * 400 - camera.x * 0.3) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(hx, 420, 90, Math.PI, 0);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(-camera.x, 0);

  for (const p of level.platforms) {
    const grad = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
    grad.addColorStop(0, '#7cbf3f');
    grad.addColorStop(0.25, '#7cbf3f');
    grad.addColorStop(0.25, '#8b5a2b');
    grad.addColorStop(1, '#6b4423');
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = '#4a2f18';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }

  for (const c of level.coins) {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(c.x + 10, c.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a400';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (const e of level.enemies) {
    ctx.fillStyle = '#8b3a3a';
    ctx.beginPath();
    ctx.ellipse(e.x + 15, e.y + 18, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5c2020';
    ctx.beginPath();
    ctx.arc(e.x + 15, e.y + 8, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(e.x + 10, e.y + 10, 3, 0, Math.PI * 2);
    ctx.arc(e.x + 20, e.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#888';
  ctx.fillRect(level.goal.x + 8, level.goal.y - 20, 4, 100);
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(level.goal.x + 12, level.goal.y - 20);
  ctx.lineTo(level.goal.x + 45, level.goal.y - 5);
  ctx.lineTo(level.goal.x + 12, level.goal.y + 10);
  ctx.fill();

  if (player.invincible <= 0 || Math.floor(player.invincible / 4) % 2 === 0) {
    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    if (player.facing < 0) ctx.scale(-1, 1);
    ctx.fillStyle = '#3a6ea5';
    ctx.fillRect(-15, 0, 30, 20);
    ctx.fillStyle = '#f4c17a';
    ctx.fillRect(-13, -18, 26, 18);
    ctx.fillStyle = '#d62828';
    ctx.fillRect(-15, -22, 30, 8);
    ctx.fillRect(2, -18, 14, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(4, -12, 4, 4);
    ctx.fillStyle = '#264653';
    ctx.fillRect(-13, 18, 10, 12);
    ctx.fillRect(3, 18, 10, 12);
    ctx.restore();
  }

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
