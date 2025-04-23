"use server"

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
    const webhookUrl =
      "https://discord.com/api/webhooks/1364643048528810096/w6lA216KNmhaUWuwadzB9m9rWcn3Yhx3PMu-kF2CCJyEUqBVFovQcrsivwKnCJ1r0CqG"
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

    return { success: true }
  } catch (error) {
    console.error("Error submitting suggestion:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
