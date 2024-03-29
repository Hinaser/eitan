function getWordWithKanaTrimmed(el){
  let child = el.firstChild;
  const texts = [];
  while(child){
    if(child.nodeType === 3){
      texts.push(child.data);
    }
    child = child.nextSibling;
  }
  return texts.join("");
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
    
    const pronounceEl = meansRow.querySelector("span.attr > span.pron");
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

function isWordMeansEqual(w1, w2){
  return w1.wordMeans.length === w2.wordMeans.length && w1.wordMeans.every((wm1, i) => {
    return wm1.mean === w2.wordMeans[i].mean;
  })
}

function gatherAndStoreWordList(rootEl = document){
  let wl = generateWordList(rootEl);
  
  const savedWlStr = localStorage.getItem("wordList");
  if(savedWlStr){
    const wordsToUpdate = [];
    const savedWl = JSON.parse(savedWlStr);
    wl = wl
      .concat(savedWl)
      .filter((w, i, arr) => {
        return i === arr.findIndex(w2 => {
          return w2.word === w.word;
        });
      });
  }
  
  const wlStr = JSON.stringify(wl);
  localStorage.setItem("wordList", wlStr);
  return wl;
}

