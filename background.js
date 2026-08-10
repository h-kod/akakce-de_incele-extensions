chrome.action.onClicked.addListener(handleClick);
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.get({ contextMenuEnabled: true }, (data) => {
    chrome.contextMenus.removeAll(() => {
      if (data.contextMenuEnabled) {
        chrome.contextMenus.create({
          id: "search-akakce",
          title: "Akakçe'de Ara: \"%s\"",
          contexts: ["selection"]
        });
      }
    });
  });
  if (details.reason === 'update' || details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateContextMenu') {
    if (message.enabled) {
      chrome.contextMenus.create({
        id: "search-akakce",
        title: "Akakçe'de Ara: \"%s\"",
        contexts: ["selection"]
      });
    } else {
      chrome.contextMenus.remove("search-akakce");
    }
  }
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-akakce" && info.selectionText) {
    const query = info.selectionText.trim();
    const searchUrl = 'https://www.akakce.com/arama/?q=' + encodeURIComponent(query);
    chrome.tabs.create({ url: searchUrl });
  }
});
chrome.commands.onCommand.addListener((command) => {
  if (command === "search-akakce") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        executeSearchForTab(tabs[0]);
      }
    });
  }
});
chrome.omnibox.onInputEntered.addListener((text) => {
  if (text && text.trim()) {
    const searchUrl = 'https://www.akakce.com/arama/?q=' + encodeURIComponent(text.trim());
    chrome.tabs.create({ url: searchUrl });
  }
});
function handleClick(tab) {
  executeSearchForTab(tab);
}
function executeSearchForTab(tab) {
  if (tab.url && tab.url.includes("akakce.com")) {
    return;
  }
  chrome.storage.local.get({ copyToClipboard: true }, (settings) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractProductTitle,
      args: [settings.copyToClipboard]
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
  });
}
function extractProductTitle(copyToClipboard) {
  const brands = {
    amazon: ['#productTitle', 'h1#title'],
    hepsiburada: ['h1[data-test-id="title"]', '.product-name h1', 'h1.product-name'],
    n11: ['h1.title', 'h1.proName', '.proNameHolder h1', 'div.proNameHolder > div > h1'],
    trendyol: ['h1[data-testid="product-title"]', 'h1.pr-new-br', '.pr-in-w h1', '#product-detail-app h1'],
    turkcell: ['.product-detail h1', '#product-detail h1'],
    pazarama: ['.product-detail h1', '#app h1'],
    pttavm: ['h1[class*="productName"]', '.product-detail h1', '#main h1'],
    teknosa: ['#pdp-main h1', '.product-detail h1'],
    mediamarkt: ['h1[data-testid="product-title"]'],
    gurgencler: ['#maincontent h1'],
    ciceksepeti: ['h1.product__info__title', '.js-product-title', 'h1.js-product-title', '.js-product-title h1'],
    migros: ['sm-product-detail-page h3', 'sm-product-detail-page h1']
  };
  const host = window.__mockHost || window.location.host;
  let title = '';
  const matchedBrand = Object.keys(brands).find(brand => host.includes(brand));
  if (matchedBrand) {
    for (const selector of brands[matchedBrand]) {
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
  if (!title) {
    let looksLikeProductPage = !!matchedBrand;
    let jsonLdTitle = '';
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
                looksLikeProductPage = true;
                if (subItem.name) {
                  jsonLdTitle = subItem.name.trim();
                }
                break;
              }
            }
            if (looksLikeProductPage) break;
          }
        }
        if (looksLikeProductPage) break;
      }
    } catch (e) {}
    if (!looksLikeProductPage) {
      const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content') ||
                     document.querySelector('meta[name="og:type"]')?.getAttribute('content');
      if (ogType && (ogType.toLowerCase().includes('product') || ogType.toLowerCase() === 'og:product')) {
        looksLikeProductPage = true;
      }
    }
    if (looksLikeProductPage) {
      if (jsonLdTitle) {
        title = jsonLdTitle;
      }
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
      if (!title) {
        const h1 = document.querySelector('h1');
        if (h1) {
          const text = h1.innerText || h1.textContent;
          if (text && text.trim()) {
            title = text.trim();
          }
        }
      }
      if (!title) {
        title = document.title ? document.title.trim() : '';
      }
    }
  }
  if (title) {
    title = title.replace(/\s+/g, ' ').trim();
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
      /\s*Fiyat(ı|ları)\s*(,\s*Yorumları|ve\s*Özellikleri)?\s*$/i,
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
  if (title && copyToClipboard) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(title);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = title;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (e) {
    }
  }
  return title;
}
