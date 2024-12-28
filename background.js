let timeTrackingData = {};
let ignoredWebsites = [];
let userDefinedLimits = {};
let lastActiveDomain = null;
let timerInterval = null;
let isChromeFocused = true; 

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && isChromeFocused) {
      handleTabChange(tab.url);
    }
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isChromeFocused = false;
    pauseTracking();
  } else {
    isChromeFocused = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        handleTabChange(tabs[0].url);
      }
    });
  }
});

function handleTabChange(url) {
  const domain = new URL(url).hostname;

  if (!ignoredWebsites.includes(domain)) {
    if (lastActiveDomain && lastActiveDomain !== domain) {
      pauseTracking();
    }
    trackTime(domain);
    lastActiveDomain = domain;
  }
}

function trackTime(domain) {
  const currentTime = new Date().getTime();
  const currentDate = getCurrentDate();

  if (!timeTrackingData[currentDate]) {
    timeTrackingData[currentDate] = {};
  }

  if (!timeTrackingData[currentDate][domain]) {
    timeTrackingData[currentDate][domain] = { totalTime: 0, lastAccessTime: currentTime };
  } else {
    const timeSpent = currentTime - timeTrackingData[currentDate][domain].lastAccessTime;
    timeTrackingData[currentDate][domain].totalTime += timeSpent;
    timeTrackingData[currentDate][domain].lastAccessTime = currentTime;
  }

  chrome.storage.local.set({ timeTrackingData });

  if (isChromeFocused && !timerInterval) {
    timerInterval = setInterval(() => {
      trackTime(domain);
    }, 1000);
  }
}

function getCurrentDate() {
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    today.getDate().toString().padStart(2, "0");
  return date;
}

function pauseTracking() {
  if (!lastActiveDomain) return;

  const currentTime = new Date().getTime();
  const currentDate = getCurrentDate();

  if (timeTrackingData[currentDate] && timeTrackingData[currentDate][lastActiveDomain]) {
    const timeSpent = currentTime - timeTrackingData[currentDate][lastActiveDomain].lastAccessTime;
    timeTrackingData[currentDate][lastActiveDomain].totalTime += timeSpent;
    chrome.storage.local.set({ timeTrackingData });
  }

  clearInterval(timerInterval);
  timerInterval = null;
}

function resumeTracking() {
  if (!lastActiveDomain) return;

  const currentDate = getCurrentDate();

  if (timeTrackingData[currentDate] && timeTrackingData[currentDate][lastActiveDomain]) {
    timeTrackingData[currentDate][lastActiveDomain].lastAccessTime = new Date().getTime();
  }

  if (!timerInterval) {
    timerInterval = setInterval(() => {
      if (isChromeFocused && lastActiveDomain) {
        trackTime(lastActiveDomain);
      }
    }, 1000);
  }
}



