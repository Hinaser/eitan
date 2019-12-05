async function getData(key){
  return new Promise(resolve => {
    chrome.storage.sync.get([key], (values) => {
      resolve(values[key]);
    });
  });
}
