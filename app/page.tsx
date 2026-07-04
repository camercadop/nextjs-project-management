import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold text-zinc-900 dark:text-white">ProjectHub</span>
        <nav className="flex gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            Iniciar sesión
          </Link>
          <Link href="/register" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            Registrarse
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Gestiona tus proyectos en equipo, sin complicaciones
        </h1>
        <p className="mt-6 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Organiza workspaces, colabora con tu equipo y lleva el control de tus proyectos en una plataforma simple y rápida.
        </p>
        <Link
          href="/register"
          className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-base font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Comenzar gratis
        </Link>
      </main>

      <footer className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-600">
        © {new Date().getFullYear()} ProjectHub
      </footer>
    </div>
  );
}
