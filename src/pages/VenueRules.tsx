import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { publicVenueRulesShareUrl } from "@/lib/public-venue-rules";
import { VenueRuleSection } from "@/components/venue-rule/venue-rule-section";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useVenueRuleStore } from "@/store/venueRuleStore";
import { useVenueStore } from "@/store/venueStore";
import { VenueRule } from "@/types/venue-rule";

export default function VenueRules() {
    const { selectedVenue: venue } = useVenueStore();
    const [isCreating, setIsCreating] = useState(false);
    const [createSession, setCreateSession] = useState(0);
    const [selectedRule, setSelectedRule] = useState<VenueRule | null | undefined>(undefined);
    const { rules, isLoading, error, fetchRules } = useVenueRuleStore();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();

    useEffect(() => {
        if (venue?.id) {
            fetchRules(venue.id);
        }
    }, [venue?.id, fetchRules]);

    const { toast } = useToast();
    const canEdit = currentUserVenuePermission?.permissions?.includes("EDIT_VENUE_RULES") ?? false;

    const openCreate = () => {
        setSelectedRule(undefined);
        setCreateSession((session) => session + 1);
        setIsCreating(true);
    };

    const copyLink = async () => {
        if (!venue?.id) return;
        try {
            await navigator.clipboard.writeText(publicVenueRulesShareUrl(venue.id));
            showSuccessToast({ title: "Link copiado", description: "O link das regras está na área de transferência." });
        } catch {
            toast({
                title: "Não foi possível copiar",
                description: "Tente de novo.",
                variant: "destructive",
            });
        }
    };

    return (
        <DashboardLayout title="Regras" subtitle="Cadastre as regras deste espaço">
            {venue?.id ? (
                <div className="mb-6 max-w-3xl">
                    <Button type="button" variant="outline" className="w-full" onClick={copyLink}>
                        Copiar link das regras
                    </Button>
                </div>
            ) : null}
            {canEdit && (
                <PageHeader
                    onCreateClick={openCreate}
                    isFormOpen={isCreating || !!selectedRule}
                    createButtonText="Nova regra"
                />
            )}
            {error && !isLoading && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="mt-2 underline"
                        onClick={() => venue?.id && fetchRules(venue.id)}
                    >
                        Tentar de novo
                    </button>
                </div>
            )}
            <VenueRuleSection
                rules={rules}
                venueId={venue?.id ?? ""}
                isLoading={isLoading}
                isCreating={isCreating}
                createSession={createSession}
                selectedRule={selectedRule}
                setSelectedRule={setSelectedRule}
                onCreateClick={openCreate}
                onCancelCreate={() => setIsCreating(false)}
            />
        </DashboardLayout>
    );
}
