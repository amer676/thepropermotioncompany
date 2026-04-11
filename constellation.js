/* =============================================
   Dynamic Constellation — 2D Canvas
   Moving stars, constellation lines, mouse
   interaction, shooting stars, nebula glow
   ============================================= */

function initConstellation() {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Find or create canvas
  var canvas = document.getElementById('constellationCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'constellationCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var W = 0, H = 0;
  var mouse = { x: -9999, y: -9999 };
  var scrollY = 0;
  var stars = [];
  var shooters = [];
  var nebulae = [];
  var lastTime = 0;
  var STAR_COUNT = 220;
  var CONNECT_DIST = 140;
  var MOUSE_DIST = 190;
  var MOUSE_PULL = 0.0004;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    var area = W * H;
    STAR_COUNT = area < 500000 ? 100 : area < 1000000 ? 160 : 220;
  }

  function makeStar() {
    var depth = 0.3 + Math.random() * 0.7;
    var isAccent = Math.random() > 0.82;
    var isBlue = !isAccent && Math.random() > 0.9;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35 * depth,
      vy: (Math.random() - 0.5) * 0.35 * depth,
      r: (0.8 + Math.random() * 2.5) * depth,
      baseAlpha: (0.35 + Math.random() * 0.65) * depth,
      alpha: 0,
      depth: depth,
      pulse: Math.random() * Math.PI * 2,
      pulseSpd: 0.004 + Math.random() * 0.012,
      color: isAccent ? '100,180,255' : isBlue ? '160,210,240' : '220,225,240'
    };
  }

  function makeNebula() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      radius: 250 + Math.random() * 400,
      color: Math.random() > 0.5 ? '80,140,255' : '140,180,255',
      alpha: 0.012 + Math.random() * 0.015,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      depth: 0.15 + Math.random() * 0.25
    };
  }

  function makeShooter() {
    var angle = -0.3 + Math.random() * 0.6;
    var speed = 8 + Math.random() * 12;
    return {
      x: Math.random() * W * 0.8 + W * 0.1,
      y: -10,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 3,
      life: 1,
      decay: 0.006 + Math.random() * 0.01,
      len: 60 + Math.random() * 90,
      w: 1.2 + Math.random() * 1.5
    };
  }

  function init() {
    resize();
    stars = [];
    nebulae = [];
    for (var i = 0; i < STAR_COUNT; i++) stars.push(makeStar());
    for (var j = 0; j < 5; j++) nebulae.push(makeNebula());
    scheduleShooter();
  }

  function scheduleShooter() {
    if (reducedMotion) return;
    setTimeout(function () {
      shooters.push(makeShooter());
      scheduleShooter();
    }, 4000 + Math.random() * 8000);
  }

  function update(dt) {
    if (dt > 3) dt = 3;

    for (var n = 0; n < nebulae.length; n++) {
      var nb = nebulae[n];
      nb.x += nb.vx * dt;
      nb.y += nb.vy * dt;
      if (nb.x < -nb.radius) nb.x = W + nb.radius;
      if (nb.x > W + nb.radius) nb.x = -nb.radius;
      if (nb.y < -nb.radius) nb.y = H + nb.radius;
      if (nb.y > H + nb.radius) nb.y = -nb.radius;
    }

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      var dx = mouse.x - s.x;
      var dy = mouse.y - s.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_DIST && dist > 1) {
        var f = MOUSE_PULL * s.depth * dt * (MOUSE_DIST - dist);
        s.vx += (dx / dist) * f;
        s.vy += (dy / dist) * f;
      }

      s.vx *= 0.997;
      s.vy *= 0.997;

      var spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      var max = 0.6 * s.depth;
      if (spd > max) { s.vx = (s.vx / spd) * max; s.vy = (s.vy / spd) * max; }

      if (s.x < -30) s.x = W + 30;
      if (s.x > W + 30) s.x = -30;
      if (s.y < -30) s.y = H + 30;
      if (s.y > H + 30) s.y = -30;

      s.pulse += s.pulseSpd * dt;
      s.alpha = s.baseAlpha * (0.7 + Math.sin(s.pulse) * 0.3);
    }

    for (var k = shooters.length - 1; k >= 0; k--) {
      var sh = shooters[k];
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      sh.life -= sh.decay * dt;
      if (sh.life <= 0 || sh.y > H + 100 || sh.x < -200 || sh.x > W + 200) {
        shooters.splice(k, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var pY = scrollY * 0.25;

    // Nebulae
    for (var n = 0; n < nebulae.length; n++) {
      var nb = nebulae[n];
      var ny = nb.y - pY * nb.depth;
      var g = ctx.createRadialGradient(nb.x, ny, 0, nb.x, ny, nb.radius);
      g.addColorStop(0, 'rgba(' + nb.color + ',' + nb.alpha + ')');
      g.addColorStop(1, 'rgba(' + nb.color + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(nb.x - nb.radius, ny - nb.radius, nb.radius * 2, nb.radius * 2);
    }

    // Constellation lines
    var cd2 = CONNECT_DIST * CONNECT_DIST;
    for (var i = 0; i < stars.length; i++) {
      var a = stars[i];
      var ay = a.y - pY * a.depth;

      for (var j = i + 1; j < stars.length; j++) {
        var b = stars[j];
        var by = b.y - pY * b.depth;
        var ddx = a.x - b.x;
        var ddy = ay - by;
        var d2 = ddx * ddx + ddy * ddy;
        if (d2 < cd2) {
          var d = Math.sqrt(d2);
          var op = (1 - d / CONNECT_DIST) * 0.18 * Math.min(a.alpha, b.alpha);
          if (op > 0.004) {
            ctx.beginPath();
            ctx.moveTo(a.x, ay);
            ctx.lineTo(b.x, by);
            ctx.strokeStyle = 'rgba(100,160,255,' + op + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Mouse connections
      var mdx = mouse.x - a.x;
      var mdy = mouse.y - ay;
      var md2 = mdx * mdx + mdy * mdy;
      if (md2 < MOUSE_DIST * MOUSE_DIST) {
        var md = Math.sqrt(md2);
        var mop = (1 - md / MOUSE_DIST) * 0.3 * a.alpha;
        if (mop > 0.004) {
          ctx.beginPath();
          ctx.moveTo(a.x, ay);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(100,160,255,' + mop + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Stars
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var sy = st.y - pY * st.depth;
      var r = st.r;

      // Glow
      if (r > 1) {
        var sg = ctx.createRadialGradient(st.x, sy, 0, st.x, sy, r * 4);
        sg.addColorStop(0, 'rgba(' + st.color + ',' + (st.alpha * 0.9) + ')');
        sg.addColorStop(0.3, 'rgba(' + st.color + ',' + (st.alpha * 0.25) + ')');
        sg.addColorStop(1, 'rgba(' + st.color + ',0)');
        ctx.fillStyle = sg;
        ctx.fillRect(st.x - r * 4, sy - r * 4, r * 8, r * 8);
      }

      ctx.beginPath();
      ctx.arc(st.x, sy, r, 0, 6.283);
      ctx.fillStyle = 'rgba(' + st.color + ',' + st.alpha + ')';
      ctx.fill();
    }

    // Shooting stars
    for (var k = 0; k < shooters.length; k++) {
      var sh = shooters[k];
      var speed = Math.sqrt(sh.vx * sh.vx + sh.vy * sh.vy);
      if (speed < 0.01) continue;
      var nx = sh.vx / speed;
      var ny2 = sh.vy / speed;
      var tx = sh.x - nx * sh.len;
      var ty = sh.y - ny2 * sh.len;

      var lg = ctx.createLinearGradient(tx, ty, sh.x, sh.y);
      lg.addColorStop(0, 'rgba(200,220,255,0)');
      lg.addColorStop(0.5, 'rgba(200,220,255,' + (sh.life * 0.4) + ')');
      lg.addColorStop(1, 'rgba(255,255,255,' + (sh.life * 0.95) + ')');

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(sh.x, sh.y);
      ctx.strokeStyle = lg;
      ctx.lineWidth = sh.w * sh.life;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sh.x, sh.y, 3 * sh.life, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,' + (sh.life * 0.8) + ')';
      ctx.fill();
    }
  }

  function loop(time) {
    requestAnimationFrame(loop);
    if (!lastTime) { lastTime = time; return; }
    var dt = (time - lastTime) / 16.667;
    lastTime = time;
    update(dt);
    draw();
  }

  window.addEventListener('resize', function () {
    resize();
    if (stars.length < STAR_COUNT * 0.6) init();
  });

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
  }, { passive: true });

  init();
  if (reducedMotion) { draw(); return; }
  requestAnimationFrame(loop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConstellation);
} else {
  initConstellation();
}
