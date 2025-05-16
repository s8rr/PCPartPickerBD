export async function GET() {
  try {
    // Ping Google
    await fetch("https://www.google.com/ping?sitemap=https://pcpartpickerbd.com/sitemap.xml")

    // Ping Bing
    await fetch("https://www.bing.com/ping?sitemap=https://pcpartpickerbd.com/sitemap.xml")

    return new Response(JSON.stringify({ success: true, message: "Sitemap pinged successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Failed to ping sitemap" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
