// create alarm for watchdog check on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled....');
  checkNetworkSpeed();
  scheduleWatchdog();
});

// Check watchdog and reschedule if needed
chrome.runtime.onStartup.addListener(() => {
  console.log('onStartup....');
  checkNetworkSpeed();
  // check if watchdog is scheduled
  chrome.alarms.get('watchdog', (alarm) => {
    if (alarm) {
      console.log('watchdog is scheduled');
    } else {
      scheduleWatchdog();
    }
  }
  );
});

// alarm listener
chrome.alarms.onAlarm.addListener(alarm => {
  // if watchdog is triggered, first check if there is internet available
  if (alarm && alarm.name === 'watchdog') {
    console.log('watchdog triggered');
    // network is down, check again
    if (!navigator.onLine) {
      checkNetworkSpeed();
    }
    chrome.alarms.get('refresh', alarm => {
      if (alarm) {
        console.log('Refresh alarm exists. Yay.');
      } else {
        // if it is not there, start a new request and reschedule refresh alarm
        console.log("Refresh alarm doesn't exist, starting a new one");
        scheduleRequest();
      }
    });
  } else if (alarm && alarm.name === 'refresh') {
    console.log('Refresh alarm triggered');
    checkNetworkSpeed();
  }
});

// schedule a new fetch every 30 minutes
function scheduleRequest() {
  console.log('schedule refresh alarm to 30 minutes...');
  chrome.alarms.create('refresh', { periodInMinutes: 30 });
}

// schedule a watchdog check every 5 minutes
function scheduleWatchdog() {
  console.log('schedule watchdog alarm to 5 minutes...');
  chrome.alarms.create('watchdog', { periodInMinutes: 5 });
}

// function to change the icon of the extension based on status
function changeIcon(status) {
  if (status === "green") {
    // set green color
    chrome.action.setIcon({ path: 'icons/green.png' });
    chrome.action.setTitle({ title: 'Network speed is good' });
  }
  if (status === "yellow") {
    // set yellow color
    chrome.action.setIcon({ path: 'icons/yellow.png' });
    // change title to show warning
    chrome.action.setTitle({ title: 'Warning: Slow Internet' });
  }
  if (status === "red") {
    // set red color
    chrome.action.setIcon({ path: 'icons/red.png' });
    // change title to show warning
    chrome.action.setTitle({ title: 'Warning: No Internet' });
  }
}

/* check internet connection using fetch
* return speed in Mbps
* testUrl: url to test internet connection
*/
async function checkResponseTime(testURL) {
  //clear console
  console.clear();
  let time1 = performance.now();
  // download test file
  const response = fetch(testURL).then(response => response.blob()).then(blob => {
    // get the size of the file
    const fileSize = blob.size;
    // get the time it takes to download the file
    const time2 = performance.now();
    // download time in seconds
    const downloadTime = (time2 - time1) / 1000;
    // file size in megabits  
    const fileSizeMb = (fileSize / 1000000) * 8;
    // calculate download speed in Mbps
    const downloadSpeed = (fileSizeMb / downloadTime);
    // round to 2 decimal places
    const downloadSpeedRounded = downloadSpeed.toFixed(2);
    // return download speed rounded
    return downloadSpeedRounded;
  });
  return response;
}
// new checkNetworkSpeed function using fetch and detrmin download speed
async function checkNetworkSpeed() {
  if (navigator.onLine) {
    var testURL = 'http://speedtest-nyc1.digitalocean.com/100mb.test';
    var date = (new Date()).toString();
    // remove time zone from date
    date = date.substring(0, date.lastIndexOf('GMT'));
    checkResponseTime(testURL)
      .then(response => {
        if (response > 200) {
          chrome.storage.sync.set({ 'lastNetworkSpeed': response });
          // set network test date
          chrome.storage.sync.set({ 'lastNetworkTest': date });
          // set test url
          chrome.storage.sync.set({ 'lastNetworkTestURL': testURL });
          changeIcon('green');
          return "success";
        } else {
          chrome.storage.sync.set({ 'lastNetworkSpeed': response });
          // set network test date
          chrome.storage.sync.set({ 'lastNetworkTest': date });
          // set test url
          chrome.storage.sync.set({ 'lastNetworkTestURL': testURL });
          changeIcon('yellow');
          return "success";
        }
      })
      .catch(error => {
        console.log('Error: ' + error);
        chrome.storage.sync.set({ 'lastNetworkSpeed ': 0 }, function () {
          console.log('Network error');
        });
        // set network test date
        chrome.storage.sync.set({ 'lastNetworkTest': date });
        // set test url
        chrome.storage.sync.set({ 'lastNetworkTestURL': testURL });
        changeIcon('red');
        return "error";
      });
  } else {
    changeIcon('red');
    return "error";
  }
}
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "refresh")
      // await checkNetworkSpeed(); and then sendResponse(status);
      checkNetworkSpeed().then(response => {
        if(response === "success") {
          sendResponse("success");
          return true;
        } else {
          sendResponse("error");
          return false;
        }
      });
  }
);
