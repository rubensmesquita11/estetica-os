// Tipos e rótulos dos segmentos de campanha (seguro para o navegador).
// A função que calcula o público (que lê o banco) fica em segments.server.ts.

export type Segmento = "inativos" | "aniversariantes_mes" | "pacote_incompleto" | "todos";

export const SEGMENTO_LABEL: Record<Segmento, string> = {
  inativos: "Pacientes inativos (90+ dias sem voltar)",
  aniversariantes_mes: "Aniversariantes do mês",
  pacote_incompleto: "Com pacote em andamento",
  todos: "Todos os pacientes",
};

export interface Alvo {
  id: string;
  nome: string;
  telefone: string | null;
  motivo: string;
}
