// ==========================================
// DrDer-Super — أزرار التحكم باللمس
// ==========================================

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) 
    || ('ontouchstart' in window && window.innerWidth < 900);
}

function createTouchControls() {
  if (!isMobileDevice()) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'touchControls';
  wrapper.innerHTML = `
    <div id="touchLeft" class="touch-btn">⬅️</div>
    <div id="touchRight" class="touch-btn">➡️</div>
    <div id="touchJump" class="touch-btn jump">⬆️</div>
  `;
  document.body.appendChild(wrapper);

  const style = document.createElement('style');
  style.textContent = `
    #touchControls {
      position: fixed;
      bottom: 20px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 50;
      pointer-events: none;
    }
    .touch-btn {
      width: 70px;
      height: 70px;
      background: rgba(255,255,255,0.3);
      border: 3px solid rgba(255,255,255,0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      user-select: none;
      pointer-events: auto;
      touch-action: none;
    }
    .touch-btn.jump {
      background: rgba(214,40,40,0.5);
      border-color: rgba(214,40,40,0.8);
    }
    .touch-btn:active {
      background: rgba(255,255,255,0.6);
    }
    #touchLeft, #touchRight {
      display: flex;
      gap: 15px;
    }
    canvas {
      max-width: 95vw;
      height: auto;
    }
  `;
  document.head.appendChild(style);

  const bindBtn = (id, keyCode) => {
    const btn = document.getElementById(id);
    const press = e => { e.preventDefault(); keys[keyCode] = true; };
    const release = e => { e.preventDefault(); keys[keyCode] = false; };
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
  };

  bindBtn('touchLeft', 'ArrowLeft');
  bindBtn('touchRight', 'ArrowRight');
  bindBtn('touchJump', 'Space');
}

// نشغّل الأزرار بس اللاعب يضغط ابدأ اللعب
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', createTouchControls);
  }
});
