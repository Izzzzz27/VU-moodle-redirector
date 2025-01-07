// Track tabs that have already been processed
const processedTabs = new Set();

// Listen for web requests to redirect the original URL
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const targetUrl = "https://emokymai.vu.lt/my/";
    const redirectUrl = "https://emokymai.vu.lt/my/index.php?lang=en";

    // If the request matches the target URL, redirect to the English version
    if (details.url === targetUrl) {
      return { redirectUrl };
    }
  },
  { urls: ["https://emokymai.vu.lt/my/*"] }, // Intercept the target URL
  ["blocking"] // Allow blocking and redirecting the request
);

// Listen for the completion of page loads to refresh the English page once
browser.webNavigation.onCompleted.addListener(
  (details) => {
    const englishUrl = "https://emokymai.vu.lt/my/index.php?lang=en";

    // If the page is the English version and has not been refreshed yet
    if (details.url === englishUrl && !processedTabs.has(details.tabId)) {
      processedTabs.add(details.tabId); // Mark the tab as processed
      browser.tabs.reload(details.tabId); // Reload the tab
    }
  },
  {
    url: [{ urlEquals: "https://emokymai.vu.lt/my/index.php?lang=en" }] // Match the redirected URL
  }
);

// Remove tab from the processed list when it is closed
browser.tabs.onRemoved.addListener((tabId) => {
  processedTabs.delete(tabId);
});

