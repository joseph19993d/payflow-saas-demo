import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";

type StatusBadgeProps = {
  status: string | null | undefined;
};

const statusStyles: Record<
  string,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  ACTIVE: {
    label: "Ativa",
    className:
      "border-[color-mix(in_srgb,var(--payflow-success)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-success)_10%,white)] text-[var(--payflow-success)]",
    icon: CheckCircle2,
  },
  INACTIVE: {
    label: "Inativa",
    className:
      "border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] text-[var(--payflow-text-secondary)]",
    icon: Clock3,
  },
  APPROVED: {
    label: "Aprovado",
    className:
      "border-[color-mix(in_srgb,var(--payflow-success)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-success)_10%,white)] text-[var(--payflow-success)]",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pendente",
    className:
      "border-[color-mix(in_srgb,var(--payflow-warning)_34%,white)] bg-[color-mix(in_srgb,var(--payflow-warning)_10%,white)] text-[var(--payflow-warning)]",
    icon: Clock3,
  },
  IN_PROCESS: {
    label: "Em análise",
    className:
      "border-[color-mix(in_srgb,var(--payflow-info)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-info)_10%,white)] text-[var(--payflow-info)]",
    icon: Clock3,
  },
  REJECTED: {
    label: "Recusado",
    className:
      "border-[color-mix(in_srgb,var(--payflow-error)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-error)_10%,white)] text-[var(--payflow-error)]",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelado",
    className:
      "border-[color-mix(in_srgb,var(--payflow-error)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-error)_10%,white)] text-[var(--payflow-error)]",
    icon: XCircle,
  },
  REFUNDED: {
    label: "Estornado",
    className:
      "border-[var(--payflow-secondary-200)] bg-[var(--payflow-secondary-100)] text-[var(--payflow-secondary-700)]",
    icon: AlertTriangle,
  },
  EXPIRED: {
    label: "Expirada",
    className:
      "border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] text-[var(--payflow-text-secondary)]",
    icon: AlertTriangle,
  },
  UNKNOWN: {
    label: "Indefinido",
    className:
      "border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] text-[var(--payflow-text-secondary)]",
    icon: AlertTriangle,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status ?? "UNKNOWN";
  const config = statusStyles[normalizedStatus] ?? {
    label: normalizedStatus,
    className:
      "border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] text-[var(--payflow-text-secondary)]",
    icon: AlertTriangle,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
