chrome.action.onClicked.addListener(handleClick);

function handleClick(tab) {
  if (tab.url && tab.url.includes("akakce.com")) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractProductTitle
  }).then((results) => {
    let title = '';
    if (results && results[0] && results[0].result) {
      title = results[0].result;
    }

    let targetUrl = 'https://www.akakce.com';
    if (title) {
      targetUrl = 'https://www.akakce.com/arama/?q=' + encodeURIComponent(title);
    }

    chrome.tabs.create({ url: targetUrl });
  }).catch((err) => {
    console.error("Script execution failed:", err);
    chrome.tabs.create({ url: 'https://www.akakce.com' });
  });
}

function extractProductTitle() {
  const brands = {
    amazon: ['#productTitle', 'h1#title', 'h1'],
    hepsiburada: ['h1[data-test-id="title"]', '.product-name h1', 'h1.product-name', 'h1'],
    n11: ['h1.proName', '.proNameHolder h1', 'div.proNameHolder > div > h1', 'h1'],
    trendyol: ['h1.pr-new-br', '.pr-in-w h1', '#product-detail-app h1', 'h1'],
    turkcell: ['.product-detail h1', '#product-detail h1', 'h1'],
    pazarama: ['.product-detail h1', '#app h1', 'h1'],
    pttavm: ['.product-detail h1', '#main h1', 'h1'],
    teknosa: ['#pdp-main h1', '.product-detail h1', 'h1'],
    mediamarkt: ['h1[data-testid="product-title"]', 'h1'],
    gurgencler: ['#maincontent h1', 'h1'],
    ciceksepeti: ['h1.js-product-title', '.js-product-title h1', 'h1'],
    migros: ['sm-product-detail-page h3', 'sm-product-detail-page h1', 'h1', 'h3']
  };

  const host = window.__mockHost || window.location.host;
  let title = '';

  // 1. Try brand-specific selectors
  const matchedBrand = Object.keys(brands).find(brand => host.includes(brand));
  if (matchedBrand) {
    const selectors = brands[matchedBrand];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText || element.textContent;
        if (text && text.trim()) {
          title = text.trim();
          break;
        }
      }
    }
  }

  // 2. Fallback: Generic Meta Tags
  if (!title) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (ogTitle && ogTitle.trim()) {
      title = ogTitle.trim();
    }
  }
  if (!title) {
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    if (twitterTitle && twitterTitle.trim()) {
      title = twitterTitle.trim();
    }
  }
  if (!title) {
    const metaTitle = document.querySelector('meta[name="title"]')?.getAttribute('content');
    if (metaTitle && metaTitle.trim()) {
      title = metaTitle.trim();
    }
  }

  // 3. Fallback: JSON-LD Product Name
  if (!title) {
    try {
      const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
      for (const element of jsonLdElements) {
        const text = element.textContent || element.innerText;
        if (text) {
          const data = JSON.parse(text);
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            const graph = item['@graph'] || [item];
            for (const subItem of graph) {
              if (subItem && (subItem['@type'] === 'Product' || subItem['@type']?.includes('Product'))) {
                if (subItem.name) {
                  title = subItem.name.trim();
                  break;
                }
              }
            }
            if (title) break;
          }
        }
        if (title) break;
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }

  // 4. Fallback: First H1
  if (!title) {
    const h1 = document.querySelector('h1');
    if (h1) {
      const text = h1.innerText || h1.textContent;
      if (text && text.trim()) {
        title = text.trim();
      }
    }
  }

  // 5. Fallback: Page Document Title
  if (!title) {
    title = document.title ? document.title.trim() : '';
  }

  // Clean title: remove brand suffixes and other common suffixes
  if (title) {
    // 1. Clean dynamic domain name suffix
    const domainParts = host.split('.');
    if (domainParts.length >= 2) {
      const tlds = ['com', 'net', 'org', 'gov', 'edu', 'com.tr', 'co.uk', 'gov.tr', 'org.tr'];
      let domainName = '';
      if (domainParts.length === 2) {
        domainName = domainParts[0];
      } else if (domainParts.length >= 3) {
        const lastTwo = domainParts.slice(-2).join('.');
        if (tlds.includes(lastTwo) || lastTwo.endsWith('.tr') || lastTwo.endsWith('.uk')) {
          domainName = domainParts[domainParts.length - 3];
        } else {
          domainName = domainParts[domainParts.length - 2];
        }
      }
      if (domainName && domainName.length > 2) {
        const escapedDomain = domainName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const dynamicSuffixes = [
          new RegExp('\\s*-\\s*' + escapedDomain + '\\s*$', 'i'),
          new RegExp('\\s*\\|\\s*' + escapedDomain + '\\s*$', 'i')
        ];
        for (const suffix of dynamicSuffixes) {
          title = title.replace(suffix, '');
        }
      }
    }

    // 2. Clean static common suffixes
    const suffixes = [
      /\s*-\s*Trendyol\s*$/i,
      /\s*\|\s*Hepsiburada\s*$/i,
      /\s*-\s*Hepsiburada\s*$/i,
      /\s*-\s*n11\s*$/i,
      /\s*-\s*Amazon\.com\.tr\s*$/i,
      /\s*-\s*Pazarama\s*$/i,
      /\s*-\s*PttAVM\s*$/i,
      /\s*-\s*Teknosa\s*$/i,
      /\s*-\s*MediaMarkt\s*$/i,
      /\s*-\s*Gürgençler\s*$/i,
      /\s*-\s*Çiçeksepeti\s*$/i,
      /\s*-\s*Migros\s*$/i,
      /\s*-\s*Akakçe\s*$/i,
      /\s*Fiyatı,\s*Yorumları\s*$/i,
      /\s*Fiyatı\s*$/i,
      /\s*Fiyatları\s*$/i,
      /\s*Satın Al\s*$/i
    ];

    let cleaned = title;
    let modified = true;
    while (modified) {
      modified = false;
      for (const suffix of suffixes) {
        const newVal = cleaned.replace(suffix, '');
        if (newVal !== cleaned) {
          cleaned = newVal;
          modified = true;
        }
      }
    }
    title = cleaned.trim();
  }

  return title;
}
