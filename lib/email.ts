import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
export const suggestionEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Suggestion</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }
    h1 {
      color: #0070f3;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      color: #0070f3;
      text-decoration: none;
      margin: 0 10px;
    }
    .unsubscribe {
      font-size: 12px;
      color: #999;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Thank You for Your Suggestion!</h1>
  </div>
  
  <p>Hello ${name},</p>
  
  <p>Thank you for taking the time to share your suggestion with PCPartPickerBD. Your feedback is incredibly valuable to us and helps make our platform better for everyone in the PC building community in Bangladesh.</p>
  
  <p>Our team will review your suggestion carefully. If we decide to implement it, you might see it in a future update!</p>
  
  <p>Feel free to continue exploring our site and using our PC part comparison tools.</p>
  
  <p>Best regards,<br>The PCPartPickerBD Team</p>
  
  <div class="footer">
    <div class="social-links">
      <a href="https://pcpartpickerbd.com">Website</a>
      <a href="https://github.com/s8rr/pcpartpickerbd">GitHub</a>
      <a href="https://unknownport.com">UnknownPort</a>
    </div>
    <p>&copy; ${new Date().getFullYear()} PCPartPickerBD. All rights reserved.</p>
    <p class="unsubscribe">If you no longer wish to receive these emails, you can <a href="mailto:unsubscribe@pcpartpickerbd.com?subject=Unsubscribe&body=Please%20unsubscribe%20me%20from%20all%20emails">unsubscribe here</a>.</p>
  </div>
</body>
</html>
`

export const bugReportEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Bug Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }
    h1 {
      color: #e11d48;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      color: #0070f3;
      text-decoration: none;
      margin: 0 10px;
    }
    .unsubscribe {
      font-size: 12px;
      color: #999;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Thank You for Your Bug Report!</h1>
  </div>
  
  <p>Hello ${name},</p>
  
  <p>Thank you for reporting an issue with PCPartPickerBD. Your attention to detail helps us improve the quality of our platform for all users in Bangladesh.</p>
  
  <p>Our development team has been notified and will investigate the issue. We take all bug reports seriously and will work to resolve it as quickly as possible.</p>
  
  <p>We appreciate your patience and support as we continue to enhance PCPartPickerBD.</p>
  
  <p>Best regards,<br>The PCPartPickerBD Team</p>
  
  <div class="footer">
    <div class="social-links">
      <a href="https://pcpartpickerbd.com">Website</a>
      <a href="https://github.com/unknownprogrammer12/pcpartpickerbd">GitHub</a>
      <a href="https://unknownport.com">UnknownPort</a>
    </div>
    <p>&copy; ${new Date().getFullYear()} PCPartPickerBD. All rights reserved.</p>
    <p class="unsubscribe">If you no longer wish to receive these emails, you can <a href="mailto:unsubscribe@pcpartpickerbd.com?subject=Unsubscribe&body=Please%20unsubscribe%20me%20from%20all%20emails">unsubscribe here</a>.</p>
  </div>
</body>
</html>
`

// Send thank you email for suggestions
export async function sendSuggestionThankYouEmail(name: string, email: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "PCPartPickerBD <noreply@pcpartpickerbd.com>",
      to: [email],
      subject: "Thank You for Your Suggestion to PCPartPickerBD",
      html: suggestionEmailTemplate(name),
      reply_to: "support@pcpartpickerbd.com",
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@pcpartpickerbd.com>",
        "X-Entity-Ref-ID": `suggestion-${Date.now()}`,
      },
    })

    if (error) {
      console.error("Error sending suggestion thank you email:", error)
      return false
    }

    console.log("Suggestion thank you email sent:", data)
    return true
  } catch (error) {
    console.error("Failed to send suggestion thank you email:", error)
    return false
  }
}

// Send thank you email for bug reports
export async function sendBugReportThankYouEmail(name: string, email: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "PCPartPickerBD <noreply@pcpartpickerbd.com>",
      to: [email],
      subject: "Thank You for Your Bug Report to PCPartPickerBD",
      html: bugReportEmailTemplate(name),
      reply_to: "support@pcpartpickerbd.com",
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@pcpartpickerbd.com>",
        "X-Entity-Ref-ID": `bug-report-${Date.now()}`,
      },
    })

    if (error) {
      console.error("Error sending bug report thank you email:", error)
      return false
    }

    console.log("Bug report thank you email sent:", data)
    return true
  } catch (error) {
    console.error("Failed to send bug report thank you email:", error)
    return false
  }
}
