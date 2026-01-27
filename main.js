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
        // Grab the single day Saturday div or any other you want
        const singleDay = page.locator('div[data-title="saturday single day pass"]');

        // When a ticket is sold out it has a grey background
        // If it does not have a grey background then it is in stock and will stop the program
        await expect(singleDay).toHaveCSS('background-color', 'rgb(241, 242, 242)');

        // If still sold out, wait 5 seconds
        await new Promise(r => setTimeout(r, 5000));

        // Refresh the page
        await page.reload();
    }
  } catch {
    // The ticket is in stock!
    console.log("Failed");
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
