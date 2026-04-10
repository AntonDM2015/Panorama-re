export function Footer() {
  return (
    <footer className="mt-auto py-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2026 РЭУ им. Г.В. Плеханова
          </p>
          <a 
            href="#"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Панель администраторов
          </a>
        </div>
      </div>
    </footer>
  );
}
