// Utility to render data-tooltip as a single fixed-position tooltip element
// so it isn't clipped by overflow or sticky headers.
export function initFixedTooltips(selector = '.acciones-contenedor [data-tooltip]') {
  if (typeof window === 'undefined' || !document) return () => {};

  let tooltipEl = document.getElementById('app-fixed-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'app-fixed-tooltip';
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.padding = '6px 10px';
    tooltipEl.style.background = '#222';
    tooltipEl.style.color = '#fff';
    tooltipEl.style.borderRadius = '6px';
    tooltipEl.style.fontSize = '13px';
    tooltipEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.opacity = '0';
    tooltipEl.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
    tooltipEl.style.zIndex = '20000';
    tooltipEl.style.whiteSpace = 'nowrap';
    document.body.appendChild(tooltipEl);
  }

  const showTooltip = (target) => {
    if (!target) return;
    const text = target.getAttribute('data-tooltip');
    if (!text) return;
    tooltipEl.textContent = text;
    tooltipEl.style.opacity = '0';
    tooltipEl.style.display = 'block';

    const rect = target.getBoundingClientRect();
    const ttRect = tooltipEl.getBoundingClientRect();

    // default: show above centered
    let left = rect.left + rect.width / 2;
    let top = rect.top - 8; // above with gap

    // adjust horizontally to keep inside viewport
    const halfWidth = ttRect.width / 2 || 80;
    if (left - halfWidth < 8) left = 8 + halfWidth;
    if (left + halfWidth > window.innerWidth - 8) left = window.innerWidth - 8 - halfWidth;

    // if not enough space above, place below
    if (rect.top < 48) {
      top = rect.bottom + 8;
      tooltipEl.style.transform = 'translate(-50%, 0)';
    } else {
      tooltipEl.style.transform = 'translate(-50%, -100%)';
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    // small delay to allow layout then show
    requestAnimationFrame(() => {
      tooltipEl.style.opacity = '1';
    });
  };

  const hideTooltip = () => {
    if (!tooltipEl) return;
    tooltipEl.style.opacity = '0';
    // keep in DOM but hide
  };

  const mouseEnter = (e) => showTooltip(e.currentTarget);
  const mouseLeave = () => hideTooltip();

  const attachListeners = () => {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(n => {
      n.addEventListener('mouseenter', mouseEnter);
      n.addEventListener('mouseleave', mouseLeave);
      n.addEventListener('focus', mouseEnter);
      n.addEventListener('blur', mouseLeave);
    });
  };

  const detachListeners = () => {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(n => {
      n.removeEventListener('mouseenter', mouseEnter);
      n.removeEventListener('mouseleave', mouseLeave);
      n.removeEventListener('focus', mouseEnter);
      n.removeEventListener('blur', mouseLeave);
    });
  };

  const handleScrollResize = () => hideTooltip();

  // initial attach
  attachListeners();
  window.addEventListener('scroll', handleScrollResize, true);
  window.addEventListener('resize', handleScrollResize);

  // observe DOM changes inside table wrapper to reattach listeners
  const tableWrapper = document.querySelector('.tabla-wrapper');
  let observer;
  if (tableWrapper && window.MutationObserver) {
    observer = new MutationObserver(() => {
      detachListeners();
      attachListeners();
    });
    observer.observe(tableWrapper, { childList: true, subtree: true });
  }

  // return cleanup
  return () => {
    detachListeners();
    window.removeEventListener('scroll', handleScrollResize, true);
    window.removeEventListener('resize', handleScrollResize);
    if (observer) observer.disconnect();
    if (tooltipEl && tooltipEl.parentNode) {
      // keep element but hide
      tooltipEl.style.display = 'none';
    }
  };
}

export default initFixedTooltips;
