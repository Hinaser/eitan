async function main(){
  // Get and set summary info to popup html
  const summary = await getData("summary");
  if(summary){
    const {allWords} = summary;
    const counter = document.querySelector("#counter");
    counter.innerText = allWords;
  }
  
  // Set page jump button behaviour.
  // When there are tabs which shows a specific page, jump to the page
  // on button click. Otherwise create new tab for the page and jump to it.
  const button = document.querySelector("#jump-button");
  button.addEventListener("click", () => {
    chrome.tabs.query({
      url: ["https://eowp.alc.co.jp/*"],
    }, (tabs) => {
      if(tabs.length > 0){
        const tab = tabs[0];
        chrome.tabs.update(tab.id, {active: true});
      }
      else{
        chrome.tabs.create({url: "https://eowp.alc.co.jp/wordbook/ej"});
      }
    });
  });
}

(async () => await main())();
