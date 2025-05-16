"use server"

import { sendBugReportThankYouEmail } from "@/lib/email"

interface BugReportData {
  name: string
  email: string
  bugType: string
  description: string
  stepsToReproduce: string
}

interface SubmitResult {
  success: boolean
  error?: string
}

export async function submitBugReport(data: BugReportData): Promise<SubmitResult> {
  try {
    // Validate input
    if (!data.name || !data.email || !data.bugType || !data.description) {
      return { success: false, error: "Required fields are missing" }
    }

    // Get bug type label
    const bugTypeLabels: Record<string, string> = {
      ui: "UI/Display Issue",
      functionality: "Functionality Not Working",
      performance: "Performance Issue",
      data: "Incorrect Data",
      other: "Other",
    }

    const bugTypeLabel = bugTypeLabels[data.bugType] || data.bugType

    // Format data for Discord webhook
    const payload = {
      embeds: [
        {
          title: "New Bug Report",
          color: 15158332, // Red color
          fields: [
            {
              name: "Name",
              value: data.name,
              inline: true,
            },
            {
              name: "Email",
              value: data.email,
              inline: true,
            },
            {
              name: "Bug Type",
              value: bugTypeLabel,
              inline: true,
            },
            {
              name: "Description",
              value: data.description,
            },
            {
              name: "Steps to Reproduce",
              value: data.stepsToReproduce || "Not provided",
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "PCPartPickerBD Bug Report System",
          },
        },
      ],
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_BUG_REPORT_WEBHOOK_URL

    // Add validation for the environment variable
    if (!webhookUrl) {
      console.error("Missing DISCORD_BUG_REPORT_WEBHOOK_URL environment variable")
      return { success: false, error: "Server configuration error" }
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", errorText)
      return { success: false, error: "Failed to send bug report to our team" }
    }

    // Send thank you email (non-blocking, won't affect success response)
    try {
      // We don't await this to ensure the function continues even if email fails
      sendBugReportThankYouEmail(data.name, data.email).catch((error) => {
        console.error("Error sending thank you email:", error)
      })
    } catch (emailError) {
      // Log error but don't fail the submission
      console.error("Failed to send thank you email:", emailError)
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting bug report:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
