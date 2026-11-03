import { VenueRule } from "@/types/venue-rule";
import { VenueRuleForm } from "./venue-rule-form";
import { VenueRuleList } from "./venue-rule-list";
import { useVenueRuleStore } from "@/store/venueRuleStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ServiceListSkeleton } from "@/components/service/service-list-skeleton";

interface VenueRuleSectionProps {
    rules: VenueRule[];
    venueId: string;
    isLoading: boolean;
    isCreating: boolean;
    selectedRule: VenueRule | null | undefined;
    setSelectedRule: (rule: VenueRule | null | undefined) => void;
    onCreateClick: () => void;
    onCancelCreate: () => void;
}

export function VenueRuleSection({
    rules,
    venueId,
    isLoading,
    isCreating,
    selectedRule,
    setSelectedRule,
    onCreateClick,
    onCancelCreate,
}: VenueRuleSectionProps) {
    const { createRule, updateRule } = useVenueRuleStore();
    const { toast } = useToast();

    const handleSubmit = async (data: { title: string | null; text: string; position?: number }) => {
        try {
            const response = selectedRule
                ? await updateRule({
                    ruleId: selectedRule.id,
                    title: data.title,
                    text: data.text,
                    position: data.position,
                })
                : await createRule({
                    venueId,
                    title: data.title,
                    text: data.text,
                });
            const { title, message } = handleBackendSuccess(
                response,
                selectedRule ? "Regra atualizada com sucesso!" : "Regra cadastrada com sucesso!",
            );
            showSuccessToast({ title, description: message });
            setSelectedRule(undefined);
            onCancelCreate();
        } catch (error: unknown) {
            const { title, message } = handleBackendError(error, "Erro ao salvar regra. Tente novamente mais tarde.");
            toast({ title, description: message, variant: "destructive" });
        }
    };

    const showForm = isCreating || !!selectedRule;

    return (
        <div className="animate-fade-in">
            {isLoading ? (
                <ServiceListSkeleton />
            ) : (
                <AnimatedFormSwitcher
                    showForm={showForm}
                    list={
                        <VenueRuleList
                            rules={rules || []}
                            onCreateClick={onCreateClick}
                            onEditClick={setSelectedRule}
                        />
                    }
                    form={
                        <VenueRuleForm
                            rule={selectedRule}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setSelectedRule(undefined);
                                onCancelCreate();
                            }}
                        />
                    }
                />
            )}
        </div>
    );
}
