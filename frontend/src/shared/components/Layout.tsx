"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Files,
  Leaf,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

const navigation = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/uploads", label: "Archivos", icon: Files }
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background px-4 py-5 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf size={17} />
          </span>
          <span className="text-sm font-semibold tracking-tight">carbonBox</span>
        </Link>

        <div className="mt-10">
          <p className="px-3 text-xs font-medium text-muted-foreground">
            Workspace
          </p>
          <nav className="mt-2 space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto">
          <Separator className="mb-4" />
          <p className="px-2 text-xs leading-5 text-muted-foreground">
            CSV activity data workspace
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-8 lg:px-10">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf size={17} />
              </span>
              carbonBox
            </Link>
            <p className="hidden text-sm text-muted-foreground lg:block">
              Workspace / {pathname === "/" ? "Resumen" : "Archivos"}
            </p>
            <nav className="flex items-center gap-2 lg:hidden">
              <Link href="/" className="rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground">
                Resumen
              </Link>
              <Link href="/uploads" className="rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground">
                Archivos
              </Link>
            </nav>
            <Button asChild size="sm">
              <Link href="/uploads/new">
                <Plus size={15} />
                <span className="hidden sm:inline">Nueva carga</span>
                <span className="sm:hidden">Nuevo</span>
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
