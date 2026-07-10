// Etapas do funil comercial e temperatura do lead (Fase 3).

export type LeadStatus =
  | "novo"
  | "contato"
  | "avaliacao_agendada"
  | "avaliacao_realizada"
  | "proposta"
  | "negociacao"
  | "fechado"
  | "perdido";

export interface Etapa {
  key: LeadStatus;
  label: string;
}

// Ordem das colunas do Kanban.
export const PIPELINE: Etapa[] = [
  { key: "novo", label: "Novo lead" },
  { key: "contato", label: "Contato feito" },
  { key: "avaliacao_agendada", label: "Avaliação agendada" },
  { key: "avaliacao_realizada", label: "Avaliação feita" },
  { key: "proposta", label: "Proposta enviada" },
  { key: "negociacao", label: "Negociação" },
  { key: "fechado", label: "Fechado" },
  { key: "perdido", label: "Perdido" },
];

export const STATUS_LEAD_LABEL: Record<LeadStatus, string> = Object.fromEntries(
  PIPELINE.map((e) => [e.key, e.label]),
) as Record<LeadStatus, string>;

export type Temperatura = "frio" | "morno" | "quente";

export const TEMPERATURA: Record<Temperatura, { label: string; classe: string; icon: string }> = {
  frio: { label: "Frio", classe: "bg-info-soft text-info", icon: "🧊" },
  morno: { label: "Morno", classe: "bg-warning-soft text-warning", icon: "🌤️" },
  quente: { label: "Quente", classe: "bg-danger-soft text-danger", icon: "🔥" },
};

export interface Lead {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  instagram: string | null;
  procedimento_interesse: string | null;
  origem: string | null;
  valor_potencial: number;
  responsavel_id: string | null;
  temperatura: Temperatura;
  status: LeadStatus;
  patient_id: string | null;
  observacoes: string | null;
  created_at: string;
}

export const PROPOSTA_STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  visualizado: "Visualizado",
  negociacao: "Em negociação",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

export const PROPOSTA_STATUS_COLOR: Record<string, string> = {
  rascunho: "bg-surface-2 text-muted",
  enviado: "bg-info-soft text-info",
  visualizado: "bg-info-soft text-info",
  negociacao: "bg-warning-soft text-warning",
  aprovado: "bg-success-soft text-success",
  recusado: "bg-danger-soft text-danger",
  expirado: "bg-surface-2 text-muted",
};
