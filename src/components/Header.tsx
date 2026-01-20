"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const { mounted } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    const updateIsDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    updateIsDark();

    // Watch for class changes to ensure logo updates
    const observer = new MutationObserver(updateIsDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) {
    return (
      <header>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-16 w-16 flex-shrink-0 bg-muted animate-pulse rounded" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-orbitron)', letterSpacing: '0.05em', fontWeight: 700 }}>
                  CryptoQuick
                </h1>
                <p className="text-muted-foreground mt-1">
                  Minimalistic TOP 10 cryptocurrencies tracker
                </p>
              </div>
            </div>
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Link href="/" className="flex-shrink-0">
              <img
                src={isDark ? "/logo_light.png" : "/logo_dark.png"}
                alt="CryptoQuick Logo"
                width={64}
                height={64}
                className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-orbitron)', letterSpacing: '0.05em', fontWeight: 700 }}>
                CryptoQuick
              </h1>
              <p className="text-muted-foreground mt-1 ml-1">
                Minimalistic TOP 10 cryptocurrencies tracker
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
