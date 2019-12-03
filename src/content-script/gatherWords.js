function getWordWithKanaTrimmed(el){
  const cloneEl = el.cloneNode(true);
  cloneEl.innerHTML = cloneEl.innerHTML.replace(new RegExp('<span class="kana">.+</span>', "g"), "");
  return cloneEl.innerText;
}

function generateWordList(rootEl = document){
  const allRows = rootEl.querySelectorAll("#wordlist > tbody > tr:not(:first-child)");
  
  const WordList = [];
  
  const rowCount = allRows.length;
  for(let i=0;i<rowCount;i+=2){
    const wordRow = allRows[i];
    const meansRow = allRows[i+1];
    
    const wordEl = wordRow.querySelector("td:nth-child(2)");
    const word = wordEl ? wordEl.innerText : "???";
    const wordClassesContainer = meansRow.querySelector("td:nth-child(2) > div > div");
    const wordClassEl = wordClassesContainer ?
      Array.from(wordClassesContainer.querySelectorAll(".wordclass")) : [];
    
    const wordMeans = (()=>{
      if(wordClassEl.length > 0){
        return wordClassEl.map(el => {
          const wordClass = el.innerText.replace(/[【】]/g, "");
          const meansArray = el.nextSibling ? Array.from((el.nextSibling).querySelectorAll("li")) : [];
          let means;
          if(meansArray.length > 0){
            means = meansArray.map(meanEl => {
              return getWordWithKanaTrimmed(meanEl);
            });
          }
          else{
            means = el.nextSibling ? [getWordWithKanaTrimmed(el.nextSibling)] : [];
          }
          return means.map(m => {
            return {
              wordClass,
              mean: m,
            };
          });
        }).flat();
      }
      
      // When not single word
      if(/[ ]/.test(word) && wordClassesContainer && wordClassesContainer.querySelectorAll("ol").length < 1){
        return [{
          wordClass: "熟語",
          mean: getWordWithKanaTrimmed(wordClassesContainer),
        }];
      }
      
      console.warn("Unrecognizable word", word);
      return [];
    })();
    
    const pronounceEl = meansRow.querySelector<HTMLElement>("span.attr > span.pron");
    const pronounce = pronounceEl ? pronounceEl.innerText.replace(/、$/, "") : "";
    
    const Word = {
      word,
      wordMeans,
      pronounce,
    };
    
    WordList.push(Word);
  }
  
  return WordList;
}

function gatherAndStoreWordList(rootEl = document){
  let wl = generateWordList(rootEl);
  
  const savedWlStr = localStorage.getItem("wordList");
  if(savedWlStr){
    const savedWl = JSON.parse(savedWlStr);
    wl = savedWl.concat(wl).filter((w, i, arr) => i === arr.findIndex(w2 => w2.word === w.word));
  }
  
  const wlStr = JSON.stringify(wl);
  localStorage.setItem("wordList", wlStr);
  return wl;
}

