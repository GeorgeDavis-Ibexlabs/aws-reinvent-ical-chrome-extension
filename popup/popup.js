window.addEventListener('load', async function () {
    this.document.getElementById('downloadBtn').disabled = true;

    iCalStatus = this.document.getElementById('icalStatus')
    iCalStatus.innerHTML = "Looking for AWS re:Invent schedule... Are you logged in to <a href='https://registration.awsevents.com/'>https://registration.awsevents.com/</a>";        iCalStatus.classList.add("ical-status-red");

    console.log('Popup loaded');

    storage_key = 'awsReinventiCalData'

    chrome.storage.local.get(storage_key, (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data:", chrome.runtime.lastError);
        } else {            
            console.log('Data retrieved from storage:', result[storage_key]);          

            // Create a hidden element
            const hiddenElement = document.createElement("div");

            // Set attributes to make it hidden
            hiddenElement.style.display = "none"; // Hide it from view
            hiddenElement.id = "hiddenElement";  // Optionally give it an ID
            // Retrieve data from storage when the popup loads
            hiddenElement.innerHTML = JSON.stringify(result[storage_key]);

            // Append the hidden element to the body
            document.body.appendChild(hiddenElement);

            console.log("Hidden element created:", hiddenElement);

            this.document.getElementById('downloadBtn').disabled = false;

            iCalStatus = this.document.getElementById('icalStatus')
            iCalStatus.innerHTML = "Found AWS re:Invent schedule data";
            if (iCalStatus.classList.contains("ical-status-red")) {
                iCalStatus.classList.replace("ical-status-red", "ical-status-green");
            }            
        }
    });

    document.getElementById('linkedin').addEventListener('click', () => {
       chrome.tabs.create({ url: "https://www.linkedin.com/in/georgedavisc/" })
    });

    document.getElementById('github').addEventListener('click', () => {
        chrome.tabs.create({ url: "https://github.com/sponsors/gdcrocx" });
    });

    document.getElementById('code').addEventListener('click', () => {
        chrome.tabs.create({ url: "https://github.com/GeorgeDavis-Ibexlabs/aws-reinvent-ical-chrome-extension" });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        
        console.debug('Data: ', document.getElementById("hiddenElement").innerHTML);
        const data = document.getElementById("hiddenElement").innerHTML;
        const fileContent = generateICalContent(data);

        // Create a Blob from the file content (text type here)
        const blob = new Blob([fileContent], { type: 'text/calendar' });

        // Create an object URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'aws_reinvent.ical';  // Specify the file name

        // Programmatically click the link to trigger the download
        link.click();

        // Revoke the object URL to release resources
        URL.revokeObjectURL(url);
    });

});

// Skeleton iCal Header and Footer
function generateSkeletonIcalHeader() {
    return "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AWS re:Invent Calendar//EN";
}

function generateSkeletonIcalFooter() {
    return "\nEND:VCALENDAR";
}

// Function to fold long lines to fit iCal format (CRLF every 75 bytes)
function foldLongLines(text, lineLength = 75) {
    let foldedLines = [];
    let start = 0;

    while (start < text.length) {
        // Slice the text to fit the current line length
        let line = text.slice(start, start + lineLength);
        foldedLines.push(line);
        start += lineLength;
    }

    // Join the lines with CRLF followed by a space for continuation
    return foldedLines.join("\r ");
}

// Function to remove a delimiter from text
function removeDelimiter(delimiter, text, replace = '') {
    return text.replace(delimiter, replace);
}

// Create iCal Event
function createIcalEvent(eventUid, eventStart, eventEnd, eventTitle, eventDesc, eventLocation, eventUrl) {
    let title = foldLongLines(eventTitle, 67);
    let desc = foldLongLines(eventDesc, 63);
    let location = foldLongLines(removeDelimiter(' | ', eventLocation, ', '), 65);

    return `\nBEGIN:VEVENT\nUID:${eventUid}\nDTSTAMP:${eventStart}\nDTSTART:${eventStart}\nDTEND:${eventEnd}\nSUMMARY:${title}\nDESCRIPTION:${desc}\nLOCATION:${location}\nURL:${eventUrl}\nEND:VEVENT`;
}

// Read the schedule JSON file
function generateICalContent(data) {

    let scheduleDict = JSON.parse(data);
    if (scheduleDict) {
        let scheduleIcalText = "";

        // Loop through schedule items and create iCal events
        scheduleDict.mySchedule.forEach(scheduleEnrolledItem => {
            scheduleEnrolledItem.times.forEach(scheduleEnrolledItemTime => {
                let timeEventStart = new Date(scheduleEnrolledItemTime.utcStartTime).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
                let timeEventEnd = new Date(scheduleEnrolledItemTime.utcEndTime).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

                scheduleIcalText += createIcalEvent(
                    scheduleEnrolledItem.sessionID,
                    timeEventStart,
                    timeEventEnd,
                    scheduleEnrolledItem.title,
                    scheduleEnrolledItem.abstract,
                    scheduleEnrolledItem.room_name,
                    "https://tinyurl.com/4pvwp739?search=" + scheduleEnrolledItem.code
                );
            });
        });

        // Generate the full iCal file content
        let icalFileContent = generateSkeletonIcalHeader();
        icalFileContent += scheduleIcalText;
        icalFileContent += generateSkeletonIcalFooter();

        return icalFileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n')
    }
};