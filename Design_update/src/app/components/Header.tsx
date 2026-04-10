import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "РЭУ им. Г.В. Плеханова", subtitle = "Виртуальный тур по кампусу" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-slate-800 dark:to-slate-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="text-sm text-white/80">{subtitle}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
