const supportsNativeSmoothScroll = CSS.supports('scroll-behavior', 'smooth');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const nav = document.querySelector('nav');
      const navHeight = nav ? nav.offsetHeight : 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;

      if (supportsNativeSmoothScroll) {
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: targetPosition });
      }
    }
  });
});

function isAnimAPISupported() {
  return typeof document.body.animate === 'function';
}

const heroLogo = document.querySelector('.brand-logo-main');

function sparkleBurst(x, y) {
  if (prefersReduced) return;
  if (!isAnimAPISupported()) return;
  const colors = ['#D4AF37', '#F4E8C1', '#FFF', '#D4AF37', '#C39B2D'];
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('div');
    dot.className = 'sparkle';
    const size = 4 + Math.random() * 6;
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    dot.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]};--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;`;
    document.body.appendChild(dot);
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 }
    ], { duration: 600, easing: 'ease-out' }).onfinish = () => dot.remove();
  }
}

function triggerEasterEgg() {
  if (!heroLogo || animating || prefersReduced || !isAnimAPISupported()) return;
  animating = true;
  clearTimeout(autoResetTimer);

  heroLogo.classList.add('logo-squished');

  setTimeout(() => {
    heroLogo.classList.remove('logo-squished');
    heroLogo.classList.add('logo-shot-up');
    const r = heroLogo.getBoundingClientRect();
    sparkleBurst(r.left + r.width/2, r.top + r.height/2);

    setTimeout(() => {
      const vh = window.innerHeight;
      const cloneSize = window.innerWidth < 600 ? 140 : 200;
      const landY = vh - cloneSize - 40;

      const clone = document.createElement('img');
      clone.src = heroLogo.src;
      clone.alt = 'Falling logo animation';
      clone.className = 'falling-logo-clone';
      clone.style.width = cloneSize + 'px';
      document.body.appendChild(clone);

      const fallAnim = clone.animate([
        { top: '-150px', transform: 'translateX(-50%) rotate(0deg)' },
        { top: (vh * 0.35) + 'px', transform: 'translateX(-50%) rotate(1080deg)', offset: 0.3 },
        { top: (vh * 0.65) + 'px', transform: 'translateX(-50%) rotate(2160deg)', offset: 0.55 },
        { top: landY + 'px', transform: 'translateX(-50%) rotate(3240deg)', offset: 1 }
      ], {
        duration: 2800,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      });

      let scrollWobbleTimer = null;
      const onScroll = () => {
        if (!clone.isConnected) {
          window.removeEventListener('scroll', onScroll);
          return;
        }
        if (prefersReduced) return;
        clone.classList.remove('clone-idle');
        clone.classList.add('clone-scroll');
        clearTimeout(scrollWobbleTimer);
        scrollWobbleTimer = setTimeout(() => {
          clone.classList.remove('clone-scroll');
          if (clone.isConnected) clone.classList.add('clone-idle');
        }, 500);
      };

      fallAnim.onfinish = () => {
        fallAnim.cancel();
        clone.style.top = landY + 'px';
        clone.style.transform = 'translateX(-50%)';
        if (!prefersReduced) clone.classList.add('clone-idle');
        window.addEventListener('scroll', onScroll, { passive: true });
        autoResetTimer = setTimeout(() => { animating = false; }, 30000);
      };

      const restoreAction = () => {
        if (!clone.isConnected) return;
        animating = true;
        clearTimeout(autoResetTimer);
        fallAnim.cancel();
        window.removeEventListener('scroll', onScroll);
        clone.classList.remove('clone-idle', 'clone-scroll');

        clone.style.top = landY + 'px';
        clone.style.transform = 'translateX(-50%) rotate(3240deg) scale(1)';

        clone.animate([
          { top: landY + 'px', transform: 'translateX(-50%) rotate(3240deg) scale(1)' },
          { top: (landY + 30) + 'px', transform: 'translateX(-50%) rotate(3240deg) scaleY(0.7) scaleX(1.3)', offset: 0.12 },
          { top: '-200vh', transform: 'translateX(-50%) rotate(3600deg)', offset: 0.35 },
          { top: '-200vh', transform: 'translateX(-50%) rotate(3600deg)', offset: 1 }
        ], {
          duration: 1000,
          easing: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
          fill: 'forwards'
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          clone.remove();
          heroLogo.classList.remove('logo-shot-up');
          heroLogo.classList.add('logo-land-bounce');
          setTimeout(() => {
            heroLogo.classList.remove('logo-land-bounce');
            animating = false;
          }, 800);
        }, 1100);
      };

      clone.addEventListener('click', restoreAction);

    }, 250);
  }, 80);
}

let animating = false;
let autoResetTimer = null;

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
  if (heroLogo && !heroLogo.classList.contains('logo-shot-up') && !prefersReduced) {
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