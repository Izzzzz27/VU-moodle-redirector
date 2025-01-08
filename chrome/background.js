// Track tabs with the refresh count to prevent multiple redirects and refreshes
const processedTabs = new Map();

// Listen for web navigation on the target URL
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    const targetUrl = "https://emokymai.vu.lt/my/";
    const redirectUrl = "https://emokymai.vu.lt/my/index.php?lang=en";

    // Check if the request matches the target URL and the tab has not been processed (refresh count != 1)
    if (details.url === targetUrl) {
      let refreshCount = processedTabs.get(details.tabId) || 0;

      if (refreshCount === 0) {
        // Redirect to the English version and increment the refresh count
        processedTabs.set(details.tabId, refreshCount + 1);
        chrome.tabs.update(details.tabId, { url: redirectUrl });
      }
    }
  },
  {
    url: [{ hostContains: "emokymai.vu.lt", pathPrefix: "/my/" }] // Match the target URL
  }
);

// Prevent infinite refreshes on the English version page
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    const englishUrl = "https://emokymai.vu.lt/my/index.php?lang=en";

    // If the page is the English version and it has been processed only once, reload it
    if (details.url === englishUrl) {
      let refreshCount = processedTabs.get(details.tabId) || 0;

      if (refreshCount === 1) {
        // Refresh the page and update the count to prevent further refreshes
        processedTabs.set(details.tabId, refreshCount + 1);
        chrome.tabs.reload(details.tabId);
      }
    }
  },
  {
    url: [{ urlEquals: "https://emokymai.vu.lt/my/index.php?lang=en" }] // Match the English version
  }
);

// Ensure that once the page is refreshed, it doesn't refresh again (if the count is 2)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url === "https://emokymai.vu.lt/my/index.php?lang=en") {
    let refreshCount = processedTabs.get(tabId) || 0;

    if (refreshCount >= 2) {
      // If the refresh count is 2 or more, prevent further refreshes
      processedTabs.delete(tabId); // Reset the count and prevent further actions
    }
  }
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  processedTabs.delete(tabId); // Remove from processed list when the tab is closed
});

