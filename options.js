document.addEventListener('DOMContentLoaded', () => {
  const copyToggle = document.getElementById('copyToggle');
  const shortcutBtn = document.getElementById('shortcutBtn');
  const toast = document.getElementById('toast');

  // Load current settings
  chrome.storage.local.get({ copyToClipboard: true }, (data) => {
    copyToggle.checked = data.copyToClipboard;
  });

  // Save settings when toggled
  copyToggle.addEventListener('change', () => {
    const value = copyToggle.checked;
    chrome.storage.local.set({ copyToClipboard: value }, () => {
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
