'use strict';

var
  minute = 24,
  second = 60,
  interval = undefined,
  pomodoroCount = 0,
  breakCount = 0,
  pomodoroDoneEvent = new Event('pomodoroDone'),
  breakDoneEvent = new Event('breakDone'),
  types = {
    POMODORO: 'Pomodoro',
    BREAK: 'break'
  },
  audio = new Audio('/audio/alarm.mp3'),
  title = document.getElementsByTagName("title")[0],
  timer = document.getElementById('timer'),
  numOfPomodoro = document.getElementById('pomodoro-done'),
  mainButton = document.getElementById('mainButton'),
  pauseButton = document.getElementById('pauseButton'),
  updateQueue = [];

function updateUi() {
  while (updateQueue.length > 0) {
    updateQueue.pop()();
  }

  requestAnimationFrame(updateUi);
}

function setDomElementText(element, text) {
  updateQueue.push(function () {
    element.textContent = text;
  });
}

function updatePomodoroCount() {
  ++pomodoroCount;
  setDomElementText(numOfPomodoro, numOfPomodoro.textContent + "X ")
}

function breakDoneListener (e) {
  ++breakCount;
}

function startTheDay() {
  if (timer.isReset) {
    clearInterval(interval);
    updateTimer(25, 0, types.POMODORO);
    setDomElementText(mainButton, "Start your Pomorodo!");
    timer.isReset = false;
    //When the user resets we pause the timer
    timer.isPause = true;
  } else {
    setDomElementText(mainButton, "Reset");
    timer.isReset = true;
    startPomodoro();
    timer.isPause = false;
  }
  updatePauseButton();
}

function updateTimer(minute, second, type) {
  var
    time = checkTime(minute) + ":" + checkTime(second);

  setDomElementText(timer, time);
  if (type === types.POMODORO) {
    setDomElementText(title, 'Pomodoro (' + time + ')');
  } else if (type === types.BREAK) {
    setDomElementText(title, 'Break (' + time + ')');
  }
}

function checkTime(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function startPomodoro() {
  var
    message = '1 Pomodoro is done! Now take a 5-minute short-break!';

  initPomodoro();
  if (pomodoroCount > 0 && pomodoroCount % 3 === 0) {
    message = '4 Pomodoro is done! Now take a 15-minute long-break!';
  }
  interval = setInterval(startTimer, 1000, types.POMODORO, doneNInvokeNextStep, message, startBreak, pomodoroDoneEvent);
}

function initPomodoro() {
  initTimer(24, 60);
}

function initTimer(min, sec) {
  minute = min;
  second = sec;
}

function startTimer(type, doneNInvokeNextStep, message, nextStep, event) {
  if (timer.isPause) {
    return;
  }
  --second;
  updateTimer(minute, second, type);

  if (second !== 0) {
    return;
  }

  second = 59;
  if (minute === 0) {
    if (event) {
      timer.dispatchEvent(event);
    }
    doneNInvokeNextStep(message, nextStep);
    return;
  }

  --minute;
}

function doneNInvokeNextStep(message, nextStep) {
  displayNotification(message);
  clearInterval(interval);
  nextStep();
}

function displayNotification(message) {
  if (!('Notification' in window)) {
    alert(message);
    bing();
  } else if (Notification.permission === 'granted') {
    new Notification(message);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      if (permission === 'granted') {
        new Notification(message);
      }
    });
  } else {
    alert(message);
    bing();
  }
}

function bing() {
  audio.play();
}

function startBreak() {
  var
    message = 'Break is done! Now start another Pomodoro';

  if (pomodoroCount > 0 && pomodoroCount % 4 === 0) {
    initLongBreak();
  } else {
    initShortBreak();
  }
  interval = setInterval(startTimer, 1000, types.BREAK, doneNInvokeNextStep, message, startPomodoro, breakDoneEvent);
}

function initLongBreak() {
  initTimer(14, 60);
}

function initShortBreak() {
  initTimer(4, 60);
}

function pauseTimer() {
  timer.isPause = !timer.isPause;
  updatePauseButton();
}

function updatePauseButton(){
  /*
    At this point,
    if isReset is true Then that mean POMODORO is active so we show the pauseButton
    else POMODORO is not active so we don't need the pauseButton so we hide it
   */
  var
    pauseButtonStyle = timer.isReset ? 'inline' : 'none',
    pauseButtonText = timer.isPause ? 'Resume' : 'Pause';

  pauseButton.style.display = pauseButtonStyle;
  setDomElementText(pauseButton, pauseButtonText);
}

(function () {
  timer.isReset = false;
  timer.isPause = false;
  timer.update = function (minute, second, type) {
    var time = checkTime(minute) + ":" + checkTime(second);
    setDomElementText(timer, time);
    if (type === types.POMODORO) {
        setDomElementText(title, "Pomodoro (" + time + ")");
    } else if (type === types.BREAK) {
        setDomElementText(title, "Break (" + time + ")");
    }
  };

  timer.addEventListener('pomodoroDone', updatePomodoroCount);
  timer.addEventListener('breakDone', breakDoneListener);

  requestAnimationFrame(updateUi);
})();
