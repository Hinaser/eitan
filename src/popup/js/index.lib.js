async function getData(key){
  return new Promise(resolve => {
    chrome.storage.local.get([key], (values) => {
      resolve(values[key]);
    });
  });
}
