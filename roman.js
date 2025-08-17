let slots = [];
let maskTop = [];
let maskBottom = [];
let turn = 0;
let phase = 0;
let round = 0;
let mainNum = null;  
let userMostFreq = null;
let timerActive = true;
let totalTime = 43;
let timerInterval = null;


function startTimer() {
  clearInterval(timerInterval);
  totalTime = 43;
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

// เริ่มนับเวลาเมื่อกดปุ่มสุ่ม
document.getElementById("random-btn").addEventListener("click", () => {
  startTimer();
});

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatAnswer(arr, maskArr) {
  return arr.map((num, i) => maskArr[i] ? "-" : num)
            .map((val, i) => (i === 2 ? val + " " : val))
            .join("");
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

  console.log("เลขที่ซ้ำคือ:", mainNum);
  console.log("🔹 เฉลยแถวบน:", slots.slice(0, 6).join(", "));
  console.log("🔹 เฉลยแถวล่าง:", slots.slice(6).join(", "));

  function fillRow(rowId, startIdx, maskArr) {
    const rowElem = document.getElementById(rowId).children;
    const numShow = Math.floor(Math.random() * 5) + 1;
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

  maskTop = Array(6).fill(false);
  maskBottom = Array(6).fill(false);
  fillRow("row-top", 0, maskTop);
  fillRow("row-bottom", 6, maskBottom);
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

    // ✅ reset state รอบใหม่
    phase = 0;
    turn = 0;
    round = 0;
    userMostFreq = null;

    // ✅ เอา input กลับมา
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
    startMsg.textContent = "ให้ท่านพิมพ์เลขตามที่ท่านเห็น ถ้าไม่เห็นเลขให้ใส่ขีด (-)";
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
          botSummary.textContent = "ทำการรวมเลข (แถวบน)";
          chatBox.appendChild(botSummary);
        }
      } else if (phase === 1) {
        botMsg.className = "bg-[#ce860e] px-3 py-1 rounded-lg text-white max-w-xs self-start font-extrabold italic";
        botMsg.textContent = "ทำการรวมเลข (แถวล่าง)";
        chatBox.appendChild(botMsg);
        phase = 2;
      } else if (phase === 2) {
        botMsg.innerHTML = "<i>เลขใดซ้ำเยอะที่สุด?</i>";
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
            botMsg.innerHTML = `❌ ตอบผิด! เลขซ้ำเยอะที่สุดคือ ${mainNum}`;
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
    const eyeText = eyeType === "open" ? "ตาเปิด" : "ตาปิด";

    let correct;
    if (eyeType === "open") correct = isYes;
    else correct = !isYes;

    const shouldText = (eyeType === "open") ? "ควรยืนเลขซ้ำ" : "ไม่ควรยืนเลขซ้ำ";

    if (correct) {
      botMsg.className = "px-3 py-1 rounded-lg text-[#386641] bg-[#8ABB6C] max-w-xs self-start font-extrabold";
      botMsg.innerHTML = `✅ ถูกต้อง! เลขซ้ำเยอะที่สุดคือ ${mainNum}, เนื่องจากเป็น ${eyeText} จึง${shouldText}`;
    } else {
      botMsg.className = "px-3 py-1 rounded-lg text-[#000000] bg-[#FB4141] max-w-xs self-start font-extrabold";
      botMsg.innerHTML = `❌ ตอบผิด! เลขซ้ำเยอะที่สุดคือ ${mainNum}, เนื่องจากเป็น ${eyeText} จึง${shouldText}`;
    }

    chatBox.appendChild(botMsg);

    // reset รอบใหม่
    choiceDiv.classList.add("hidden");
    chatInput.style.display = "none";
    phase = 0;
    turn = 0;
    round = 0;
    mainNum = null;
    chatBox.scrollTop = chatBox.scrollHeight;
  }

});
