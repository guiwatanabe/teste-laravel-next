"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout, Role } from "@/services/auth";

interface NavBarProps {
  role: Role;
}

export function NavBar({ role }: NavBarProps) {
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}>
        <Link href="/standings">Classificação</Link>
      </Button>
      {role === "admin" && (
        <>
          <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}>
            <Link href="/admin/matches">Partidas</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}>
            <Link href="/admin/teams">Times</Link>
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="text-base font-semibold tracking-tight">
            ⚽ Brasileirão
          </span>
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">Meu Perfil</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={logout}>
            Sair
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="sm:hidden px-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>⚽ Brasileirão</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}