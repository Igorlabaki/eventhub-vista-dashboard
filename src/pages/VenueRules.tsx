import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { VenueRuleSection } from "@/components/venue-rule/venue-rule-section";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useVenueRuleStore } from "@/store/venueRuleStore";
import { useVenueStore } from "@/store/venueStore";
import { VenueRule } from "@/types/venue-rule";

export default function VenueRules() {
    const { selectedVenue: venue } = useVenueStore();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedRule, setSelectedRule] = useState<VenueRule | null | undefined>(undefined);
    const { rules, isLoading, error, fetchRules } = useVenueRuleStore();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();

    useEffect(() => {
        if (venue?.id) {
            fetchRules(venue.id);
        }
    }, [venue?.id, fetchRules]);

    const canEdit = currentUserVenuePermission?.permissions?.includes("EDIT_VENUE_RULES") ?? false;

    return (
        <DashboardLayout title="Regras" subtitle="Cadastre as regras deste espaço">
            {canEdit && (
                <PageHeader
                    onCreateClick={() => setIsCreating(true)}
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
                selectedRule={selectedRule}
                setSelectedRule={setSelectedRule}
                onCreateClick={() => setIsCreating(true)}
                onCancelCreate={() => setIsCreating(false)}
            />
        </DashboardLayout>
    );
}
