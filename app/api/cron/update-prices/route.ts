import { type NextRequest, NextResponse } from "next/server"
import { updateAllProducts } from "@/lib/update-job"

// This route will be called by a cron job every 24 hours
export async function GET(request: NextRequest) {
  // Verify the request is from a trusted source (optional)
  const authHeader = request.headers.get("authorization")
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Start the update process
    await updateAllProducts()
    return NextResponse.json({ success: true, message: "Update process started" })
  } catch (error) {
    console.error("Error starting update process:", error)
    return NextResponse.json(
      { error: "Failed to start update process", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
