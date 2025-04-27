const timerDisplay = document.getElementById('timer');
const timerTitle = document.getElementById('timerTitle');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const fallingWrapper = document.querySelector('.falling-wrapper');

let countdown;
let timeleft = 25 * 60;
let isRunning = false;
let isBreakMode = false;
let stickerInterval;
let backgroundAudio = new Audio('assets/background.mp3');
backgroundAudio.loop = true;

const workStickers = [
    '🍅', '⏱️', '🎯', '💪',
    '📖', '🖥️', '📚', '📝',
    '⚙️', '📊', '🎧', '🧠',
    '📅', '💡', '🔴', '🚀'
  ];
  const breakStickers = [
    '☕', '🌸', '🌿', '✨',
    '🍃', '🛋️', '📱', '🎶',
    '💆', '🕊️', '🍵', '🎨',
    '🌼', '🧘', '🎉', '🌈'
  ];
  

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

function formatTime(seconds){
    const mins = Math.floor(seconds/60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function updateDisplay(){
    timerDisplay.textContent = formatTime(timeleft);
    document.body.className = isBreakMode ? 'break-mode' : 'work-mode';
    timerTitle.textContent = isBreakMode ? 'Break Timer' : 'Pomodoro Timer';
}

function startTimer(){
    if(isRunning) return;
    isRunning = true;
    startStickerAnimation();
    if (!isBreakMode) {
        backgroundAudio.play().catch(e => console.log('Audio play failed:', e));
    }
    countdown = setInterval(() => {
        if(timeleft <= 0){
            clearInterval(countdown);
            isRunning = false;
            stopStickerAnimation();
            if(isBreakMode){
                playBreakDoneSound();
                switchToWork();
            } else {
                backgroundAudio.pause();
                backgroundAudio.currentTime = 0;
                playSound();
                switchToBreak();
            }
            return;
        }
        timeleft--;
        updateDisplay();
    }, 1000);
}

function pauseTimer(){
    clearInterval(countdown);
    stopStickerAnimation();
    isRunning = false;
    if (!isBreakMode) {
        backgroundAudio.pause();
    }
}

function resetTimer(){
    clearInterval(countdown);
    stopStickerAnimation();
    isRunning = false;
    isBreakMode = false;
    timeleft = 10;
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
    updateDisplay();
}

function switchToBreak(){
    isBreakMode = true;
    timeleft = 5 * 60;
    updateDisplay();
    setTimeout(() => {
        alert("Time's up! Take a 5 minute break.");
    }, 100);
}

function switchToWork(){
    isBreakMode = false;
    timeleft = 10;
    updateDisplay();
    setTimeout(() => {
        alert("Break's over! Time to work.");
    }, 100);
}

function playSound(){
    const audio = new Audio('assets/beep.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function playBreakDoneSound(){
    const audio = new Audio('assets/breakdone.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
}

updateDisplay();
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);