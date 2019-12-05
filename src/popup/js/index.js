async function main(){
  const summary = await getData("summary");
  if(summary){
    const {allWords} = summary;
    const counter = document.querySelector("#counter");
    counter.innerText = allWords;
  }
  
  const button = document.querySelector("#jump-button");
  button.addEventListener("click", () => {
    chrome.tabs.create({url: "https://eowp.alc.co.jp/wordbook/ej"});
  });
}

(async () => await main())();
