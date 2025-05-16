"use server"

import { sendSuggestionThankYouEmail } from "@/lib/email"

interface SuggestionData {
  name: string
  email: string
  suggestion: string
}

interface SubmitResult {
  success: boolean
  error?: string
}

export async function submitSuggestion(data: SuggestionData): Promise<SubmitResult> {
  try {
    // Validate input
    if (!data.name || !data.email || !data.suggestion) {
      return { success: false, error: "All fields are required" }
    }

    // Format data for Discord webhook
    const payload = {
      embeds: [
        {
          title: "New Suggestion",
          color: 3447003, // Blue color
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
              name: "Suggestion",
              value: data.suggestion,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "PCPartPickerBD Suggestion System",
          },
        },
      ],
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_SUGGESTION_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("Missing DISCORD_SUGGESTION_WEBHOOK_URL environment variable")
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
      return { success: false, error: "Failed to send suggestion to our team" }
    }

    // Send thank you email (non-blocking, won't affect success response)
    try {
      // We don't await this to ensure the function continues even if email fails
      sendSuggestionThankYouEmail(data.name, data.email).catch((error) => {
        console.error("Error sending thank you email:", error)
      })
    } catch (emailError) {
      // Log error but don't fail the submission
      console.error("Failed to send thank you email:", emailError)
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting suggestion:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
