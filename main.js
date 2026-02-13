const assert = require('node:assert');
const { chromium } = require('playwright');
const nodemailer = require('nodemailer');
const emailConfig = require('./email-config');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

(async () => {
  // Ask user which day to track
  console.log('Which day do you want to track?');
  console.log('1 - winchester-mystery-house 5/15');
  console.log('2 - winchester-mystery-house 5/16');
  const dayChoice = await askQuestion('Enter 1 or 2: ');
  
  let url;
  if (dayChoice.trim() === '1') {
    url = 'https://www.hauntednightsevents.com/event-details/winchester-mystery-house-3';
  } else if (dayChoice.trim() === '2') {
    url = 'https://www.hauntednightsevents.com/event-details/winchester-mystery-house-4';
  } else {
    console.log('Invalid choice. Defaulting to option 1.');
    url = 'https://www.hauntednightsevents.com/event-details/winchester-mystery-house-3';
  }
  
  console.log(`Tracking: ${url}`);
  rl.close();
  
  // Setup
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  
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
          user: emailConfig.fromEmail,
          pass: emailConfig.password
      }
  });

  const mailOptions = {
      from: emailConfig.fromEmail,
      to: emailConfig.toEmail,
      subject: 'Ticket Available!',
      text: `${date}\n\nTicket is now in stock!\n\n${url}`
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
