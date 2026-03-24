// Navbar : fond sombre au scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Menu burger mobile
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Fermer le menu au clic sur un lien
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Animation au scroll (reveal)
const revealElements = document.querySelectorAll(
  '.about-card, .category-card, .step-card, .contact-card, .section-header'
);

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => observer.observe(el));

// =============================================
// SLIDER AVIS CLIENTS
// =============================================
async function initSlider() {
  const track = document.getElementById('slider-track');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (!track) return;

  // Chargement des avis depuis le JSON
  let avis = [];
  try {
    const res = await fetch('data/avis.json');
    avis = await res.json();
  } catch (e) {
    console.warn('Impossible de charger les avis.');
    return;
  }

  // Déterminer combien de cartes visibles selon la largeur
  function getVisible() {
    if (window.innerWidth <= 580) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  // Génération des cartes
  avis.forEach(avis => {
    const initiale = avis.auteur.charAt(0).toUpperCase();
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-quote">"</div>
      <p class="review-text">${avis.texte}</p>
      <div class="review-stars">★★★★★</div>
      <div class="review-footer">
        <div class="review-avatar">${initiale}</div>
        <div class="review-meta">
          <span class="review-author">${avis.auteur}</span>
          <span class="review-date">${avis.date}</span>
        </div>
      </div>
    `;
    track.appendChild(card);
  });

  let current = 0;
  let autoplayTimer;

  // Génération des dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const visible = getVisible();
    const total = Math.ceil(avis.length / visible);
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Avis ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    const visible = getVisible();
    const total = Math.ceil(avis.length / visible);
    current = (index + total) % total;

    // Largeur d'une carte + gap
    const cardWidth = track.children[0].offsetWidth + 28;
    track.style.transform = `translateX(-${current * visible * cardWidth}px)`;

    // Mise à jour des dots
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });

    resetAutoplay();
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      const visible = getVisible();
      const total = Math.ceil(avis.length / visible);
      goTo((current + 1) % total);
    }, 4000);
  }

  prevBtn.addEventListener('click', () => {
    const visible = getVisible();
    const total = Math.ceil(avis.length / visible);
    goTo(current - 1);
  });

  nextBtn.addEventListener('click', () => {
    const visible = getVisible();
    const total = Math.ceil(avis.length / visible);
    goTo(current + 1);
  });

  // Swipe tactile mobile
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const visible = getVisible();
      const total = Math.ceil(avis.length / visible);
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  });

  // Recalcul au resize
  window.addEventListener('resize', () => {
    buildDots();
    current = 0;
    track.style.transform = 'translateX(0)';
    resetAutoplay();
  });

  buildDots();
  resetAutoplay();
}

initSlider();
