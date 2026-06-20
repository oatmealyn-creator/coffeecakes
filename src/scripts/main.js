const supportsNativeSmoothScroll = CSS.supports('scroll-behavior', 'smooth');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pageFooter = document.querySelector('footer');

if (pageFooter && 'IntersectionObserver' in window) {
  const footerObserver = new IntersectionObserver(([entry]) => {
    document.documentElement.classList.toggle('at-page-end', entry.isIntersecting);
  });

  footerObserver.observe(pageFooter);
}

const revealTargets = [
  '.scrapbook-gallery',
  '.about-text-block',
  '.menu-header-block',
  '.menu-board',
  '.blackboard',
  '.map-frame',
  'footer > *',
];

if (!prefersReduced && 'IntersectionObserver' in window) {
  const elementsToReveal = document.querySelectorAll(revealTargets.join(','));

  elementsToReveal.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -7% 0px',
  });

  elementsToReveal.forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const nav = document.querySelector('nav');
      const navHeight = nav ? nav.offsetHeight : 0;
      const scrollTarget = targetId === '#menu'
        ? targetElement.querySelector('.menu-header-block') ?? targetElement
        : targetElement;
      const targetPosition = scrollTarget.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;

      if (supportsNativeSmoothScroll) {
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: targetPosition });
      }
    }
  });
});

const heroLogo = document.querySelector('.brand-logo-main');
let animating = false;
let activeClone = null;

function triggerEasterEgg() {
  if (!heroLogo || animating) return;
  animating = true;
  heroLogo.classList.remove('logo-easter-hint');
  heroLogo.classList.add('logo-launching');

  const clone = document.createElement('img');
  clone.src = heroLogo.currentSrc || heroLogo.src;
  clone.alt = 'Coffee Cakes logo — tap to return to the top';
  clone.width = 1176;
  clone.height = 896;
  clone.className = 'falling-logo-clone logo-falling';
  clone.tabIndex = 0;
  clone.setAttribute('role', 'button');
  document.body.appendChild(clone);
  activeClone = clone;

  clone.addEventListener('animationend', (event) => {
    if (event.animationName !== 'logoFall' && event.animationName !== 'logoFallReduced') return;
    clone.classList.remove('logo-falling');
    clone.classList.add('logo-landed');
  });

  const restoreLogo = () => {
    if (clone !== activeClone || clone.classList.contains('logo-restoring')) return;
    clone.classList.remove('logo-falling', 'logo-landed');
    clone.classList.add('logo-restoring');

    if (prefersReduced) {
      window.scrollTo({ top: 0 });
    } else {
      const startY = window.scrollY;
      const startTime = performance.now();
      const scrollDuration = 850;

      const pullPageUp = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / scrollDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        window.scrollTo({ top: startY * (1 - easedProgress) });
        if (progress < 1) requestAnimationFrame(pullPageUp);
      };

      requestAnimationFrame(pullPageUp);
    }

    setTimeout(() => {
      clone.remove();
      activeClone = null;
      heroLogo.classList.remove('logo-launching');
      heroLogo.classList.add('logo-returning');

      setTimeout(() => {
        heroLogo.classList.remove('logo-returning');
        animating = false;
      }, prefersReduced ? 300 : 500);
    }, prefersReduced ? 300 : 900);
  };

  clone.addEventListener('click', restoreLogo);
  clone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      restoreLogo();
    }
  });
}

if (heroLogo) {
  heroLogo.addEventListener('click', triggerEasterEgg);
  heroLogo.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerEasterEgg();
    }
  });
}

setTimeout(() => {
  if (heroLogo && !animating && !prefersReduced) {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inViewport) return;

    heroLogo.classList.add('logo-easter-hint');
    setTimeout(() => heroLogo.classList.remove('logo-easter-hint'), 2600);
  }
}, 2000);

const headerLogo = document.querySelector('.logo-block img');
if (headerLogo) {
  headerLogo.addEventListener('click', function(e) {
    e.preventDefault();
    headerLogo.style.transform = 'scale(1.3) rotate(-20deg)';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      headerLogo.style.transform = '';
    }, 500);
  });

  headerLogo.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      headerLogo.style.transform = 'scale(1.3) rotate(-20deg)';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        headerLogo.style.transform = '';
      }, 500);
    }
  });

  headerLogo.setAttribute('tabindex', '0');
  headerLogo.setAttribute('role', 'button');
  headerLogo.setAttribute('aria-label', 'Scroll to top');
}
