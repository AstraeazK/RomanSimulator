let slots = [];
let maskTop = [];
let maskBottom = [];
let turn = 0;
let phase = 0;
let round = 0;
let mainNum = null;  
let userMostFreq = null;
let timerActive = true;
let totalTime = 40;
let timerInterval = null;
let currentLanguage = "th";
let selectionMode = false;
let selectedPositions = [];
let selectionFinished = false;

const btn = document.getElementById('language-dropdown-btn');
const menu = document.getElementById('language-dropdown-menu');
const options = menu.querySelectorAll('a');

function startTimer() {
  clearInterval(timerInterval);
  totalTime = 40;
  document.getElementById("timer-text").textContent = formatTime(totalTime);
  timerInterval = setInterval(() => {
    totalTime--;
    document.getElementById("timer-text").textContent = formatTime(totalTime);

    if (totalTime <= 0) {
      clearInterval(timerInterval);
      endGameDueToTimeout();
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function endGameDueToTimeout() {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "px-3 py-1 rounded-lg text-[#730000] bg-[#FB4141] max-w-xs self-start font-extrabold";
  msg.textContent = "⏰ หมดเวลา!";
  chatBox.appendChild(msg);

  // ซ่อน input และ choice
  document.getElementById("chat-input").style.display = "none";
  document.getElementById("choice-div").classList.add("hidden");

  // reset state
  phase = 0;
  turn = 0;
  round = 0;
  mainNum = null;
}

btn.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});
// event ตอนเลือกภาษา
options.forEach(option => {
  option.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedLang = option.textContent.trim().toLowerCase();
    setLanguage(selectedLang);

    // เปลี่ยนข้อความปุ่ม dropdown
    btn.childNodes[0].textContent = option.textContent + " ";
    menu.classList.add('hidden');
  });
});

