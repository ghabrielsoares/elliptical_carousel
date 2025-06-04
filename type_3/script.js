const circles = [
  document.getElementById('circle0'),
  document.getElementById('circle1'),
  document.getElementById('circle2'),
];

let index = 0;
let isAnimating = false;

// 📌 novas posições baseadas no layout desejado
const positions = {
  left:   { x: 0,   y: 0 },     // canto superior esquerdo
  center: { x: 130, y: 130 },   // abaixo das setas
  right:  { x: 260, y: 0 },     // canto superior direito
};

function setPos(circle, pos) {
  circle.style.left = pos.x + "px";
  circle.style.top  = pos.y + "px";
}

function getPositions() {
  const order = [
    (index + 2) % 3, // esquerda
    index,           // centro
    (index + 1) % 3  // direita
  ];

  return {
    left: circles[order[0]],
    center: circles[order[1]],
    right: circles[order[2]]
  };
}

function animateElipse(circle, from, to, duration = 500) {
  return new Promise((resolve) => {
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      let progress = (ts - start) / duration;
      if (progress > 1) progress = 1;

      const angle = Math.PI * (1 - progress);
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress + 30 * Math.sin(angle);

      circle.style.left = x + "px";
      circle.style.top = y + "px";

      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }

    requestAnimationFrame(step);
  });
}

function animateLinear(circle, from, to, duration = 500) {
  return new Promise((resolve) => {
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      let progress = (ts - start) / duration;
      if (progress > 1) progress = 1;

      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;

      circle.style.left = x + "px";
      circle.style.top = y + "px";

      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }

    requestAnimationFrame(step);
  });
}

function fadeTransition(element, newPos, duration = 300) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = 0;

    setTimeout(() => {
      setPos(element, newPos);
      element.style.opacity = 1;

      setTimeout(() => {
        element.style.transition = "";
        resolve();
      }, duration);
    }, duration);
  });
}

async function rotate(dir) {
  if (isAnimating) return;
  isAnimating = true;

  const oldPos = getPositions();

  index = (index + dir + 3) % 3;

  const newPos = getPositions();

  // novo círculo central vindo de um dos lados
  setPos(newPos.center, dir === 1 ? positions.right : positions.left);

  await Promise.all([
    animateElipse(
      newPos.center,
      dir === 1 ? positions.right : positions.left,
      positions.center
    ),
    animateLinear(
      oldPos.center,
      positions.center,
      dir === 1 ? positions.left : positions.right
    ),
    fadeTransition(
      dir === 1 ? oldPos.left : oldPos.right,
      dir === 1 ? positions.right : positions.left
    )
  ]);

  isAnimating = false;
}

function init() {
  const pos = getPositions();
  setPos(pos.left, positions.left);
  setPos(pos.center, positions.center);
  setPos(pos.right, positions.right);
}

init();
