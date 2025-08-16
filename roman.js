let slots = [];
let maskTop = [];
let maskBottom = [];
let turn = 0;     // 0 = แถวบน, 1 = แถวล่าง
let phase = 0;    // 0 = เฉลยปกติ, 1 = รอรวมบน, 2 = รอรวมล่าง
let round = 0;

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatAnswer(arr, maskArr) {
    return arr.map((num, i) => maskArr[i] ? "-" : num)
              .map((val, i) => (i === 2 ? val + " " : val)) // หลังตำแหน่งที่ 3
              .join("");
    }

document.getElementById("random-btn").addEventListener("click", () => {
  const eyeType = Math.random() < 0.5 ? "open_eye.png" : "close_eye.png";
  document.getElementById("eye-default-1").src = eyeType;
  document.getElementById("eye-default-2").style.display = "none";

  const mainNum = Math.floor(Math.random() * 8) + 1; 
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

  randomBtn.addEventListener("click", () => {
  chatSection.classList.remove("hidden");
  rowBottom.classList.add("hidden"); 

  // ข้อความเริ่มรอบใหม่ → กลางใน chat, สวยหรู
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

  // เลื่อนลงให้เห็นข้อความ
  chatBox.scrollTop = chatBox.scrollHeight;
});

  let turn = 0; // 0 = แถวบน, 1 = แถวล่าง

  chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    round++;
    // ✅ ข้อความผู้เล่น
    const userMsg = document.createElement("div");
    userMsg.className = "bg-purple-600 px-3 py-1 rounded-lg text-white max-w-xs self-end";
    userMsg.textContent = chatInput.value;
    chatBox.appendChild(userMsg);

    // ✅ เฉลยแต่ละแถว
    let topAnswer = formatAnswer(slots.slice(0, 6), maskTop);
    let bottomAnswer = formatAnswer(slots.slice(6), maskBottom);

    const botMsg = document.createElement("div");
    botMsg.className = "bg-gray-700 px-3 py-1 rounded-lg text-white max-w-xs self-start";
    botMsg.textContent = (turn === 0) ? topAnswer : bottomAnswer;
    chatBox.appendChild(botMsg);

    if (turn === 0) {
      // รอบแรก → ตอบแถวบน
      botMsg.textContent = topAnswer;
      chatBox.appendChild(botMsg);

      // ✅ fade-in แถวล่างทันทีหลังรอบแรก
      if (rowBottom.classList.contains("hidden")) {
        rowBottom.classList.remove("hidden");
        rowBottom.classList.add("opacity-0");
        setTimeout(() => rowBottom.classList.remove("opacity-0"), 50);
      }

      turn = 1; // ต่อไปเป็นรอบแถวล่าง
    } else {
      // รอบสอง → ตอบแถวล่าง
      botMsg.textContent = bottomAnswer;
      chatBox.appendChild(botMsg);
      turn = 0; // reset รอบถัดไปเป็นแถวบน
    }

    chatInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // หลังจากผู้เล่นพิมพ์ครบ 2 รอบ
    if (round % 2 === 0) { 
      // ครบ 2 รอบ (แถวบน + แถวล่าง)
      const botSummary = document.createElement("div");
      botSummary.className = `
        self-end text-right
        bg-gradient-to-r from-[#6A5ACD] to-[#483D8B]
        text-white px-4 py-2 rounded-lg shadow-lg max-w-md
      `;
      botSummary.className = "bg-[#ce860e] px-3 py-1 rounded-lg text-white max-w-xs self-start font-extrabold italic";
      botSummary.textContent = "ทำการรวมเลข (แถวบน)";
      chatBox.appendChild(botSummary);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
});
});
