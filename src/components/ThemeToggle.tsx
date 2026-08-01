import { Sun, Moon } from "lucide-react";
import { useTheme, toggleTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const theme = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-amber/50 hover:text-amber"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
