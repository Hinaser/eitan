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
  return Boolean(docFragment.querySelector(".topuser_logout"));
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

async function setData(key, value){
  return new Promise((resolve) => {
    chrome.storage.local.set({[key]: value}, () => {
      resolve();
    })
  });
}

async function getData(key){
  return new Promise((resolve) => {
    chrome.storage.local.get(key ? [key] : null, (values) => {
      resolve(values[key]);
    })
  });
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

function createAttachButtonContainer(){
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.right = "16px";
  container.style.bottom = "-17px";
  container.style.fontSize = "10px";
  container.style.fontWeight = "700";
  container.style.color = "#666";
  container.style.cursor = "pointer";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  const img = document.createElement("img");
  img.width = 24;
  img.height = 24;
  img.src = "data:image/png;base64,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";
  img.style.display = "block";
  img.style.marginBottom = "3px";
  container.appendChild(img);
  const div = document.createElement("div");
  div.innerText = "単語帳復習";
  container.appendChild(div);
  return container;
}

function attachWebApp(){
  if(!openEowpPlus || !onCloseEowpPlus){
    return;
  }
  
  const currentBodyFontSize = document.body.style.fontSize;
  document.body.style.fontSize = "16px";
  const currentBodyLineHeight = document.body.style.lineHeight;
  document.body.style.lineHeight = "1.2";
  const currentOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  
  const openAppButtonContainer = createAttachButtonContainer();
  const onFirstOpen = () => {
    openEowpPlus();
  };
  openAppButtonContainer.addEventListener("click", onFirstOpen);
  
  const onCloseApp = () => {
    const rootId = "learn-english-with-eowp-root";
    const root = document.querySelector(`#${rootId}`);
    root.style.display = "none";
    
    openAppButtonContainer.removeEventListener("click", onFirstOpen);
  
    document.body.style.fontSize = currentBodyFontSize;
    document.body.style.lineHeight = currentBodyLineHeight;
    document.body.style.overflow = currentOverflow;
  
    const reopenApp = () => {
      root.style.display = "block";
      document.body.style.fontSize = "16px";
      document.body.style.lineHeight = "1.2";
      document.body.style.overflow = "hidden";
    };
  
    openAppButtonContainer.addEventListener("click", reopenApp);
  };
  onCloseEowpPlus(onCloseApp);
  
  const mountPoint = document.querySelector("#logo > .logo");
  mountPoint.style.position = "relative";
  mountPoint.appendChild(openAppButtonContainer);
}
