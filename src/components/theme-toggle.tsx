"use client";

import { Contrast, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themeConfig: Record<Theme, { label: string; icon: React.ReactNode }> = {
  light: { label: "Hell", icon: <Sun className="h-4 w-4" /> },
  dark: { label: "Dunkel", icon: <Moon className="h-4 w-4" /> },
  system: { label: "System", icon: <Monitor className="h-4 w-4" /> },
  contrast: { label: "Kontrast", icon: <Contrast className="h-4 w-4" /> },
};

const currentIcon: Record<Theme, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
  contrast: <Contrast className="h-4 w-4" />,
};

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "ghost", size: "icon" })}
        aria-label="Theme wechseln"
      >
        {currentIcon[theme]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t} value={t} className="gap-2">
              {themeConfig[t].icon}
              {themeConfig[t].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
