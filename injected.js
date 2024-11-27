console.log("Injector script is now running...");

// Intercepting fetch requests made by the page
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    try {
        if (args[0].toString() === "https://catalog.awsevents.com/api/myData") {

            console.debug('Fetch request intercepted:', args[0]);

            const response = await originalFetch.apply(this, args);

            // Clone the response since it can only be consumed once
            const clonedResponse = response.clone();

            // Check if the response has a body and is JSON
            if (clonedResponse.body) {
                const contentType = clonedResponse.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await clonedResponse.json();
                        console.debug('Intercepted fetch response:', data);

                        // Send to background script
                        window.postMessage({
                            type: "response_data",
                            data: data,
                            url: args[0]
                        })
                    } catch (parseError) {
                        console.error('JSON parsing error:', parseError);
                    }
                }
            }
            return response;
        } else {
            return originalFetch.apply(this, args);
        }
    } catch (error) {
        console.error('Fetch interceptor error:', error);
        throw error;
    }
};

console.log('Injector installed before DOM load.');

console.log("Injector Script completed.");