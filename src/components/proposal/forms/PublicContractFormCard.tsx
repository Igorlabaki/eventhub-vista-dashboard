import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import type { PublicListSurface } from "@/components/proposal/PublicVenueListShell";
import {
  publicActionClass,
  publicCardClass,
  publicColumnClass,
  publicDividerClass,
  publicEyebrowClass,
  publicLeadClass,
  publicTitleClass,
} from "@/components/proposal/public-list-pattern";

export type ContractSaveNotice =
  | { kind: "saved" }
  | { kind: "error"; message: string }
  | null;

export function PublicContractFormCard<T extends FieldValues>({
  surface,
  title,
  lead,
  form,
  onSubmit,
  submitDisabled,
  submitting = false,
  notice = null,
  children,
}: {
  surface: PublicListSurface;
  title: string;
  lead: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  submitDisabled: boolean;
  submitting?: boolean;
  notice?: ContractSaveNotice;
  children: ReactNode;
}) {
  const heading = notice?.kind === "saved" ? "Obrigado" : notice?.kind === "error" ? "Não foi possível salvar" : title;
  const text = notice?.kind === "saved" ? "Seus dados foram recebidos." : notice?.kind === "error" ? notice.message : lead;

  return (
    <div className={publicColumnClass}>
      <section className={publicCardClass} style={surface.cardStyle}>
        <p className={publicEyebrowClass}>Contrato</p>
        <div aria-live="polite">
          <h2 className={`${publicTitleClass} mt-2`}>{heading}</h2>
          <p className={publicLeadClass}>{text}</p>
        </div>
        <div className={publicDividerClass} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
            <div className="mt-5 flex justify-end border-t border-current/15 pt-5">
              <button type="submit" disabled={submitDisabled || submitting} className={publicActionClass}>
                {submitting ? "Salvando" : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}
