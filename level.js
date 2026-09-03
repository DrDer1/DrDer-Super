// ==========================================
// DrDer-Super — مولّد المراحل
// ==========================================

const TOTAL_LEVELS = 30;

// دالة عشوائية بذرة ثابتة عشان كل مرحلة تكون نفسها كل مرة تلعبها
function seededRandom(seed) {
  let value = seed;
  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// توليد مرحلة كاملة بناءً على رقمها (صعوبة تزيد تدريجيًا)
function generateLevel(levelNum) {
  const rand = seededRandom(levelNum * 7919 + 13);
  const difficulty = Math.min(levelNum / TOTAL_LEVELS, 1);

  const segmentCount = 6 + Math.floor(levelNum / 2);
  const platforms = [];
  const coins = [];
  const enemies = [];

  let x = 0;
  let groundY = 410;

  // أرضية البداية
  platforms.push({ x: 0, y: groundY, w: 400, h: 40 });
  x = 400;

  for (let i = 0; i < segmentCount; i++) {
    const gap = 60 + rand() * (60 + difficulty * 80);
    x += gap;

    const platW = 100 + rand() * 150;
    const heightVariation = (rand() - 0.5) * 140 * difficulty;
    let platY = groundY + heightVariation;
    platY = Math.max(200, Math.min(410, platY));

    platforms.push({ x, y: platY, w: platW, h: 40 });

    // عملات فوق المنصة
    const coinCount = 1 + Math.floor(rand() * 3);
    for (let c = 0; c < coinCount; c++) {
      coins.push({
        x: x + 20 + c * 35,
        y: platY - 40
      });
    }

    // منصة عائمة صغيرة أحيانًا
    if (rand() > 0.5 && difficulty > 0.2) {
      const floatW = 80 + rand() * 60;
      const floatX = x + platW / 2 - floatW / 2;
      const floatY = platY - 90 - rand() * 60;
      platforms.push({ x: floatX, y: Math.max(150, floatY), w: floatW, h: 20 });
      coins.push({ x: floatX + floatW / 2 - 10, y: Math.max(150, floatY) - 40 });
    }

    // أعداء بمعدل يزيد مع الصعوبة
    if (rand() < 0.35 + difficulty * 0.4) {
      const eDir = rand() > 0.5 ? 1 : -1;
      const rangeStart = x + 10;
      const rangeEnd = x + platW - 40;
      enemies.push({
        x: x + platW / 2,
        y: platY - 22,
        dir: eDir,
        range: [rangeStart, Math.max(rangeStart + 40, rangeEnd)]
      });
    }

    x += platW;
  }

  // منصة نهائية + علم
  const finalGap = 80 + rand() * 60;
  x += finalGap;
  platforms.push({ x, y: groundY, w: 250, h: 40 });

  const goal = { x: x + 150, y: groundY - 80 };
  const levelWidth = x + 300;

  return {
    width: levelWidth,
    platforms,
    coins,
    enemies,
    goal,
    start: { x: 50, y: 300 },
    levelNumber: levelNum
  };
}

// كاش بسيط عشان ما نعيد التوليد كل مرة
const levelCache = {};
function getLevel(levelNum) {
  if (!levelCache[levelNum]) {
    levelCache[levelNum] = generateLevel(levelNum);
  }
  return levelCache[levelNum];
}
