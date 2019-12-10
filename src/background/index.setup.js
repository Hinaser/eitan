chrome.runtime.onInstalled.addListener(function onInstalled(details){
  switch(details.reason){
    case "install": return onExtensionInstalled(details);
    case "update": return onExtensionUpdated(details);
    case "chrome_update": return onBrowserUpdated(details);
    case "browser_update": return onBrowserUpdated(details);
    case "shared_module_update": return onSharedModuleUpdated(details);
    default: break;
  }
});

function reloadEowpTab(){
  chrome.tabs.query({
    url: ["https://eowp.alc.co.jp/*"],
  }, (tabs) => {
    for(let i=0;i<tabs.length;i++){
      const tab = tabs[i];
      chrome.tabs.reload(tab.id, {bypassCache: false});
    }
  });
}

function onExtensionInstalled(details){
  reloadEowpTab();
}

function onExtensionUpdated(details){
  reloadEowpTab();
}

function onBrowserUpdated(details){
}

function onSharedModuleUpdated(details){
}
