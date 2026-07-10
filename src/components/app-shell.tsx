"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navPermitido } from "@/lib/nav";
import { CARGO_LABEL, type Organization, type Profile } from "@/lib/types";
import { signOut } from "@/app/auth/actions";

export function AppShell({
  profile,
  org,
  children,
}: {
  profile: Profile;
  org: Organization;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const itens = navPermitido(profile.cargo);

  const iniciais = (profile.nome || "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {itens.map((item) => {
        const ativo = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setAberto(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              ativo
                ? "bg-primary-soft text-primary"
                : "text-foreground hover:bg-surface-2"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Marca = () => (
    <div className="flex items-center gap-2 px-1">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg font-semibold">
        E
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold">{org.nome}</div>
        <div className="text-xs text-muted">Estética OS</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Marca />
        <div className="mt-6 flex-1">
          <NavLinks />
        </div>
        <UserBox nome={profile.nome} cargo={CARGO_LABEL[profile.cargo]} iniciais={iniciais} />
      </aside>

      {/* Drawer mobile */}
      {aberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAberto(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-surface p-4">
            <Marca />
            <div className="mt-6 flex-1">
              <NavLinks />
            </div>
            <UserBox nome={profile.nome} cargo={CARGO_LABEL[profile.cargo]} iniciais={iniciais} />
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar mobile */}
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button onClick={() => setAberto(true)} className="btn-ghost px-2" aria-label="Menu">
            ☰
          </button>
          <span className="text-sm font-semibold">{org.nome}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {iniciais}
          </span>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function UserBox({
  nome,
  cargo,
  iniciais,
}: {
  nome: string | null;
  cargo: string;
  iniciais: string;
}) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center gap-3 px-1">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
          {iniciais}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-medium">{nome}</div>
          <div className="text-xs text-muted">{cargo}</div>
        </div>
      </div>
      <form action={signOut} className="mt-3">
        <button className="btn-ghost w-full justify-start text-sm text-muted">
          ⏻ Sair
        </button>
      </form>
    </div>
  );
}
