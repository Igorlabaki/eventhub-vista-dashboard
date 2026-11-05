import { requiredServiceIds } from "@/lib/required-service-ids";
import { serviceUnitLabel } from "@/lib/service-price-label";
import { ServicePricingType } from "@/types/service";

export type DashboardServiceChoice = {
  id: string;
  name: string;
  price: number;
  pricingType?: ServicePricingType | null;
  rpaRequired?: boolean;
  rpaMinPeople?: number | null;
};

function requiredCopy(service: DashboardServiceChoice) {
  if (!service.rpaRequired || !service.rpaMinPeople) return "";
  if (service.rpaMinPeople === 1) return "Obrigatório a partir de 1 pessoa.";
  return `Obrigatório a partir de ${service.rpaMinPeople} pessoas.`;
}

type DashboardServiceChoicesProps = {
  services: DashboardServiceChoice[];
  guestNumber: number;
  selectedIds: string[];
  hoursInput: Record<string, string>;
  hourErrors: Record<string, string>;
  onToggle: (serviceId: string, checked: boolean) => void;
  onHoursChange: (serviceId: string, value: string) => void;
};

export function DashboardServiceChoices({
  services,
  guestNumber,
  selectedIds,
  hoursInput,
  hourErrors,
  onToggle,
  onHoursChange,
}: DashboardServiceChoicesProps) {
  const requiredIds = requiredServiceIds(services, guestNumber);
  const ordered = [...services].sort((a, b) => {
    const minA = a.rpaRequired && a.rpaMinPeople ? a.rpaMinPeople : Number.POSITIVE_INFINITY;
    const minB = b.rpaRequired && b.rpaMinPeople ? b.rpaMinPeople : Number.POSITIVE_INFINITY;
    return minA - minB;
  });

  if (ordered.length === 0) {
    return <div className="text-sm text-gray-500 mt-2">Nenhum serviço disponível</div>;
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      {ordered.map((service) => {
        const isRequired = requiredIds.includes(service.id);
        const checked = selectedIds.includes(service.id);
        const asksHours = service.pricingType === "PER_HOUR" && checked;
        const requiredText = requiredCopy(service);
        return (
          <div key={service.id} className="flex items-center justify-between gap-3">
            <label className="flex min-w-0 flex-1 items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 shrink-0"
                checked={checked}
                disabled={isRequired}
                onChange={(event) => {
                  if (!isRequired) onToggle(service.id, event.target.checked);
                }}
              />
              <span className="min-w-0 text-sm">
                <span className={isRequired ? "font-medium" : undefined}>{service.name}</span>
                <span className="text-xs text-gray-500"> ({serviceUnitLabel(service.price, service.pricingType)})</span>
                {requiredText && <span className="text-xs text-gray-500"> {requiredText}</span>}
              </span>
            </label>
            {asksHours && (
              <div className="flex w-44 shrink-0 flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <label htmlFor={`dashboard-service-hours-${service.id}`} className="whitespace-nowrap text-xs">
                    Quantas horas?
                  </label>
                  <input
                    id={`dashboard-service-hours-${service.id}`}
                    type="text"
                    inputMode="numeric"
                    className="h-9 w-14 rounded-md border bg-transparent px-2 text-sm"
                    value={hoursInput[service.id] ?? ""}
                    aria-invalid={Boolean(hourErrors[service.id])}
                    onChange={(event) => onHoursChange(service.id, event.target.value)}
                  />
                </div>
                {hourErrors[service.id] && (
                  <p role="alert" className="text-right text-xs text-red-500">{hourErrors[service.id]}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
