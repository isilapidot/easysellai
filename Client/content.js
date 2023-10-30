window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && event.data.type === "FROM_PAGE") {
        chrome.runtime.sendMessage(event.data, function(response) {
        window.postMessage({ type: "FROM_EXTENSION", command: response.command, data: response.data }, "*");
        });
    }
}, false);  

function getDaySuffix(n) {
    if (n >= 11 && n <= 13) {
        return n + 'th';
    }
    switch (n % 10) {
        case 1:  return n + 'st';
        case 2:  return n + 'nd';
        case 3:  return n + 'rd';
        default: return n + 'th';
    }
}


window.addEventListener('validateAccessKey', (event) => {
const { accessKey } = event.detail;

fetch('https://api.easysell.ai/validate-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_key: accessKey })
})
    .then(response => response.json())
    .then(data => {
    date = "";
    if (data.success) {
        // The access key is valid, allow user to use the extension
        // console.log('Access key is valid');
        const expiryDate = new Date(data.expires);
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        const day = expiryDate.getDate();
        const monthIndex = expiryDate.getMonth();
        date = monthNames[monthIndex] + ' ' + getDaySuffix(day);
        // console.log(date);
    } else {
        // The access key is not valid, show an error message
        console.log('Access key is not valid');
    }

    // Dispatch a custom event with the validation result and expiry time
    const event = new CustomEvent('accessKeyValidated', { detail: { success: data.success, expiry_time: date } });
    window.dispatchEvent(event);
    })
    .catch(error => {
    console.error('Error:', error);

    // Dispatch a custom event with the validation result
    const event = new CustomEvent('accessKeyValidated', { detail: { success: false } });
    window.dispatchEvent(event);
    });
});

// Get the body element
let body = document.body;

// Change the width and margin
body.style.setProperty('width', '75%', 'important');
body.style.setProperty('margin-right', '25%', 'important');

// Add an event listener for the 'sidebarVisibilityChanged' event
window.addEventListener('sidebarVisibilityChanged', (event) => {
    // Get the new visibility from the event detail
    const isVisible = event.detail.isVisible;

    // Resize the body of the page based on the new visibility
    if (isVisible) {
        // If the sidebar is visible, resize the body to 75%
        document.body.style.width = '75%';
        document.body.style.marginRight = '25%';
    } else {
        // If the sidebar is not visible, resize the body to 100%
        document.body.style.width = '100%';
        document.body.style.marginRight = '0';
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleSidebar") {
        // Dispatch a custom window event
        const event = new CustomEvent('toggleSidebar');
        window.dispatchEvent(event);
        body.style.setProperty('width', '75%', 'important');
        body.style.setProperty('margin-right', '25%', 'important');
    }
});


// Create a div to host our React app
let appHost = document.createElement('div');

// Create a link element for the CSS
let link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('458.css');
document.head.appendChild(link);

// Create a script element to load our React app
let script = document.createElement('script');
script.src = chrome.runtime.getURL('458.js');
document.body.appendChild(script);



// Define the version you want to check
const version = "0.1.1";

// Send a POST request with the version as the body
fetch('https://api.easysell.ai/updated', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ version: version }),
})
.then(response => response.json())
.then(data => {
  // console.log('Updated status is set to ' + data.updated);
  // Dispatch the event with the updated status
  window.dispatchEvent(new CustomEvent('updated', { detail: data.updated }));
})
.catch((error) => {
  console.error('Error:', error);
});

let isLegit = false;
// Iterate over each element
async function openUnreadMessages() {
    /// Find all elements with aria-label="Mark as read"
    let markAsReadElements = document.querySelectorAll('[aria-label="Mark as read"]');

    // console.log(`Found ${markAsReadElements.length} "Mark as read" elements`);

    for (let i = 0; i < markAsReadElements.length; i++) {
        // Get the parent <a> element
        let targetElement = markAsReadElements[i];
        while (targetElement && targetElement.tagName !== 'A') {
            targetElement = targetElement.parentElement;
        }
    
        // "Click" the target element if it's not null
        if (targetElement) {
            // console.log('Found a parent <a> tag, clicking it');
            targetElement.click();
            // Pause for a random amount of time between 1 second and 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            if (await checkMarkAsPending()) {
                // console.log("Marking isLegit as true")
                isLegit = true;
                break;
            } else {
                // console.log("Marking isLegit as false")
                isLegit = false;
            }
        } else {
            // console.log('Did not find a parent <a> tag');
        }
    }
}


