const timerDisplay = document.getElementById('timer');
const timerTitle = document.getElementById('timerTitle');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const fallingWrapper = document.querySelector('.falling-wrapper');
const workDisplay = document.getElementById('workDuration');
const breakDisplay = document.getElementById('breakDuration');
const musicToggle = document.getElementById('musicToggle');
const logContainer = document.getElementById('logContainer');
const workPlus = document.getElementById('workPlus');
const workMinus = document.getElementById('workMinus');
const breakPlus = document.getElementById('breakPlus');
const breakMinus = document.getElementById('breakMinus');

let countdown;
let isRunning = false;
let isBreakMode = false;
let musicEnabled = true;
let stickerInterval;
let timeleft = 25 * 60;
let spotifyActive = false;
let backgroundAudio = new Audio('assets/background.mp3');
backgroundAudio.loop = true;

const addPlaylistBtn = document.getElementById('addPlaylist');
const removePlaylistBtn = document.getElementById('removePlaylist');
const spotifyPlayerWrapper = document.getElementById('spotifyPlayerWrapper');

addPlaylistBtn.addEventListener('click', () => {
  const url = prompt("Paste your Spotify playlist link:");
  if (url && url.includes('open.spotify.com/playlist/')) {
    const playlistId = url.split('playlist/')[1].split('?')[0];
    const iframe = `<iframe src="https://open.spotify.com/embed/playlist/${playlistId}" width="300" height="80" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    spotifyPlayerWrapper.innerHTML = iframe;
    spotifyPlayerWrapper.style.display = 'block';
    removePlaylistBtn.style.display = 'inline-block';
    backgroundAudio.pause();
    spotifyActive = true;
  } else {
    alert("Invalid playlist link.");
  }
});

removePlaylistBtn.addEventListener('click', () => {
  spotifyPlayerWrapper.innerHTML = '';
  spotifyPlayerWrapper.style.display = 'none';
  removePlaylistBtn.style.display = 'none';
  spotifyActive = false;
  if (musicEnabled && !isBreakMode && isRunning) {
    backgroundAudio.play().catch(() => {});
  }
});


const workStickers = ['🍅', '⏱️', '🎯', '💪', '📖', '🖥️', '📚', '📝', '⚙️', '📊', '🎧', '🧠', '📅', '💡', '🔴', '🚀'];
const breakStickers = ['☕', '🌸', '🌿', '✨', '🍃', '🛋️', '📱', '🎶', '💆', '🕊️', '🍵', '🎨', '🌼', '🧘', '🎉', '🌈'];

function getWorkTime() {
  return parseInt(workDisplay.textContent) || 25;
}
function getBreakTime() {
  return parseInt(breakDisplay.textContent) || 5;
}

function createSticker() {
  const sticker = document.createElement('div');
  sticker.classList.add('sticker');
  const stickers = isBreakMode ? breakStickers : workStickers;
  sticker.innerText = stickers[Math.floor(Math.random() * stickers.length)];
  sticker.style.left = Math.random() * 100 + 'vw';
  sticker.style.animationDuration = (3 + Math.random() * 3) + 's';
  sticker.style.fontSize = (20 + Math.random() * 20) + 'px';
  sticker.style.filter = `blur(${Math.random() * 1}px)`;
  fallingWrapper.appendChild(sticker);
  setTimeout(() => sticker.remove(), 5000);
}

function startStickerAnimation() {
  stickerInterval = setInterval(createSticker, 200);
}

function stopStickerAnimation() {
  clearInterval(stickerInterval);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeleft);
  document.body.className = isBreakMode ? 'break-mode' : 'work-mode';
  timerTitle.textContent = isBreakMode ? 'Break Timer' : 'Pomodoro Timer';
  updateLog();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timeleft = (isBreakMode ? getBreakTime() : getWorkTime()) * 60;
  startStickerAnimation();
  if (!isBreakMode && musicEnabled && !spotifyActive) backgroundAudio.play().catch(() => {});

  countdown = setInterval(() => {
    if (timeleft <= 0) {
      clearInterval(countdown);
      isRunning = false;
      stopStickerAnimation();
      if (isBreakMode) {
        playBreakDoneSound();
        setTimeout(() => {
          alert("Break’s over! Back to work.");
          switchToWork();
        }, 50);
      } else {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
        playSound();
        handleSessionComplete();
        setTimeout(() => {
          alert("Time's up! Take a break.");
          switchToBreak();
        }, 50);
      }      
      return;
    }
    timeleft--;
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(countdown);
  stopStickerAnimation();
  isRunning = false;
  backgroundAudio.pause();
}

function resetTimer() {
  clearInterval(countdown);
  stopStickerAnimation();
  isRunning = false;
  isBreakMode = false;
  timeleft = getWorkTime() * 60;
  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;
  updateDisplay();
}

function switchToBreak() {
  isBreakMode = true;
  timeleft = getBreakTime() * 60;
  updateDisplay();
}

function switchToWork() {
  isBreakMode = false;
  timeleft = getWorkTime() * 60;
  updateDisplay();
}

function playSound() {
  const audio = new Audio('assets/breakdone.mp3');
  audio.play().catch(() => {});
}

function playBreakDoneSound() {
  const audio = new Audio('assets/breakdone.mp3');
  audio.play().catch(() => {});
}

function handleSessionComplete() {
  const today = new Date().toLocaleDateString();
  const data = JSON.parse(localStorage.getItem('pomolog') || '{}');
  if (data.lastDate !== today) {
    data.dailyCount = 0;
    data.lastDate = today;
    data.streak = (data.lastActive === getYesterday()) ? (data.streak || 0) + 1 : 1;
  }
  data.dailyCount = (data.dailyCount || 0) + 1;
  data.totalSessions = (data.totalSessions || 0) + 1;
  data.lastActive = today;
  localStorage.setItem('pomolog', JSON.stringify(data));
  updateLog();
}

function updateLog() {
  const data = JSON.parse(localStorage.getItem('pomolog') || '{}');
  const logs = [];
  logs.push(`🎯 Focus sessions today: ${data.dailyCount || 0}`);
  logs.push(`🔥 Current streak: ${data.streak || 0} day${data.streak === 1 ? '' : 's'}`);
  const total = data.totalSessions || 0;
  if (total >= 15) logs.push(`🏆 Focus Pro!`);
  else if (total >= 10) logs.push(`🥈 Consistency Hero!`);
  else if (total >= 5) logs.push(`🏅 Newbie No More!`);
  logContainer.innerHTML = logs.map(l => `<div>${l}</div>`).join('');
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString();
}

musicToggle.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  musicToggle.textContent = musicEnabled ? '🔊' : '🔇';
  if (musicEnabled && isRunning && !isBreakMode && !spotifyActive) backgroundAudio.play().catch(() => {});
  if (!musicEnabled) backgroundAudio.pause();
});

workPlus.addEventListener('click', () => {
  let val = getWorkTime();
  if (val < 60) workDisplay.textContent = val + 1;
});
workMinus.addEventListener('click', () => {
  let val = getWorkTime();
  if (val > 1) workDisplay.textContent = val - 1;
});
breakPlus.addEventListener('click', () => {
  let val = getBreakTime();
  if (val < 60) breakDisplay.textContent = val + 1;
});
breakMinus.addEventListener('click', () => {
  let val = getBreakTime();
  if (val > 1) breakDisplay.textContent = val - 1;
});

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

timeleft = getWorkTime() * 60;
updateDisplay();
