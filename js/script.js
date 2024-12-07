const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');

let countdown;
let timeleft = 25*60;
let isRunning = false;

function formatTime(seconds){
    const mins = Math.floor(seconds/60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function updateDisplay(){
    timerDisplay.textContent=formatTime(timeleft);
}

function startTimer(){
    if(isRunning) return;
    isRunning=true;
    countdown = setInterval(() => {
        timeleft--;
        updateDisplay();

        if(timeleft <= 0){
            clearInterval(countdown);
            playSound();
            switchToBreak();
        }
    },1000);
}

function pauseTimer(){
    clearInterval(countdown);
    isRunning = false;
}

function resetTimer(){
    clearInterval(countdown);
    isRunning = false;
    timeleft = 25*60;
    updateDisplay();
}

function switchToBreak(){
    alert("Time's up! Take a 5 min break.");
    timeLeft = 5*60;
    updateDisplay();
}

function playSound(){
    const audio = new Audio('assets/beep.mp3')
    audio.play();
}

startButton.addEventListener('click',startTimer);
pauseButton.addEventListener('click',pauseTimer);
resetButton.addEventListener('click',resetTimer);

updateDisplay();