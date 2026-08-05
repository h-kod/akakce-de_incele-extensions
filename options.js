document.addEventListener('DOMContentLoaded', () => {
  const copyToggle = document.getElementById('copyToggle');
  const contextMenuToggle = document.getElementById('contextMenuToggle');
  const trimmerToggle = document.getElementById('trimmerToggle');
  const shortcutBtn = document.getElementById('shortcutBtn');
  const toast = document.getElementById('toast');

  // Load current settings
  chrome.storage.local.get({ copyToClipboard: true, contextMenuEnabled: true, trimmerEnabled: true }, (data) => {
    copyToggle.checked = data.copyToClipboard;
    contextMenuToggle.checked = data.contextMenuEnabled;
    trimmerToggle.checked = data.trimmerEnabled;
  });

  // Save copy setting when toggled
  copyToggle.addEventListener('change', () => {
    chrome.storage.local.set({ copyToClipboard: copyToggle.checked }, () => {
      showToast();
    });
  });

  // Save context menu setting and notify background
  contextMenuToggle.addEventListener('change', () => {
    const enabled = contextMenuToggle.checked;
    chrome.storage.local.set({ contextMenuEnabled: enabled }, () => {
      chrome.runtime.sendMessage({ action: 'updateContextMenu', enabled });
      showToast();
    });
  });

  // Save trimmer setting
  trimmerToggle.addEventListener('change', () => {
    chrome.storage.local.set({ trimmerEnabled: trimmerToggle.checked }, () => {
      showToast();
    });
  });

  // Open Chrome Shortcuts settings
  shortcutBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
});
