// Tells the UI which providers have API keys configured on the server,
// without leaking the keys themselves. Powers the readiness pill in
// Settings → Moteur IA so Jean-Marc doesn't pick a provider that will 500.

export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    openai:    Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    gemini:    Boolean(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY),
    mock:      true,
    envDefault: process.env.EXTRACTION_PROVIDER ?? null,
  })
}
