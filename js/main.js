document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

/* ナビのスクロール状態 */
const hdr = document.getElementById('hdr');
addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 40), { passive: true });

/* スクロール演出 */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function initReveal(){
  const revealItems = document.querySelectorAll('.reveal');

  if (reduceMotion.matches || !('IntersectionObserver' in window)){
    revealItems.forEach((el) => {
      el.style.transitionDelay = '0ms';
      el.classList.add('in');
    });
    return;
  }

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold:.16 });

  revealItems.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });
}

/* プログラムのDAY切替 */
function initDayTabs(){
  const tabs = Array.from(document.querySelectorAll('.day-tab'));
  const panels = Array.from(document.querySelectorAll('.timeline'));

  if (!tabs.length || !panels.length) return;

  const activateTab = (tab, setFocus = false) => {
    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.day === tab.dataset.day;
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });

    if (setFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      const dir = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      event.preventDefault();
      const next = tabs[(index + dir + tabs.length) % tabs.length];
      activateTab(next, true);
    });
  });

  activateTab(tabs.find((tab) => tab.classList.contains('active')) || tabs[0]);
}

/* モバイルナビ */
function initMobileNav(){
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-nav');
  const overlay = document.querySelector('[data-nav-overlay]');
  const media = matchMedia('(max-width: 920px)');

  if (!burger || !nav || !overlay) return;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const getFocusableItems = () => [burger, ...nav.querySelectorAll(focusableSelector)];

  const syncFocusable = () => {
    const isMobile = media.matches;
    const isOpen = document.body.classList.contains('nav-open');

    nav.querySelectorAll('a, button').forEach((item) => {
      if (isMobile && !isOpen){
        item.tabIndex = -1;
      } else {
        item.removeAttribute('tabindex');
      }
    });

    if (isMobile && !isOpen){
      nav.setAttribute('aria-hidden', 'true');
    } else {
      nav.removeAttribute('aria-hidden');
    }
  };

  const openNav = () => {
    if (!media.matches) return;
    lastFocused = document.activeElement;
    document.body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'メニューを閉じる');
    overlay.hidden = false;
    syncFocusable();
    const firstLink = nav.querySelector(focusableSelector);
    if (firstLink) firstLink.focus();
  };

  const closeNav = (restoreFocus = true) => {
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'メニューを開く');
    overlay.hidden = true;
    syncFocusable();
    if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function'){
      lastFocused.focus();
    }
  };

  burger.addEventListener('click', () => {
    if (document.body.classList.contains('nav-open')){
      closeNav(false);
    } else {
      openNav();
    }
  });

  overlay.addEventListener('click', () => closeNav());

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && media.matches){
      closeNav(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!document.body.classList.contains('nav-open')) return;

    if (event.key === 'Escape'){
      event.preventDefault();
      closeNav();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = getFocusableItems().filter((item) => item.offsetParent !== null || item === burger);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first){
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last){
      event.preventDefault();
      first.focus();
    }
  });

  media.addEventListener('change', () => closeNav(false));
  syncFocusable();
}

initReveal();
initDayTabs();
initMobileNav();
