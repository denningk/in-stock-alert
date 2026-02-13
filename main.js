const assert = require('node:assert');
const { chromium } = require('playwright');
const nodemailer = require('nodemailer');
const emailConfig = require('./email-config');

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

  // Configure nodemailer to send email via Gmail
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: emailConfig.user,
          pass: emailConfig.password
      }
  });

  const mailOptions = {
      from: 'keithdenning1@gmail.com',
      to: 'keithdenning1@gmail.com',
      subject: 'Ticket Available!',
      text: `${date}\n\nTicket is now in stock!\n\nhttps://www.hauntednightsevents.com/event-details/winchester-mystery-house-3`
  };

  // Send email
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log('Error sending email:', error);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
  
  // Teardown
  await context.close();
  await browser.close();
})();
