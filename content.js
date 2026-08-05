(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = urlParams.get('q');
  if (!urlQuery) return;

  chrome.storage.local.get({ trimmerEnabled: true }, (data) => {
    if (!data.trimmerEnabled) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  });

  function init() {
    const input = document.getElementById('q');
    if (!input || input.dataset.akakceTrimmer) return;
    input.dataset.akakceTrimmer = '1';

    const query = urlQuery.trim();
    if (!query) return;

    // Capture color before making text transparent
    const textColor = window.getComputedStyle(input).color || '#222';

    // Hide native input text
    input.classList.add('akakce-input-transparent');

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'akakce-segmented-overlay';

    const spans = [];
    for (let i = 0; i < query.length; i++) {
      const span = document.createElement('span');
      span.className = 'akakce-char-span';
      span.textContent = query[i] === ' ' ? '\u00A0' : query[i];
      span.dataset.i = i;

      // Hover: highlight from this char to end (will be deleted)
      span.addEventListener('mouseenter', () => {
        const idx = +span.dataset.i;
        spans.forEach((s, j) => {
          s.classList.toggle('to-delete', j >= idx);
        });
      });

      // Click: submit query trimmed at this char
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = +span.dataset.i;
        const newQuery = query.slice(0, idx).trim();
        if (newQuery) {
          input.value = newQuery;
          const form = input.closest('form');
          if (form) form.submit();
        } else {
          // All deleted — restore input and remove overlay
          overlay.remove();
          input.classList.remove('akakce-input-transparent');
          input.value = '';
          input.focus();
        }
      });

      overlay.appendChild(span);
      spans.push(span);
    }

    overlay.addEventListener('mouseleave', () => {
      spans.forEach(s => s.classList.remove('to-delete'));
    });

    // Mount overlay
    const container = input.parentElement;
    container.style.position = 'relative';
    container.appendChild(overlay);

    // Sync overlay geometry with input
    function position() {
      const iRect = input.getBoundingClientRect();
      const pRect = (input.offsetParent || container).getBoundingClientRect();
      const cs = window.getComputedStyle(input);
      Object.assign(overlay.style, {
        left:          `${iRect.left - pRect.left}px`,
        top:           `${iRect.top  - pRect.top}px`,
        width:         `${iRect.width}px`,
        height:        `${iRect.height}px`,
        paddingLeft:   cs.paddingLeft,
        paddingRight:  cs.paddingRight,
        paddingTop:    cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        fontSize:      cs.fontSize,
        fontFamily:    cs.fontFamily,
        fontWeight:    cs.fontWeight,
        lineHeight:    cs.lineHeight,
        color:         textColor,
      });
    }
    position();
    window.addEventListener('resize', position);

    // Focus → hide overlay (show native input)
    input.addEventListener('focus', () => {
      if (overlay.isConnected) overlay.style.display = 'none';
    });

    // Blur → restore overlay only if input is no longer focused
    input.addEventListener('blur', () => {
      if (!overlay.isConnected) return;
      setTimeout(() => {
        if (!overlay.isConnected) return;
        if (document.activeElement === input) return; // still focused — don't restore
        if (!input.value.trim()) {
          disable();
        } else {
          overlay.style.display = 'flex';
          position();
        }
      }, 150);
    });

    // Any user edit → disable trimmer permanently until page reload
    input.addEventListener('input', disable);

    function disable() {
      window.removeEventListener('resize', position);
      input.removeEventListener('input', disable);
      overlay.remove();
      input.classList.remove('akakce-input-transparent');
    }
  }
})();
