(function() {
  // Check if we are on the Akakce search page and have a query
  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = urlParams.get('q');
  if (!urlQuery) return;

  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrimmer);
  } else {
    initTrimmer();
  }

  function initTrimmer() {
    const input = document.getElementById('q');
    if (!input) return;

    // Capture the original text color before making it transparent
    const originalColor = window.getComputedStyle(input).color || '#000000';

    // Synchronize query state across page loads via sessionStorage
    let originalQuery = sessionStorage.getItem('akakce_original_query');
    let currentQuery = sessionStorage.getItem('akakce_current_query');

    // Since we crop from right to left, urlQuery is a prefix of originalQuery
    if (originalQuery && urlQuery && originalQuery.startsWith(urlQuery.trim())) {
      currentQuery = urlQuery.trim();
    } else {
      // New search baseline
      originalQuery = urlQuery.trim();
      currentQuery = urlQuery.trim();
      sessionStorage.setItem('akakce_original_query', originalQuery);
      sessionStorage.setItem('akakce_current_query', currentQuery);
    }

    const endIndex = currentQuery.length;

    // Apply custom transparent class to input (CSS hides the text)
    input.classList.add('akakce-input-transparent');

    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.className = 'akakce-segmented-overlay';

    // Build the interactive character spans
    const spans = [];
    for (let i = 0; i < originalQuery.length; i++) {
      const char = originalQuery[i];
      const span = document.createElement('span');
      span.className = 'akakce-char-span';
      span.innerText = char === ' ' ? '\u00A0' : char; // Non-breaking space for correct layout
      span.dataset.index = i;

      if (i < endIndex) {
        span.classList.add('active');
      } else {
        span.classList.add('deleted');
      }

      // Hover event handlers
      span.addEventListener('mouseenter', () => {
        clearHoverClasses();
        const idx = parseInt(span.dataset.index);
        if (idx < endIndex) {
          // Hovering active: preview deletion of everything from idx to endIndex - 1
          // Mouse left side (0 to idx - 1) remains completely unchanged visually
          for (let j = idx; j < endIndex; j++) {
            spans[j].classList.add('to-delete');
          }
        } else {
          // Hovering deleted: preview restoration of everything from endIndex to idx
          for (let j = endIndex; j <= idx; j++) {
            spans[j].classList.add('to-restore');
          }
        }
      });

      // Click event handler
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(span.dataset.index);
        let newEndIndex = endIndex;

        if (idx < endIndex) {
          // Delete clicked character and everything to its right
          newEndIndex = idx;
        } else {
          // Restore clicked character and everything to its left (up to active section)
          newEndIndex = idx + 1;
        }

        const newQuery = originalQuery.substring(0, newEndIndex).trim();
        if (newQuery) {
          sessionStorage.setItem('akakce_current_query', newQuery);
          input.value = newQuery;
          const form = input.closest('form');
          if (form) {
            form.submit();
          }
        } else {
          // If empty, focus the input to let the user type manually
          input.focus();
        }
      });

      overlay.appendChild(span);
      spans.push(span);
    }

    // Clear hover previews when leaving the overlay
    overlay.addEventListener('mouseleave', clearHoverClasses);

    // Insert overlay into DOM (inside the input's parent container)
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(overlay);

    // Position overlay matching input boundaries
    function positionOverlay() {
      const rect = input.getBoundingClientRect();
      const parentRect = input.offsetParent.getBoundingClientRect();

      overlay.style.left = `${rect.left - parentRect.left}px`;
      overlay.style.top = `${rect.top - parentRect.top}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;

      // Copy exact typography and padding styles
      const styles = window.getComputedStyle(input);
      overlay.style.paddingLeft = styles.paddingLeft;
      overlay.style.paddingRight = styles.paddingRight;
      overlay.style.paddingTop = styles.paddingTop;
      overlay.style.paddingBottom = styles.paddingBottom;
      overlay.style.fontSize = styles.fontSize;
      overlay.style.fontFamily = styles.fontFamily;
      overlay.style.fontWeight = styles.fontWeight;
      overlay.style.lineHeight = styles.lineHeight;
      overlay.style.color = originalColor; // Apply the captured correct color
    }

    // Initial position
    positionOverlay();

    // Re-position on resize or window updates
    window.addEventListener('resize', positionOverlay);

    // Hide/show overlay on focus/blur
    input.addEventListener('focus', () => {
      overlay.style.visibility = 'hidden';
    });
    input.addEventListener('blur', () => {
      setTimeout(() => {
        overlay.style.visibility = 'visible';
        positionOverlay();
      }, 200);
    });

    function clearHoverClasses() {
      spans.forEach(s => {
        s.classList.remove('to-delete', 'to-restore');
      });
    }
  }
})();
