const circles = [
  document.getElementById('circle0'),
  document.getElementById('circle1'),
  document.getElementById('circle2'),
];

let index = 0;
let isAnimating = false;

// 📌 posições fixas dos 3 pontos
const positions = {
  left:   { x: 0,   y: 0 },
  center: { x: 100, y: 130 }, // mova para a esquerda para compensar o novo tamanho
  right:  { x: 260, y: 0 },
};

// aplica a posição em pixels
function setPos(circle, pos) {
  circle.style.left = pos.x + "px";
  circle.style.top  = pos.y + "px";
}

// retorna os círculos nas posições lógicas
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

// animação com arco elíptico + mudança real de tamanho
function animateElipse(circle, from, to, duration = 500, grow = true) {
  return new Promise((resolve) => {
    let start = null;

    const initialSize = grow ? 30 : 90;
    const finalSize   = grow ? 90 : 30;

    function step(ts) {
      if (!start) start = ts;
      let progress = (ts - start) / duration;
      if (progress > 1) progress = 1;

      const angle = Math.PI * (1 - progress);
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress + 60 * Math.sin(angle);

      const size = initialSize + (finalSize - initialSize) * progress;

      circle.style.left = x + "px";
      circle.style.top = y + "px";
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;

      if (progress < 1) requestAnimationFrame(step);
      else {
        circle.style.width = `${finalSize}px`;
        circle.style.height = `${finalSize}px`;
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

// animação linear (usada para o círculo que troca de lado)
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

// fade usado para o terceiro círculo (que troca de lado)
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

// lógica principal de rotação
async function rotate(dir) {
  if (isAnimating) return;
  isAnimating = true;

  const oldPos = getPositions();
  index = (index + dir + 3) % 3;
  const newPos = getPositions();

  // define posição inicial do novo círculo central
  setPos(newPos.center, dir === 1 ? positions.right : positions.left);
  newPos.center.style.width = "30px";
  newPos.center.style.height = "30px";

  await Promise.all([
    animateElipse(
      newPos.center,
      dir === 1 ? positions.right : positions.left,
      positions.center,
      500,
      true  // entra crescendo
    ),
    animateElipse(
      oldPos.center,
      positions.center,
      dir === 1 ? positions.left : positions.right,
      500,
      false // sai diminuindo
    ),
    fadeTransition(
      dir === 1 ? oldPos.left : oldPos.right,
      dir === 1 ? positions.right : positions.left
    )
  ]);

  isAnimating = false;
}

// define a posição e tamanho iniciais dos círculos
function init() {
  const pos = getPositions();
  setPos(pos.left, positions.left);
  setPos(pos.center, positions.center);
  setPos(pos.right, positions.right);

  pos.left.style.width = pos.right.style.width = "30px";
  pos.left.style.height = pos.right.style.height = "30px";
  pos.center.style.width = pos.center.style.height = "90px";
}

init();
