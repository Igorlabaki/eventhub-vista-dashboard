import React from "react";
import { AttachmentForm } from "./attachment-form";
import { AttachmentList } from "./attachment-list";
import { Attachment } from "@/types/attachment";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";

interface AttachmentsSectionProps {
  organizationId: string;
  venues: { id: string; name: string }[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAttachment: Attachment | null | undefined;
  setSelectedAttachment: (a: Attachment | null | undefined) => void;
}

export function AttachmentsSection({
  organizationId,
  venues,
  searchQuery,
  setSearchQuery,
  selectedAttachment,
  setSelectedAttachment,
}: AttachmentsSectionProps) {
  // Animação e controle de view
  const showForm = selectedAttachment !== undefined;

  const handleEdit = (attachment: Attachment | null) => {
    setSelectedAttachment(attachment);
  };

  const handleCancel = () => {
    setSelectedAttachment(undefined);
  };

  return (
    <AnimatedFormSwitcher
      showForm={showForm}
      list={
        <AttachmentList
          venues={venues}
          organizationId={organizationId}
          onEdit={handleEdit}
        />
      }
      form={
        <AttachmentForm
          initialData={selectedAttachment || {}}
          isEditing={!!selectedAttachment}
          venues={venues}
          onCancel={handleCancel}
          organizationId={organizationId}
        />
      }
    />
  );
}