async function checkForUnreadMessages() {
    // Find all elements with aria-label="Mark as read"
    let markAsReadElements = document.querySelectorAll('[aria-label="Mark as read"]');

    // console.log(`Found ${markAsReadElements.length} "Mark as read" elements`);

    // If there are no "Mark as read" elements, then there are no unread messages
    return markAsReadElements.length > 0;
}

let product_info = "";

// Function to scrape product information
function scrapeProductInformation() {
    // Get all spans with a certain style name
    let productInfoSpans = Array.from(document.querySelectorAll('span[style*="--base-line-clamp-line-height:"]'));

    // Initialize an empty array to store product information
    let productInfo = [];

    // Iterate over each span
    productInfoSpans.forEach(span => {
        // Get the ancestor <a> element
        let ancestorElement = span;
        while (ancestorElement && ancestorElement.tagName !== 'A') {
            ancestorElement = ancestorElement.parentElement;
        }

        // Check if the ancestor <a> element has href attribute that contains "facebook.com/marketplace/item"
        if (ancestorElement && ancestorElement.getAttribute('href').includes('facebook.com/marketplace/item')) {
            // Check if the span has text and the text is not "Marketplace"
            if (span && span.innerText && span.innerText !== 'Marketplace') {
                // Add the text to the productInfo array
                productInfo.push(span.innerText);
            }
        }
    });

    // Set the global product_info variable to the first element of productInfo array
    product_info = productInfo[0];

    // Log the product information
    // console.log(productInfo);
}

// Wait for 5 seconds (5000 milliseconds) before scraping product information
// setTimeout(scrapeProductInformation, 5000);

let customer_name = "";

// Function to scrape customer names
function scrapeCustomerNames() {
    // Get all spans with a certain style name
    let customerNameSpans = Array.from(document.querySelectorAll('span[style*="-webkit-line-clamp: 3;"]'));

    // Initialize an empty array to store customer names
    let customerNames = [];

    // Iterate over each span
    customerNameSpans.forEach(span => {
        // Get the style of the parent element
        let parentStyle = span.parentElement.getAttribute('style');

        // Check if the span has text and the text is not "Marketplace" and "Send a quick response"
        // And also check if the parent style contains "--base-line-clamp-line-height: 19.9995px;"
        if (
            span && 
            span.innerText && 
            span.innerText !== 'Marketplace' && 
            span.innerText !== 'Send a quick response' &&
            parentStyle && 
            parentStyle.includes('--base-line-clamp-line-height: 19.9995px;')
        ) {
            // Add the text to the customerNames array
            customerNames.push(span.innerText);
        }
    });

    // Set the global customer_name variable to the first element of customerNames array
    customer_name = customerNames[0];

    // Log the customer names
    // console.log(customerNames);
}
async function markAsPending() {
    // Find the div with the aria-label "Mark as pending"
    let markAsPendingDiv = document.querySelector('div[aria-label="Mark as pending"]');

    // Check if the div was found
    if (markAsPendingDiv) {
        // Click the div
        markAsPendingDiv.click();
        // console.log("Clicked on 'Mark as pending'");
    } else {
        // console.log("'Mark as pending' not found");
    }
}

async function checkMarkAsPending() {
    // Find the div with the aria-label "Mark as pending"
    let markAsPendingDiv = document.querySelector('div[aria-label="Mark as pending"]');

    // Check if the div was found
    if (markAsPendingDiv) {
        // Return True
        // console.log("Mark as pending confirmed. Returning true.");
        return true;

    } else {
        // console.log("'Mark as pending' not found. Returning false.");
        return false;
    }
}


let previousMessages = [];

