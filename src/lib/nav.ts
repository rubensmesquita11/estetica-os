// Itens de navegação e quais cargos veem cada um.
// Usado tanto no menu quanto para bloquear acesso.
import type { Cargo } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  cargos: Cargo[]; // cargos que enxergam este item
}

const TODOS: Cargo[] = ["admin", "gestor", "recepcao", "comercial", "profissional", "financeiro"];

export const NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: "📊", cargos: TODOS },
  { href: "/app/agenda", label: "Agenda", icon: "📅", cargos: TODOS },
  { href: "/app/pacientes", label: "Pacientes", icon: "👤", cargos: ["admin", "gestor", "recepcao", "comercial", "profissional"] },
  { href: "/app/leads", label: "Funil de vendas", icon: "🎯", cargos: ["admin", "gestor", "recepcao", "comercial"] },
  { href: "/app/procedimentos", label: "Procedimentos", icon: "✨", cargos: ["admin", "gestor", "recepcao", "profissional"] },
  { href: "/app/recorrencia", label: "Recorrência", icon: "🔁", cargos: ["admin", "gestor", "recepcao", "comercial", "profissional"] },
  { href: "/app/campanhas", label: "Campanhas", icon: "📣", cargos: ["admin", "gestor", "comercial", "recepcao"] },
  { href: "/app/indicacoes", label: "Indicações", icon: "🤝", cargos: ["admin", "gestor", "comercial", "recepcao"] },
  { href: "/app/tarefas", label: "Tarefas", icon: "✅", cargos: TODOS },
  { href: "/app/financeiro", label: "Financeiro", icon: "💰", cargos: ["admin", "gestor", "financeiro"] },
  { href: "/app/estoque", label: "Estoque", icon: "📦", cargos: ["admin", "gestor", "recepcao"] },
  { href: "/app/metas", label: "Metas", icon: "🎯", cargos: ["admin", "gestor"] },
  { href: "/app/configuracoes", label: "Configurações", icon: "⚙️", cargos: ["admin", "gestor"] },
];

export function navPermitido(cargo: Cargo): NavItem[] {
  return NAV.filter((item) => item.cargos.includes(cargo));
}
