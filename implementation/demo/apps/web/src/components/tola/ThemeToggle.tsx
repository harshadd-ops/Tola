"use client";

import { Button, Tooltip } from "@heroui/react";
import { Moon, Sun } from "@gravity-ui/icons";
import { useSessionStore } from "@/stores/session";

export function ThemeToggle() {
  const theme = useSessionStore((s) => s.theme);
  const toggle = useSessionStore((s) => s.toggleTheme);
  const dark = theme === "dark";
  return (
    <Tooltip delay={300}>
      <Button isIconOnly variant="ghost" aria-label={dark ? "Light theme" : "Dark theme"} onPress={() => toggle()}>
        {dark ? <Sun /> : <Moon />}
      </Button>
      <Tooltip.Content>{dark ? "Light theme" : "Dark theme"} (D)</Tooltip.Content>
    </Tooltip>
  );
}
