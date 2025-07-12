import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Contact as ContactIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useContactStore } from "@/store/contactStore";
import { ContactType, type Contact } from "@/types/contact";
import { ContactSection } from "@/components/contact/contact-section";
import { ContactHeader } from "@/components/contact/contact-header";
import { useUserPermissionStore } from "@/store/userPermissionStore";
import AccessDenied from "@/components/accessDenied";

export default function VenueContacts() {
  const { id: venueId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null | undefined>(undefined);
  const { contacts, isLoading, fetchContacts } = useContactStore();
  const { currentUserPermission } = useUserPermissionStore();
  
  useEffect(() => {
    if (venueId) {
      fetchContacts(venueId);
    }
  }, [venueId, fetchContacts]);

  const handleCreateContact = () => {
    setIsCreatingContact(true);
  };

  const hasViewPermission = () => {
    if (!currentUserPermission?.permissions) return false;
    return currentUserPermission.permissions.includes("VIEW_CONTACTS");
  };

  const hasEditPermission = () => {
    if (!currentUserPermission?.permissions) return false;
    return currentUserPermission.permissions.includes("EDIT_CONTACTS");
  };

  const getFilteredContacts = () => {
    let filtered = contacts;
    
    if (activeTab === "internal") {
      filtered = filtered?.filter(contact => contact.type === ContactType.TEAM_MEMBER);
    } else if (activeTab === "supplier") {
      filtered = filtered?.filter(contact => contact.type === ContactType.SUPPLIER);
    }

    if (searchQuery) {
      filtered = filtered?.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if(!hasViewPermission()) {
    return <DashboardLayout title="Contatos" subtitle="Gerencie os contatos do espaço">
     <AccessDenied />
    </DashboardLayout>
  }

  return (
    <DashboardLayout title="Contatos" subtitle="Gerencie os contatos do espaço">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ContactHeader
          hasPermission={hasEditPermission()}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onActionClick={handleCreateContact}
          isFormOpen={isCreatingContact || selectedContact !== undefined}
        />

        <TabsContent value={activeTab} className="mt-0">
          <ContactSection
            hasPermission={hasEditPermission()}
            contacts={getFilteredContacts()}
            venueId={venueId || ""}
            isLoading={isLoading}
            isCreating={isCreatingContact}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            onCreateClick={handleCreateContact}
            onCancelCreate={() => setIsCreatingContact(false)}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
