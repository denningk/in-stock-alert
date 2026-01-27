const assert = require('node:assert');
const { chromium, devices } = require('playwright');
const { expect } = require('@playwright/test');
const accountSid = '[Account ID goe here]';
const authToken = '[Auth token goes here]';
const client = require('twilio')(accountSid, authToken);

(async () => {
  // Setup
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.hauntednightsevents.com/event-details/winchester-mystery-house-3');
  
  assert(await page.title() === 'Winchester Mystery House | Haunted Nights');

  try {
    while (true) {
        // Check if ticketsUnavailable element is visible
        const ticketsUnavailable = page.locator('text=ticketsUnavailable');

        // If ticketsUnavailable is visible, wait 5 seconds and refresh
        if (await ticketsUnavailable.isVisible()) {
            console.log("Tickets unavailable, waiting 5 seconds...");
        await new Promise(r => setTimeout(r, 5000));
        await page.reload();
        } else {
            // ticketsUnavailable is not visible, tickets are available!
            throw new Error("Tickets available!");
        }
    }
  } catch (error) {
    // The ticket is in stock!
    console.log("Tickets available!");
    const date = new Date().toLocaleString();
    console.log(date);

    // Use twilio to text that a ticket is in stock
    client.messages
        .create({
            body: `${date}\n Ticket!!\nhttps://www.eventeny.com/events/ticket/?id=5563 `,
            from: '[phone number here]',
            to: '[your phone number here]'
        })
        .then(message => console.log(message.sid));
  }
  // Teardown
  await context.close();
  await browser.close();
})();
