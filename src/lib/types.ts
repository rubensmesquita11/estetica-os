// Tipos e rótulos do domínio — usados em todo o app para manter consistência.

export type Cargo =
  | "admin"
  | "gestor"
  | "recepcao"
  | "comercial"
  | "profissional"
  | "financeiro";

export const CARGO_LABEL: Record<Cargo, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  recepcao: "Recepção",
  comercial: "Comercial",
  profissional: "Profissional",
  financeiro: "Financeiro",
};

export type AppointmentStatus =
  | "aguardando"
  | "confirmado"
  | "chegou"
  | "em_atendimento"
  | "finalizado"
  | "faltou"
  | "cancelado"
  | "reagendado";

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  aguardando: "Aguardando confirmação",
  confirmado: "Confirmado",
  chegou: "Chegou",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
  faltou: "Faltou",
  cancelado: "Cancelado",
  reagendado: "Reagendado",
};

// Cor de fundo (Tailwind) para cada status — usado nos badges da agenda.
export const STATUS_COLOR: Record<AppointmentStatus, string> = {
  aguardando: "bg-warning-soft text-warning",
  confirmado: "bg-info-soft text-info",
  chegou: "bg-primary-soft text-primary",
  em_atendimento: "bg-primary-soft text-primary",
  finalizado: "bg-success-soft text-success",
  faltou: "bg-danger-soft text-danger",
  cancelado: "bg-surface-2 text-muted",
  reagendado: "bg-surface-2 text-muted",
};

export interface Organization {
  id: string;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  cidade: string | null;
  plano: string;
  onboarding_completo: boolean;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cargo: Cargo;
  is_profissional: boolean;
  ativo: boolean;
}

export interface Patient {
  id: string;
  organization_id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  nascimento: string | null;
  profissao: string | null;
  cidade: string | null;
  instagram: string | null;
  origem: string | null;
  observacoes: string | null;
  primeiro_contato: string;
  created_at: string;
}

export interface Procedure {
  id: string;
  organization_id: string;
  nome: string;
  categoria: string | null;
  duracao_min: number;
  valor: number;
  retorno_dias: number | null;
  ativo: boolean;
}

export interface Appointment {
  id: string;
  organization_id: string;
  patient_id: string | null;
  procedure_id: string | null;
  profissional_id: string | null;
  unit_id: string | null;
  inicio: string;
  fim: string;
  valor: number | null;
  forma_pagamento: string | null;
  status: AppointmentStatus;
  observacoes: string | null;
  origem: string | null;
}

// ── Fase 2 ──────────────────────────────────────────────────────
export interface MedicalRecord {
  id: string;
  patient_id: string;
  queixa_principal: string | null;
  historico_saude: string | null;
  alergias: string | null;
  medicamentos: string | null;
  contraindicacoes: string | null;
  gestante: boolean;
  observacoes_clinicas: string | null;
  updated_at: string;
}

export interface Evolution {
  id: string;
  patient_id: string;
  profissional_id: string | null;
  texto: string;
  created_at: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  nome: string;
  procedure_id: string | null;
  total_sessoes: number;
  valor_total: number;
  validade: string | null;
  status: "ativo" | "concluido" | "cancelado";
  observacoes: string | null;
  created_at: string;
}

export interface TreatmentSession {
  id: string;
  plan_id: string;
  numero: number;
  realizada: boolean;
  data_realizada: string | null;
  observacoes: string | null;
}

export type TaskPrioridade = "baixa" | "media" | "alta";
export type TaskStatus = "aberta" | "concluida" | "cancelada";

export const PRIORIDADE_COLOR: Record<TaskPrioridade, string> = {
  baixa: "bg-surface-2 text-muted",
  media: "bg-info-soft text-info",
  alta: "bg-danger-soft text-danger",
};

export interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel_id: string | null;
  patient_id: string | null;
  prioridade: TaskPrioridade;
  prazo: string | null;
  status: TaskStatus;
  created_at: string;
}
