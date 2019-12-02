chrome.runtime.onInstalled.addListener(function onInstalled(details){
  switch(details.reason){
    case "install": return onExtensionInstalled(details);
    case "update": return onExtensionUpdated(details);
    case "browser_update": return onBrowserUpdated(details);
    case "shared_module_update": return onSharedModuleUpdated(details);
    default: break;
  }
});

function onExtensionInstalled(details){
}

function onExtensionUpdated(details){
}

function onBrowserUpdated(details){
}

function onSharedModuleUpdated(details){
}
