import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// In-memory storage for builds (in a production app, you'd use a database)
const buildStore: Record<string, any> = {}

// Function to generate a short, unique ID
function generateShortId(): string {
  // Generate 6 random bytes and convert to a base64 string
  return crypto.randomBytes(6).toString("base64url")
}

// Clean up old builds periodically (every 24 hours)
// In a real app, you'd use a proper cleanup mechanism
const EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
setInterval(
  () => {
    const now = Date.now()
    Object.entries(buildStore).forEach(([id, build]) => {
      if (now - build.timestamp > EXPIRY_TIME) {
        delete buildStore[id]
      }
    })
  },
  24 * 60 * 60 * 1000,
) // Run once per day

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generate a unique ID for this build
    const buildId = generateShortId()

    // Store the build data with a timestamp
    buildStore[buildId] = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json({ buildId })
  } catch (error) {
    console.error("Error storing build:", error)
    return NextResponse.json({ error: "Failed to store build" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const buildId = request.nextUrl.searchParams.get("id")

    if (!buildId || !buildStore[buildId]) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 })
    }

    return NextResponse.json({ build: buildStore[buildId].data })
  } catch (error) {
    console.error("Error retrieving build:", error)
    return NextResponse.json({ error: "Failed to retrieve build" }, { status: 500 })
  }
}
