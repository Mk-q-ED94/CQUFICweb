/**
 * CQU FIC — Wavy Lines Background v2
 * 满屏竖向 SVG 线条 + 鼠标/触摸弹性排斥物理效果
 * v2: 支持横竖屏动态调整 / 安全区感知 / 方向变化重建
 */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 根据当前尺寸决定参数（竖屏/横屏自适应）──
  function getCfg() {
    const portrait = window.innerHeight > window.innerWidth;
    const narrow   = window.innerWidth <= 480;
    return {
      lineSpacing : narrow ? 32 : (portrait ? 26 : 22),
      segHeight   : portrait ? 20 : 18,
      spring      : 0.055,
      damping     : 0.88,
      mouseRadius : portrait ? 130 : 160,
      mouseStrength: portrait ? 60  : 72,
      colors: [
        'rgba(30,  79, 161, 0.20)',
        'rgba(42, 101, 199, 0.16)',
        'rgba(96, 165, 250, 0.13)',
        'rgba(30,  79, 161, 0.10)',
        'rgba(21,  58, 122, 0.18)',
      ],
      strokeWidth: narrow ? 1.0 : 1.2,
    };
  }

  // ── SVG 层 ──────────────────────────────────────
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;' +
    'pointer-events:none;overflow:visible;';
  document.body.prepend(svg);

  // ── 底色背景 ────────────────────────────────────
  const bg = document.createElement('div');
  bg.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;' +
    'background:linear-gradient(160deg,#edf2fb 0%,#e2eaf5 50%,#dde7f4 100%);' +
    'pointer-events:none;';
  document.body.prepend(bg);

  // ── 状态 ────────────────────────────────────────
  let lines = [], W = 0, H = 0;
  let mx = -9999, my = -9999;
  let raf, cfg = getCfg();

  // ── 建线 ────────────────────────────────────────
  function buildLines() {
    svg.innerHTML = '';
    lines = [];
    cfg = getCfg();

    const count = Math.ceil(W / cfg.lineSpacing) + 1;
    const segs  = Math.ceil(H / cfg.segHeight)  + 2;

    for (let i = 0; i < count; i++) {
      const x0    = i * cfg.lineSpacing;
      const color = cfg.colors[i % cfg.colors.length];
      const pts   = [];

      for (let j = 0; j <= segs; j++) {
        pts.push({ y: j * cfg.segHeight - cfg.segHeight, x0, x: x0, vx: 0 });
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', cfg.strokeWidth);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
      lines.push({ pts, path });
    }
  }

  // ── Catmull-Rom → 贝塞尔路径 ────────────────────
  function buildD(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)},` +
               `${cp2x.toFixed(2)} ${cp2y.toFixed(2)},` +
               `${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  // ── 物理 tick ───────────────────────────────────
  function tick() {
    const r2 = cfg.mouseRadius * cfg.mouseRadius;

    for (const line of lines) {
      let dirty = false;
      for (const pt of line.pts) {
        const dx = pt.x - mx, dy = pt.y - my;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < r2 && dist2 > 0.001) {
          const dist    = Math.sqrt(dist2);
          const falloff = 1 - dist / cfg.mouseRadius;
          pt.vx += (dx / dist) * falloff * falloff * cfg.mouseStrength * 0.15;
        }

        pt.vx += (pt.x0 - pt.x) * cfg.spring;
        pt.vx *= cfg.damping;
        pt.x  += pt.vx;

        if (Math.abs(pt.vx) > 0.01 || Math.abs(pt.x - pt.x0) > 0.01) dirty = true;
      }
      if (dirty || !REDUCED) line.path.setAttribute('d', buildD(line.pts));
    }

    raf = requestAnimationFrame(tick);
  }

  // ── resize（含方向变化）─────────────────────────
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = window.innerWidth;
      H = window.innerHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      buildLines(); // 重建，自动读取新方向参数
    }, 100);
  }

  // ── 输入事件 ────────────────────────────────────
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });
  window.addEventListener('touchmove', e => {
    mx = e.touches[0].clientX;
    my = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend',  () => { mx = -9999; my = -9999; }, { passive: true });

  // ── 横竖屏切换（orientationchange + resize 双保险）
  window.addEventListener('orientationchange', () => { onResize(); }, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  // ── 可见性优化 ──────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (!REDUCED)   { raf = requestAnimationFrame(tick); }
  });

  // ── 启动 ────────────────────────────────────────
  W = window.innerWidth;
  H = window.innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  buildLines();
  if (!REDUCED) raf = requestAnimationFrame(tick);

})();
