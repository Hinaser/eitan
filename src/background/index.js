chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if(!tab.active){
      return;
    }
    
    const eowpMatcher = new RegExp("^https://eowp.alc.co.jp/");
    if(eowpMatcher.test(tab.url)){
      chrome.browserAction.setIcon({path: "logo128.png"});
    }
    else{
      chrome.browserAction.setIcon({path: "logo128-disabled.png"});
    }
  });
});
