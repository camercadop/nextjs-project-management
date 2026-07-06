import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { t } from "@/lib/i18n-server"

const registrationEnabled = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b">
        <span className="text-xl font-bold tracking-tight">ProjectHub</span>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t('landing_login')}</Link>
          </Button>
          {registrationEnabled && (
            <Button size="sm" asChild>
              <Link href="/register">{t('landing_register')}</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight">
          {t('landing_title')}
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">
          {t('landing_description')}
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href={registrationEnabled ? "/register" : "/login"}>
            {registrationEnabled ? t('landing_cta') : t('landing_login')}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} ProjectHub
      </footer>
    </div>
  )
}
