const navbar = document.getElementById('navbar');
const toggle = document.getElementById('navbar-toggle');
const menu = document.getElementById('navbar-menu');
const links = document.querySelectorAll('.navbar__link');

// Sombra e navbar mais compacta ao rolar a página
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', onScroll);
onScroll();

// Abrir/fechar menu no mobile
function setMenu(open) {
  menu.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));

// Fecha o menu ao clicar em um link
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// Fecha com a tecla Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

// Marca o link da seção visível como ativo
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);

document.querySelectorAll('main section[id], footer[id]').forEach((section) => observer.observe(section));

// Carrossel de agentes de IA: setas, pontos, rolagem automática e pausa
const agentsTrack = document.querySelector('[data-carousel-track]');

if (agentsTrack) {
  const cards = agentsTrack.querySelectorAll('.agent-card');
  const dotsWrap = document.querySelector('[data-carousel-dots]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const pauseBtn = document.querySelector('[data-carousel-pause]');
  const AUTOPLAY_MS = 5000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let timer = null;
  let pausedByUser = reduceMotion; // quem prefere menos movimento começa com o carrossel parado
  let hovering = false;

  // Distância entre o início de um card e o do próximo
  const step = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : agentsTrack.clientWidth);
  // Quantas posições existem (o último card visível encosta na direita)
  const positions = () => {
    const visible = Math.max(1, Math.floor((agentsTrack.clientWidth + 1) / step()));
    return Math.max(1, cards.length - visible + 1);
  };
  const current = () => Math.round(agentsTrack.scrollLeft / step());

  function goTo(index) {
    const total = positions();
    const target = (index + total) % total; // volta ao início depois do último
    agentsTrack.scrollTo({ left: target * step() });
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < positions(); i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'agents__dot';
      dot.setAttribute('aria-label', `Ir para o agente ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    const index = Math.min(current(), positions() - 1);
    dotsWrap.querySelectorAll('.agents__dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  function restart() {
    clearInterval(timer);
    timer = null;
    if (!pausedByUser && !hovering) timer = setInterval(() => goTo(current() + 1), AUTOPLAY_MS);
  }

  function setPaused(paused) {
    pausedByUser = paused;
    pauseBtn.classList.toggle('is-paused', paused);
    pauseBtn.setAttribute('aria-label', paused ? 'Retomar carrossel' : 'Pausar carrossel');
    restart();
  }

  prevBtn.addEventListener('click', () => { goTo(current() - 1); restart(); });
  nextBtn.addEventListener('click', () => { goTo(current() + 1); restart(); });
  pauseBtn.addEventListener('click', () => setPaused(!pausedByUser));

  // Para enquanto o mouse ou o foco do teclado estiver no carrossel
  const carousel = agentsTrack.closest('.agents');
  carousel.addEventListener('mouseenter', () => { hovering = true; restart(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; restart(); });
  carousel.addEventListener('focusin', () => { hovering = true; restart(); });
  carousel.addEventListener('focusout', () => { hovering = false; restart(); });

  // Setas do teclado quando a trilha está em foco
  agentsTrack.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
  });

  let scrollFrame = null;
  agentsTrack.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateDots);
  });

  new ResizeObserver(buildDots).observe(agentsTrack);
  setPaused(pausedByUser);
}

// Ano atual no rodapé
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
