const assert = require('node:assert');
const { chromium } = require('playwright');

(async () => {
  // Setup
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.hauntednightsevents.com/event-details/winchester-mystery-house-3');
  
  assert(await page.title() === 'Winchester Mystery House | Haunted Nights');


  while (true) {
          await new Promise(r => setTimeout(r, 5000));

      // Check if ticketsUnavailable element is visible
      const ticketsUnavailable = page.locator('div[data-hook="tickets-unavailable"]');

      // If ticketsUnavailable is visible, wait 5 seconds and refresh
      if (await ticketsUnavailable.isVisible()) {
          console.log("Tickets unavailable, waiting 5 seconds...");
          await new Promise(r => setTimeout(r, 5000));
          await page.reload();
      } else {
          // ticketsUnavailable is not visible, tickets are available!
          break;
      }
  }

  // The ticket is in stock!
  console.log("Tickets available!");
  const date = new Date().toLocaleString();
  console.log(date);

  // Use twilio to text that a ticket is in stock
  client.messages
      .create({
          body: `${date}\n Ticket!!\nhttps://www.hauntednightsevents.com/event-details/winchester-mystery-house-3`,
          from: '[phone number here]',
          to: '[your phone number here]'
      })
      .then(message => console.log(message.sid));
  
  // Teardown
  await context.close();
  await browser.close();
})();
