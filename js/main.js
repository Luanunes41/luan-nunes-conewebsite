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

// Alinha a camada de efeitos (.hero__fx) com a imagem de fundo do hero.
// Reproduz o cálculo do "background-size: cover" para o efeito ficar sempre em cima do ícone.
const hero = document.querySelector('.hero');
const heroFx = document.querySelector('.hero__fx');
const HERO_IMG = { width: 1983, height: 793 };

function layoutHeroFx() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  const scale = Math.max(w / HERO_IMG.width, h / HERO_IMG.height);
  const imgW = HERO_IMG.width * scale;
  const imgH = HERO_IMG.height * scale;
  const posX = (parseFloat(getComputedStyle(hero).getPropertyValue('--hero-bg-x')) || 50) / 100;

  heroFx.style.width = `${imgW}px`;
  heroFx.style.height = `${imgH}px`;
  heroFx.style.left = `${(w - imgW) * posX}px`;
  heroFx.style.top = `${(h - imgH) / 2}px`;
}

if (hero && heroFx) {
  new ResizeObserver(layoutHeroFx).observe(hero);
  layoutHeroFx();
}

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

document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