// Function to scrape messages
async function scrapeMessages() {
    // Get all divs with a style that contains 'mwp-reply-background-color'
    let messageDivs = Array.from(document.querySelectorAll('div[style*="--mwp-reply-background-color:"]'));

    // Initialize an empty array to store messages
    let messages = [];

    // Iterate over each div
    messageDivs.forEach(div => {
        // Get the first child element of the div
        let child = div.firstElementChild;

        // Check if the child element exists and has text
        // And also check if the child element itself does not have any child elements
        if (child && child.innerText && child.children.length === 0) {
            // Check if the style of the div contains 'mw-blockquote'
            if (div.style.cssText.indexOf('mw-blockquote') !== -1) {
                messages.push("Buyer: " + child.innerText);
            } else {
                messages.push("Seller: " + child.innerText);
            }
        }
    });

    // Log the messages
    // console.log(messages);

    // Get the data from Chrome storage
    const result = await new Promise(resolve => {
        chrome.storage.sync.get(['negotiationStyle', 'meetingPlace', 'dateInputs', 'accessKey', 'timeZone', 'priceMargin'], function (result) {
            resolve(result);
        });
    });

    let negotiation_style = result.negotiationStyle;
    let meeting_place = result.meetingPlace;
    let available_dates = result.dateInputs;
    let access_key = result.accessKey;
    let time_zone = result.timeZone;
    // Extract the price from the product info using a regular expression
    let price_match = product_info.match(/\d+(\.\d+)?/);
    if (!price_match) {
        console.error('Could not find a price in the product info:', product_info);
        return;
    }

    // Convert the price to a number
    let price = parseFloat(price_match[0]);

    let price_margin = result.priceMargin;

    // Calculate the minimum desired price
    let min_price = (1 - price_margin*0.01) * price;

    // console.log('Minimum price:', min_price);


    // Continue the rest of your code using these variables...

    // Send a POST request to the Python server with the messages and new fields
    const data = await fetch('https://api.easysell.ai/generate-reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: messages,
            product_info: product_info,
            customer_name: customer_name,
            negotiation_style: negotiation_style,
            meeting_place: meeting_place,
            available_dates: available_dates, // Include the available dates in the request body
            access_key: access_key,
            time_zone: time_zone,
            min_price: min_price
        })
    }).then(response => response.json());

    // Log the reply
    // console.log(data.reply);

    if (data.reply === 'Email sent') {
        console.log("Email sent to seller")
        previousMessages = messages;
        // console.log(previousMessages);
        await markAsPending();
    } else {
        let divElement = document.querySelector('div[data-lexical-editor="true"]');
        if (divElement) {
            // console.log('Editable div found:', divElement);

            // Simulate a focus event
            let focusEvent = new Event('focus');
            divElement.dispatchEvent(focusEvent);
            // console.log('Focus event dispatched');

            // Initialize textToInsert with the original reply
            let textToInsert = data.reply;

            // Check if the reply starts with "Seller: " or "Buyer: "
            if (data.reply.startsWith("Seller: ") || data.reply.startsWith("Buyer: ")) {
                // Find the index of the first ":"
                let splitIndex = data.reply.indexOf(':');

                // Check if ":" exists in the string
                if (splitIndex !== -1) {
                    // Get the part of the string after the first ":" and trim leading and trailing whitespace
                    textToInsert = data.reply.substring(splitIndex + 1).trim();
                }
            }


            await new Promise(resolve => setTimeout(resolve, 1000));
            messages.push("Seller: " + textToInsert);
            previousMessages = messages;
            // console.log(previousMessages);

            // Create a new input event
            let inputEvent = new InputEvent('input', {
                data: textToInsert,
                inputType: 'insertText'
            });

            // Dispatch the input event
            divElement.dispatchEvent(inputEvent);
            // console.log('Input event dispatched');

            // Create a new 'keydown' event for the 'Enter' key
            let enterEvent = new KeyboardEvent('keydown', {
                keyCode: 13,
            });

            // Dispatch the 'Enter' event
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            divElement.dispatchEvent(enterEvent);
            // console.log('Enter event dispatched');
        } else {
            // console.log('Editable div not found');
        }
    }
}

async function checkForNewMessages() {
    // Get all divs with a style that contains 'mwp-reply-background-color'
    let messageDivs = Array.from(document.querySelectorAll('div[style*="--mwp-reply-background-color:"]'));

    // Initialize an empty array to store messages
    let messages = [];

    // Iterate over each div
    messageDivs.forEach(div => {
        // Get the first child element of the div
        let child = div.firstElementChild;

        // Check if the child element exists and has text
        // And also check if the child element itself does not have any child elements
        if (child && child.innerText && child.children.length === 0) {
            // Check if the style of the div contains 'mw-blockquote'
            if (div.style.cssText.indexOf('mw-blockquote') !== -1) {
                messages.push("Buyer: " + child.innerText);
            } else {
                messages.push("Seller: " + child.innerText);
            }
        }
    });

    // Compare the lengths of messages and previousMessages
    if (messages.length !== previousMessages.length) {
        // A new message has been found
        // console.log('New message detected:', messages[messages.length - 1]);
        return true;
    }

    // No new messages were found
    return false;
}


