import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables for local testing (if running locally)
// We add debug: true to see if the .env file is being loaded correctly
const dotenvConfig = dotenv.config({ debug: true }); 

if (dotenvConfig.error) {
    console.error("CRITICAL ERROR: Failed to load .env file. Check if the file exists in the root directory.");
    process.exit(1);
}

// Set the API Key
// This relies on the SENDGRID_API_KEY being set in the environment
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey || !apiKey.startsWith('SG.')) {
    console.error("\n--- API KEY ERROR ---");
    console.error("API Key (SENDGRID_API_KEY) is missing or invalid.");
    console.error("Please ensure you have created a .env file with SENDGRID_API_KEY=SG.xxxxxxxxxx");
    console.error("Exiting test.");
    process.exit(1);
}

sgMail.setApiKey(apiKey);

// sgMail.setDataResidency('eu'); 
// Uncomment and adjust the line above if your SendGrid account is configured for the EU region.

async function runSendGridTest() {
  const msg = {
    // IMPORTANT: CHANGE THESE TO REAL, VERIFIED VALUES
    to: 'shivengupta11@gmail.com', 
    from: 'shivengupta11@gmail.com', 
    subject: 'SendGrid Test from Render Debug Script',
    text: 'If you receive this email, API communication is working!',
    html: '<strong>If you receive this email, API communication is working!</strong>',
  };
  
  console.log(`Attempting to send email from: ${msg.from} to: ${msg.to}`);
  console.log(`Using API Key starting with: ${apiKey.substring(0, 10)}`);

  try {
    const response = await sgMail.send(msg);
    
    // Success response often comes back with a status code of 202
    if (response[0].statusCode === 202) {
        console.log('\n--- SUCCESS ---');
        console.log('API call successful. Status:', response[0].statusCode);
        console.log('Email should arrive shortly.');
        console.log('The previous issue is isolated to the SMTP protocol/ports (465, 587, 2525).');
    } else {
        console.log('\n--- UNEXPECTED RESPONSE ---');
        console.log('Full Response:', JSON.stringify(response));
    }

  } catch (error) {
    console.log('\n--- ERROR ---');
    console.error('Email failed to send. Full error details below:');
    
    // Log the entire error object, including nested response data if available
    if (error.response?.body) {
        console.error('SendGrid API Error Body:', JSON.stringify(error.response.body, null, 2));
    } else {
        console.error(error);
    }
  }
}

runSendGridTest();
