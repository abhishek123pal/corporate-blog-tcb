import { getSiteSettings } from "@/services/settings.service"
import AboutClient from "@/components/features/AboutClient"

export default async function AboutPage() {
  const settingsRes = await getSiteSettings()
  const settings    = settingsRes.success ? settingsRes.data : null

  return (
    <AboutClient
      githubUrl={settings?.githubUrl   || "https://github.com"}
      linkedinUrl={settings?.linkedinUrl || "https://linkedin.com"}
    />
  )
}