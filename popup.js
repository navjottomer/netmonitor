function setData() {
    chrome.storage.sync.get(['lastNetworkTest', 'lastNetworkSpeed', 'lastNetworkTestURL'], function (result) {
        document.getElementById('lastCheck').innerHTML = "Last Check: </br>" + result.lastNetworkTest;
        document.getElementById('lastSpeed').innerHTML = "Net Speed: </br>" + result.lastNetworkSpeed + " Mbps";
        document.getElementById('testUrl').innerHTML = "Test URL: </br>" + result.lastNetworkTestURL;
        console.log(result);
    });
}
document.addEventListener('DOMContentLoaded', setData);
// onclick event for retry button
document.getElementById('retry').onclick = function () {
    chrome.runtime.sendMessage({ action: "refresh" });
    // Disable retry button and set title to "Request sent"
    document.getElementById('retry').disabled = true;
    document.getElementById('retry').innerHTML = "Request sent";
};