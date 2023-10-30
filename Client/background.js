chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'getStorage') {
      chrome.storage.sync.get(request.keys, function(result) {
        sendResponse({ command: "getStorageResult", data: result });
      });
    } else if (request.command === 'setStorage') {
      chrome.storage.sync.set(request.data, function() {
        sendResponse({ command: "setStorageResult", data: null });
      });
    }
    return true;  // Will respond asynchronously.
  });

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {action: "toggleSidebar"});
});

  
  
  
  