function convertToHours(timeString) {
    const unit = timeString.slice(-1);
    const value = Number(timeString.slice(0, -1));

    switch (unit) {
        case 'm':
            return value / 60;
        case 'h':
            return value;
        case 'd':
            return value * 24;
        case 'w':
            return value * 24 * 7;
        case 'y':
            return value * 24 * 365;
        default:
            return null;
    }
}

function scrapeFollowUpTimes() {
    // Get all elements with the specific style
    const styledElements = Array.from(document.querySelectorAll('[style*="--base-line-clamp-line-height: 19.9995px;"]'));
    // console.log(`Found ${styledElements.length} styled elements`);

    // Filter for elements with a specific parent
    const parentElements = styledElements.filter(element => {
        let currentNode = element;
        while (currentNode.parentNode) {
            currentNode = currentNode.parentNode;
            if (currentNode.tagName === 'A' && (currentNode.getAttribute('href') || '').includes('/marketplace/t/')) {
                return true;
            }
        }
        return false;
    });

    // console.log(`Found ${parentElements.length} parent elements`);

    // Find the 3rd sibling element, get its text, and convert it to hours
    const followUpTimes = parentElements.map(element => {
        const sibling = element.parentNode.children[2];
        if (sibling) {
            const textElement = sibling.children[2];
            if (textElement) {
                return convertToHours(textElement.textContent);
            }
        }
        // console.log('No text found for an element');
        return null;  // Return null if the text couldn't be found
    });

    // console.log(`Follow up times: ${followUpTimes}`);
    return {
        parentElements: parentElements,
        followUpTimes: followUpTimes
    };
}

async function checkForFollowUpMessages() {
    // Get all elements with the specific style
    const styledElements = Array.from(document.querySelectorAll('[style*="--base-line-clamp-line-height: 19.9995px;"]'));
    // console.log(`Found ${styledElements.length} styled elements`);

    // Filter for elements with a specific parent
    const parentElements = styledElements.filter(element => {
        let currentNode = element;
        while (currentNode.parentNode) {
            currentNode = currentNode.parentNode;
            if (currentNode.tagName === 'A' && (currentNode.getAttribute('href') || '').includes('/marketplace/t/')) {
                return true;
            }
        }
        return false;
    });

    // console.log(`Found ${parentElements.length} parent elements`);

    // Retrieve followUpHours from Chrome storage
    const userFollowUpHours = await getFollowUpHours();

    const followUpTimes = parentElements.map(element => {
        const sibling = element.parentNode.children[2];
        if (sibling) {
            const textElement = sibling.children[2];
            if (textElement) {
                return convertToHours(textElement.textContent);
            }
        }
        // console.log('No text found for an element');
        return null;  // Return null if the text couldn't be found
    });

    for (let i = 0; i < followUpTimes.length; i++) {
        if (userFollowUpHours <= followUpTimes[i]) {
            // console.log('Found viable followUpTime and returning true')
            return true;
        }
    }
    // console.log('No viable followUpTime. Returning false.')
    return false;
}

function getFollowUpHours() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['followUpHours'], function(result) {
            resolve(result.followUpHours);
        });
    });
}

async function compareFollowUp() {
    // Retrieve followUpHours from Chrome storage
    const userFollowUpHours = await getFollowUpHours();

    // Get followUpTimes and parentElements
    const { followUpTimes, parentElements } = scrapeFollowUpTimes();

    for (let i = 0; i < followUpTimes.length; i++) {
        if (userFollowUpHours <= followUpTimes[i]) {
            // Click on the corresponding parent element
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
            parentElements[i].click();
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
            if (await checkMarkAsPending()) {
                isLegit = true;
                break;
            } else {
                isLegit = false;
            }
            // console.log(`Clicked on a parent element with follow up time: ${followUpTimes[i]} hours`);
        }
    }
}


async function initialRun() {
    // Wait for a while before scraping product information
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    scrapeProductInformation();

    // Wait for a while before scraping customer name
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    scrapeCustomerNames();

    // Wait for a while before scraping messages
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    await scrapeMessages();

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    // Start checking for new messages
    checkMessages();
}

