let scriptRunCount = 0;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const targetUrl = "https://registration.awsevents.com/flow/awsevents/reinvent24/myagenda/";
    if (changeInfo.status === "complete" && tab.url && tab.url.startsWith(targetUrl)) {

        chrome.action.setBadgeText({ text: scriptRunCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

        chrome.storage.local.get(["awsReinventiCalData"], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving data:", chrome.runtime.lastError);
                scriptRunCount = 0;
                chrome.action.setBadgeText({ text: scriptRunCount.toString() });
            } else {
                console.log("Retrieved settings:", result);
                // Set the count to 1 and update the badge
                scriptRunCount = 1;
                chrome.action.setBadgeText({ text: scriptRunCount.toString() });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log("Received message:", message);
    if (message.type === "response_data") {
        console.log("Received response data:", message.data);

        // Handle successful requests by checking message.data
        if (message.data) {

            // Set the count to 1 and update the badge
            scriptRunCount = 1;
            console.log("Successfully fetched data: ", message.data);

            console.log(typeof(message.data));

            chrome.storage.local.set({ "awsReinventiCalData": message.data }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error saving data:", chrome.runtime.lastError);
                } else {
                    console.log("Settings saved successfully.");
                }
            });
            
        } else {
            scriptRunCount = 0;
            console.log("Error fetching data");
        }
        chrome.action.setBadgeText({ text: scriptRunCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    }
});