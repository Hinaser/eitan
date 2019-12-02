// Main execution context
main();

/////////// Functions ////////////////
function main() {
  chrome.runtime.onMessage.addListener(onMessageFromBackground);
  
  window.addEventListener("keydown", event => {
    let key = "useShortcut";
    chrome.storage.sync.get([key], config => {
      if (config[key] !== true) return;
      
      if (event.ctrlKey && event.key === " ") {
        onMessageFromBackground({type: "CREATE_WINDOW"});
      }
    });
  });
}

function onMessageFromBackground(message, sender, sendResponse){
  let {type, searchText} = message;
  if(type === "CREATE_WINDOW"){
  }
}

function getConfig(){
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, items => {
      resolve(items);
    });
  });
}