async function checkMessages() {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    let newMessagesExist = await checkForNewMessages();
    let unreadMessagesExist = await checkForUnreadMessages();
    let followUpMessagesExist = await checkForFollowUpMessages();

    if (!unreadMessagesExist && !followUpMessagesExist && !newMessagesExist) {
        setTimeout(checkMessages, 60 * 1000); // Check again in 1 minute
        return; // Exit the function early
    }

    if (await checkMarkAsPending()) {
        // If new messages exist, open and scrape them
        while (newMessagesExist) {
            await processNewMessages();
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            newMessagesExist = await checkForNewMessages();
        }
    }
    
    // If unread messages exist, open and scrape them
    if (await checkForUnreadMessages()) {
        await processUnreadMessages();
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    }

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    // If follow-up messages exist, compare follow up times and open messages to follow up to
    if (await checkForFollowUpMessages()) {
        await processFollowUpMessages();
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    }

    // Immediately check for new messages again
    checkMessages();
}

async function processNewMessages() {
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    scrapeProductInformation();

    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    scrapeCustomerNames();

    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    await scrapeMessages();
}

async function processUnreadMessages() {
    // Open unread messages and scrape them
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    await openUnreadMessages();

    if (isLegit) {
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
        scrapeProductInformation();

        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
        scrapeCustomerNames();

        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
        await scrapeMessages();
    }
    isLegit = false;
}

async function processFollowUpMessages() {
    // Compare follow up times and open messages to follow up to
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    await compareFollowUp();

    if (isLegit) {
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
        scrapeProductInformation();

        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
        scrapeCustomerNames();

        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
        await scrapeMessages();
    }
    isLegit = false;
}
  
function checkIsActive() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['accessKey'], async function(result) {
        // console.log('Checking isActive status...');
        const response = await fetch('https://api.easysell.ai/is-active', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessKey: result.accessKey }),
        });
  
        if (response.ok) {
          const data = await response.json();
          // console.log('Received isActive status:', data.isActive);
          resolve(data.isActive);
        } else {
          console.error('Failed to check isActive status:', response);
          reject(response);
        }
      });
    });
}    


function sendHeartbeat() {
    chrome.storage.sync.get(['accessKey'], async function(result) {
      // console.log('Sending heartbeat...');
      const response = await fetch('https://api.easysell.ai/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey: result.accessKey }),
      });
  
      if (response.ok) {
        // console.log('Heartbeat sent successfully!');
      } else {
        console.error('Failed to send heartbeat:', response);
      }
    });
}
  
function deactivateUser() {
chrome.storage.sync.get(['accessKey'], async function(result) {
    // console.log('Deactivating user...');
    const response = await fetch('https://api.easysell.ai/deactivate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey: result.accessKey }),
        });

        if (response.ok) {
        // console.log('User deactivated successfully!');
        } else {
        console.error('Failed to deactivate user:', response);
        }
    });
}

let heartbeatIntervalId = null;
let previousIsOn = false; // Variable to store the previous state

window.addEventListener('toggleSwitchStateChanged', async (event) => {
    const { isOn } = event.detail;
  
    if (isOn) {
      try {
        const isActive = await checkIsActive();
        // console.log('isActive status:', isActive);
  
        if (isActive) {
          console.error('Another session is already active.');
          // Dispatch a custom event to change the switch state
          window.dispatchEvent(new CustomEvent('changeSwitchState', { detail: { isOn: false } }));
          return;
        }
  
        // Check if the user is on the right page
        if (await checkMarkAsPending()) {
            // The switch is on, run the app
            initialRun();
            // console.log('Running the app');
            // Send heartbeat every minute
            heartbeatIntervalId = setInterval(sendHeartbeat, 60 * 1000);
        } else {
            window.dispatchEvent(new CustomEvent('changeSwitchState', { detail: { isOn: false } }));
            deactivateUser();
            alert("Navigate to the marketplace tab and select the conversation where you want to begin. This must be a selling conversation where the product is not marked as pending.");
            // Dispatch a custom even to change the switch state 
            return;
        }
      } catch (error) {
        console.error('Error checking isActive status:', error);
      }
    } else if (previousIsOn) { // Only deactivate if the previous state was 'on'
      // The switch is off, stop the app
      // console.log('Stopping the app');
      // Send deactivate user request
      deactivateUser();
      // Stop sending heartbeat
      if (heartbeatIntervalId) {
        // console.log('Stopping heartbeat...');
        clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = null;
      }

      location.reload();
    }
    
    // Update the previous state
    previousIsOn = isOn;
});