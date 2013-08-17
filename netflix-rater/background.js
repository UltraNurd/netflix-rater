// Load data file
var ratings;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
		ratings = JSON.parse(xhr.responseText);
	}
}
xhr.open("GET", chrome.extension.getURL('/netflix.json'), true);
xhr.send();

// This is what does the work for a given movie
var tabIds = [];
function rate(movie) {
	var starClass;
	if (movie.rating == 0) {
		starClass = "rvnorec";
	} else {
		starClass = "rv" + movie.rating;
	}
	console.log(movie.url + " " + starClass);
	chrome.tabs.create({"url": movie.url, "active": false}, function(tab) {
		console.log("Opened " + tab.id);
		tabIds.push(tab.id);
		if (tabIds.length > 10) {
			var tabId = tabIds.shift();
			console.log("Removing " + tabId);
			chrome.tabs.remove(tabId);
		}
		chrome.tabs.executeScript(tab.id, {"code": "var star = document.getElementsByClassName('" + starClass + "')[0]; star.click();"});
	});
}

// The action starts when the extension is clicked
var intervalId;
chrome.browserAction.onClicked.addListener(function() {
	// Try to rate each movie every 5 seconds
	clearInterval(intervalId);
	intervalId = setInterval(function() { rate(ratings.shift())}, 5000);
});
