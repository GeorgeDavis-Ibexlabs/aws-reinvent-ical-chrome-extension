console.log("Content script is running on the target URL...");

// Listen for messages from the page
window.addEventListener("message", (event) => {

    console.debug('Event - ', event);
    if (!event.data.type) return;

    if (event.data.type === "response_data") {
        // Forward to background script
        chrome.runtime.sendMessage({ 
            type: "response_data", 
            data: event.data.data
        });
    }
});

console.log('Content script installed before DOM load.');

console.log("Content script ran on the target URL.");