// ปิดเมนูเมื่อคลิกข้างนอก
document.addEventListener('click', (e) => {
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

function setLanguage(lang) {
  currentLanguage = lang;
  applyLanguage();
}

function applyLanguage() {
  const title = document.getElementById("title");
  const randomBtn = document.getElementById("random-btn");
  const chatInput = document.getElementById("chat-input");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const timerText = document.getElementById("timer-text");

  if (currentLanguage === "th") {
    title.innerText = "เลขโรมัน Simulator";
    randomBtn.innerText = "สุ่มเลขโรมัน";
    chatInput.placeholder = "พิมพ์ตัวเลขที่เห็นแล้วกด Enter || ตัวอย่าง:--6 5-6";
    btnYes.innerText = "✅ ยืนเลขซ้ำ";
    btnNo.innerText = "❌ ไม่ยืนเลขซ้ำ";
    timerText.innerText = "0:40";
  } else {
    title.innerText = "Roman Numeral Simulator";
    randomBtn.innerText = "Start";
    chatInput.placeholder = "Type the numbers you see and press Enter || Example:--6 5-6";
    btnYes.innerText = "✅ Stand Duplicate";
    btnNo.innerText = "❌ No Stand Duplicate";
    timerText.innerText = "0:40";
  }
}

function getStartMessage() {
  if (currentLanguage === "th") {
    return "ให้ท่านพิมพ์เลขตามที่ท่านเห็น ถ้าไม่เห็นเลขให้ใส่ขีด (-)";
  } else {
    return "Please type the numbers you see. If you don’t see a number, enter a dash (-)";
  }
}

function getBotMessage(key) {
  const messages = {
    th: {
      combineTop: "ทำการรวมเลข (แถวบน)",
      combineBottom: "ทำการรวมเลข (แถวล่าง)",
      mostFrequent: "เลขใดซ้ำเยอะที่สุด?",
      wrongAnswer: `❌ ตอบผิด! เลขซ้ำเยอะที่สุดคือ ${mainNum || ''}`,
    },
    en: {
      combineTop: "Gather number (top row)",
      combineBottom: "Gather number (bottom row)",
      mostFrequent: "Which number appears the most?",
      wrongAnswer: `❌ Wrong! The most frequent number was ${mainNum || ''}`,
    },
  };

  return currentLanguage === "th" 
    ? messages.th[key] 
    : messages.en[key];
}


// เรียกตอนโหลดครั้งแรก
document.addEventListener("DOMContentLoaded", applyLanguage);

// ปิดเมนูเมื่อคลิกข้างนอก
document.addEventListener('click', (e) => {
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// เริ่มนับเวลาเมื่อกดปุ่มสุ่ม
document.getElementById("random-btn").addEventListener("click", () => {
  startTimer();
});

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeightedRowCount() {
  const weights = [1, 1, 1, 1, 1, 0.04];
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * totalWeight;

  for (let count = 1; count <= 6; count++) {
    roll -= weights[count - 1];
    if (roll <= 0) return count;
  }

  return 6;
}

function formatAnswer(arr, maskArr) {
  return arr.map((num, i) => maskArr[i] ? "-" : num)
            .map((val, i) => (i === 2 ? val + " " : val))
            .join("");
}

function getBoardImages() {
  const rowTop = document.getElementById("row-top");
  const rowBottom = document.getElementById("row-bottom");
  if (!rowTop || !rowBottom) return [];
  return [...rowTop.children, ...rowBottom.children];
}

function resetBoardSelectionStyles() {
  getBoardImages().forEach((img) => {
    img.style.outline = "";
    img.style.outlineOffset = "";
    img.style.boxShadow = "";
    img.style.opacity = "1";
    img.onmouseenter = null;
    img.onmouseleave = null;
  });
}

function updateBoardSelectionStyles() {
  const images = getBoardImages();
  images.forEach((img, index) => {
    if (selectedPositions.includes(index)) {
      img.style.outline = "4px solid #f472b6";
      img.style.outlineOffset = "2px";
      img.style.boxShadow = "0 0 0 4px rgba(244, 114, 182, 0.35)";
    } else {
      img.style.outline = "";
      img.style.outlineOffset = "";
      img.style.boxShadow = "";
    }
  });
}

function startPositionSelection(chatBox) {
  selectionMode = true;
  selectionFinished = false;
  selectedPositions = [];
  resetBoardSelectionStyles();

  const promptMsg = document.createElement("div");
  promptMsg.className = "bg-[#ce860e] px-3 py-1 rounded-lg text-white max-w-xs self-start font-extrabold italic";
  const eyeSrc = document.getElementById("eye-default-1").src;
  const isOpenEye = eyeSrc.includes("open_eye.png");
  promptMsg.textContent = currentLanguage === "th"
    ? (isOpenEye ? "เลือกตำแหน่งที่เป็นเลขซ้ำจากภาพด้านบน" : "เลือกตำแหน่งที่ไม่ซ้ำจากภาพด้านบน")
    : (isOpenEye ? "Select the duplicate positions from the images above" : "Select the non-duplicate positions from the images above");
  chatBox.appendChild(promptMsg);

  const images = getBoardImages();
  images.forEach((img, index) => {
    img.onclick = () => {
      if (!selectionMode || selectionFinished) return;

      const existingIndex = selectedPositions.indexOf(index);
      if (existingIndex >= 0) {
        selectedPositions.splice(existingIndex, 1);
      } else if (selectedPositions.length < 6) {
        selectedPositions.push(index);
      }

      updateBoardSelectionStyles();

      if (selectedPositions.length === 6) {
        evaluateSelection(chatBox);
      }
    };

    img.onmouseenter = () => {
      if (!selectionMode || selectionFinished || selectedPositions.length >= 6) return;
      if (selectedPositions.includes(index)) return;
      img.style.outline = "3px solid #f472b6";
      img.style.outlineOffset = "2px";
      img.style.boxShadow = "0 0 0 4px rgba(244, 114, 182, 0.2)";
    };

    img.onmouseleave = () => {
      if (!selectionMode || selectionFinished || selectedPositions.includes(index)) return;
      img.style.outline = "";
      img.style.outlineOffset = "";
      img.style.boxShadow = "";
    };
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

function evaluateSelection(chatBox) {
  if (selectionFinished) return;

  selectionFinished = true;
  selectionMode = false;

  const eyeSrc = document.getElementById("eye-default-1").src;
  const isOpenEye = eyeSrc.includes("open_eye.png");
  const correctPositions = [];

  for (let i = 0; i < 12; i++) {
    const isDuplicatePosition = slots[i] === mainNum;
    if (isOpenEye ? isDuplicatePosition : !isDuplicatePosition) {
      correctPositions.push(i);
    }
  }

  const selectedSet = new Set(selectedPositions);
  const correctSelected = selectedPositions.filter((index) => correctPositions.includes(index));
  const incorrectSelected = selectedPositions.filter((index) => !correctPositions.includes(index));
  const missedCorrect = correctPositions.filter((index) => !selectedSet.has(index));

  const images = getBoardImages();
  images.forEach((img, index) => {
    const isCorrect = correctPositions.includes(index);
    const isSelected = selectedSet.has(index);

    if (isCorrect && isSelected) {
      img.style.outline = "4px solid #22c55e";
      img.style.outlineOffset = "2px";
      img.style.boxShadow = "0 0 0 4px rgba(34, 197, 94, 0.35)";
    } else if (isCorrect && !isSelected) {
      img.style.outline = "4px solid #facc15";
      img.style.outlineOffset = "2px";
      img.style.boxShadow = "0 0 0 4px rgba(250, 204, 21, 0.35)";
    } else if (!isCorrect && isSelected) {
      img.style.outline = "4px solid #ef4444";
      img.style.outlineOffset = "2px";
      img.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.35)";
    } else {
      img.style.outline = "";
      img.style.outlineOffset = "";
      img.style.boxShadow = "";
    }
  });

  const resultMsg = document.createElement("div");
  resultMsg.className = "px-3 py-1 rounded-lg max-w-xs self-start font-extrabold";

  if (correctSelected.length === correctPositions.length && incorrectSelected.length === 0) {
    resultMsg.className += " text-[#386641] bg-[#8ABB6C]";
    resultMsg.textContent = currentLanguage === "th" ? "✅ ถูกต้อง!" : "✅ Correct!";
  } else if (correctSelected.length > 0 && incorrectSelected.length > 0) {
    resultMsg.className += " text-[#7c2d12] bg-[#fbbf24]";
    resultMsg.textContent = currentLanguage === "th"
      ? "พยายามอีกนิดนะ ใกล้ถึงความเป็นจริงแล้ว"
      : "Keep trying, you are very close";
  } else if (correctSelected.length === 0 && selectedPositions.length > 0) {
    resultMsg.className += " text-[#7f1d1d] bg-[#f87171]";
    resultMsg.textContent = currentLanguage === "th"
      ? "ลองกลับไปทบทวนอีกครั้ง"
      : "Try reviewing it again";
  } else if (missedCorrect.length > 0) {
    resultMsg.className += " text-[#7c2d12] bg-[#fbbf24]";
    resultMsg.textContent = currentLanguage === "th"
      ? "พยายามอีกนิดนะ ใกล้ถึงความเป็นจริงแล้ว"
      : "Keep trying, you are very close";
  } else {
    resultMsg.className += " text-[#386641] bg-[#8ABB6C]";
    resultMsg.textContent = currentLanguage === "th" ? "✅ ถูกต้อง!" : "✅ Correct!";
  }

  chatBox.appendChild(resultMsg);

  document.getElementById("chat-input").style.display = "none";
  document.getElementById("choice-div").classList.add("hidden");
  phase = 0;
  turn = 0;
  round = 0;
  mainNum = null;
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("random-btn").addEventListener("click", () => {
  const eyeType = Math.random() < 0.5 ? "open_eye.png" : "close_eye.png";
  document.getElementById("eye-default-1").src = eyeType;
  document.getElementById("eye-default-2").style.display = "none";

  mainNum = Math.floor(Math.random() * 8) + 1; 
  let otherNums = [];
  for (let i = 1; i <= 8; i++) if (i !== mainNum) otherNums.push(i);

  slots = Array(12).fill(null);
  let positions = Array.from({length: 12}, (_, i) => i).sort(() => Math.random() - 0.5);
  positions.slice(0, 6).forEach(pos => { slots[pos] = mainNum; });

  let availableNums = [...otherNums];
  positions.slice(6).forEach(pos => {
    if (availableNums.length === 0) availableNums = [...otherNums];
    let choice = randomChoice(availableNums);
    slots[pos] = choice;
    availableNums = availableNums.filter(n => n !== choice);
  });

  // console.log("เลขที่ซ้ำคือ:", mainNum);
  // console.log("🔹 เฉลยแถวบน:", slots.slice(0, 6).join(", "));
  // console.log("🔹 เฉลยแถวล่าง:", slots.slice(6).join(", "));

  function fillRow(rowId, startIdx, maskArr, numShow) {
    const rowElem = document.getElementById(rowId).children;
    let showIndices = Array.from({length: 6}, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, numShow);

    for (let i = 0; i < 6; i++) {
      const imgElem = rowElem[i];
      if (showIndices.includes(i)) {
        imgElem.src = `symbol_${slots[startIdx + i]}.png`;
        maskArr[i] = true;
      } else {
        imgElem.src = "symbol_none.png";
        maskArr[i] = false;
      }
    }
  }

  const topCount = getWeightedRowCount();
  const bottomCount = 6 - topCount;

  maskTop = Array(6).fill(false);
  maskBottom = Array(6).fill(false);
  fillRow("row-top", 0, maskTop, topCount);
  fillRow("row-bottom", 6, maskBottom, bottomCount);
});

document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chat-input");
  const chatBox = document.getElementById("chat-box");
  const chatSection = document.getElementById("chat-section");
  const randomBtn = document.getElementById("random-btn");
  const rowBottom = document.getElementById("row-bottom");
  const choiceDiv = document.getElementById("choice-div");

  randomBtn.addEventListener("click", () => {
    chatSection.classList.remove("hidden");
    rowBottom.classList.add("hidden"); 

    selectionMode = false;
    selectionFinished = false;
    selectedPositions = [];
    resetBoardSelectionStyles();

    //reset
    phase = 0;
    turn = 0;
    round = 0;
    userMostFreq = null;

    // เอา input กลับมา
    chatInput.style.display = "block";
    choiceDiv.classList.add("hidden");

    const startMsg = document.createElement("div");
    startMsg.className = `
      mx-auto text-center px-2 py-1
      bg-transparent
      text-white font-extrabold italic
      underline decoration-4 decoration-purple-400
      shadow-purple-500/50 drop-shadow-lg
      max-w-2xl
    `;
    startMsg.textContent = getStartMessage();
    chatBox.appendChild(startMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  });


  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
      const userText = chatInput.value;
      round++;

      const userMsg = document.createElement("div");
      userMsg.className = "bg-purple-600 px-3 py-1 rounded-lg text-white max-w-xs self-end";
      userMsg.textContent = userText;
      chatBox.appendChild(userMsg);
      chatInput.value = "";
      chatBox.scrollTop = chatBox.scrollHeight;

      const botMsg = document.createElement("div");
      botMsg.className = "bg-gray-700 px-3 py-1 rounded-lg text-white max-w-xs self-start";

      if (phase === 0) {
        if (turn === 0) {
          botMsg.textContent = formatAnswer(slots.slice(0, 6), maskTop);
          chatBox.appendChild(botMsg);
          rowBottom.classList.remove("hidden");
          turn = 1;
        } else {
          botMsg.textContent = formatAnswer(slots.slice(6), maskBottom);
          chatBox.appendChild(botMsg);
          phase = 1;
          const botSummary = document.createElement("div");
          botSummary.className = "bg-[#ce860e] px-3 py-1 rounded-lg text-white max-w-xs self-start font-extrabold italic";
          botSummary.textContent = getBotMessage("combineTop"); // ✅ ใช้ตามภาษา
          chatBox.appendChild(botSummary);
        }
      } else if (phase === 1) {
        botMsg.className = "bg-[#ce860e] px-3 py-1 rounded-lg text-white max-w-xs self-start font-extrabold italic";
        botMsg.textContent = getBotMessage("combineBottom"); // ✅
        chatBox.appendChild(botMsg);
        phase = 2;
      } else if (phase === 2) {
        botMsg.innerHTML = `<i>${getBotMessage("mostFrequent")}</i>`; // ✅
        chatBox.appendChild(botMsg);
        phase = 3;
      } else if (phase === 3) {
          // ผู้เล่นพิมพ์เลขซ้ำ
          userMostFreq = parseInt(userText);

          // เฉลยทั้งหมด
          for (let i = 0; i < 12; i++) {
            let row = i < 6 ? "row-top" : "row-bottom";
            document.getElementById(row).children[i % 6].src = `symbol_${slots[i]}.png`;
          }

          chatInput.style.display = "none"; // ซ่อน input

          if (userMostFreq !== mainNum) {
            // ผู้เล่นตอบผิด จบเกม
            clearInterval(timerInterval);
            const botMsg = document.createElement("div");
            botMsg.className = "px-3 py-1 rounded-lg text-[#730000] bg-[#FB4141] max-w-xs self-start font-extrabold";
            botMsg.innerHTML = getBotMessage("wrongAnswer", { mainNum });
            chatBox.appendChild(botMsg);

            // ซ่อนปุ่ม choice
            choiceDiv.classList.add("hidden");
            chatInput.style.display = "none";
            phase = 0;
            turn = 0;
            round = 0;
            mainNum = null;
          } else {
            // ผู้เล่นตอบถูก ไปต่อ
            choiceDiv.classList.remove("hidden");
            phase = 4;
          }
      }

      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });

  // ปุ่มตรวจคำตอบ
  document.getElementById("btn-yes").addEventListener("click", () => checkAnswer(true));
  document.getElementById("btn-no").addEventListener("click", () => checkAnswer(false));

  function checkAnswer(isYes) {
    clearInterval(timerInterval);
    const botMsg = document.createElement("div");

    // แปลง eyeType เป็น open/close
    const eyeSrc = document.getElementById("eye-default-1").src;
    const eyeType = eyeSrc.includes("open_eye.png") ? "open" : "close";
    let eyeText;
      if (currentLanguage === "th") {
        eyeText = eyeType === "open" ? "ตาเปิด" : "ตาปิด";
      } else {
        eyeText = eyeType === "open" ? "Open Eye" : "Closed Eye";
      }

    let correct;
    if (eyeType === "open") correct = isYes;
    else correct = !isYes;

    // แปลข้อความ shouldText
    let shouldText;
      if (currentLanguage === "th") {
        shouldText = (eyeType === "open") ? "ควรยืนเลขซ้ำ" : "ไม่ควรยืนเลขซ้ำ";
      } else {
        shouldText = (eyeType === "open") ? "Stand Duplicate " : "should not stand duplicate";
      }

    if (correct) {
      botMsg.className = "px-3 py-1 rounded-lg text-[#386641] bg-[#8ABB6C] max-w-xs self-start font-extrabold";

      if (currentLanguage === "th") { 
        botMsg.innerHTML = `✅ ถูกต้อง! เลขซ้ำเยอะที่สุดคือ ${mainNum}, เนื่องจากเป็น ${eyeText} จึง${shouldText}`;
      } else {
        botMsg.innerHTML = `✅ Correct! The most frequent number was ${mainNum}, since it is ${eyeText} therefore ${shouldText}`;
      }

    } else {
      botMsg.className = "px-3 py-1 rounded-lg text-[#000000] bg-[#FB4141] max-w-xs self-start font-extrabold";

      if (currentLanguage === "th") { 
        botMsg.innerHTML = `❌ ตอบผิด! เลขซ้ำเยอะที่สุดคือ ${mainNum}, เนื่องจากเป็น ${eyeText} จึง${shouldText}`;
      } else {
        botMsg.innerHTML = `❌ Wrong! The most frequent number was ${mainNum}, since it is ${eyeText} therefore ${shouldText}`;
      }
    }

    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    choiceDiv.classList.add("hidden");
    chatInput.style.display = "none";
    startPositionSelection(chatBox);
  }

});
