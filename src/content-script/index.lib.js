async function fetchPage(pageIndex){
  const res = await fetch(`/wordbook/ej?page=${pageIndex}&col=2&sort=2`);
  return res.text();
}

async function loadPage(pageIndex){
  const page = await fetchPage(pageIndex);
  const domParser = new DOMParser();
  const documentFragment = domParser.parseFromString(page, "text/html");
  if(isLoggedIn(documentFragment)){
    gatherAndStoreWordList(documentFragment);
  }
}

function isLoggedIn(docFragment){
  return !docFragment.querySelector("#fmLogin");
}

async function getSummary(){
  const page = await fetchPage(1);
  const domParser = new DOMParser();
  const documentFragment = domParser.parseFromString(page, "text/html");
  
  if(!isLoggedIn(documentFragment)){
    return false;
  }
  
  const enlistedWordsEl = documentFragment.querySelector("#tabcontent > p > span.bold");
  const wordsListed = enlistedWordsEl.innerText;
  const checkBoxes = Array.from(documentFragment.querySelectorAll("#wordlist input[type='checkbox'].word_chk"));
  const rowCount = checkBoxes.length;
  const maxPage = rowCount === 0 ? 0 : Math.ceil(wordsListed / rowCount);
  
  const latestDateEl = documentFragment.querySelector("#wordlist > tbody > tr:nth-child(2) span.date");
  const lastCreated = latestDateEl ? latestDateEl.innerText : null;
  
  return {
    itemsInPage: rowCount,
    allWords: +wordsListed,
    maxPage,
    lastCreated,
  };
}

function isUpdated(prevSummary, summary){
  const {
    allWords: prevAllWords,
    lastCreated: prevLastCreated,
  } = prevSummary;
  
  const {
    allWords,
    lastCreated,
  } = summary;
  
  return prevAllWords !== allWords || prevLastCreated !== lastCreated;
}

async function syncWordList(force = false){
  const prevSummary = (await getData("summary")) || {lastCreated: "", allWords: 0};
  const summary = await getSummary();
  
  if(!summary || (!force && !isUpdated(prevSummary, summary))){
    return;
  }
  
  for(let i=1;i<summary.maxPage+1;i++){
    await loadPage(i);
  }
  
  await setData("summary", summary);
}

async function setData(key, value){
  return new Promise((resolve) => {
    chrome.storage.sync.set({[key]: value}, () => {
      resolve();
    })
  });
}

async function getData(key){
  return new Promise((resolve) => {
    chrome.storage.sync.get(key ? [key] : null, (values) => {
      resolve(values[key]);
    })
  });
}
