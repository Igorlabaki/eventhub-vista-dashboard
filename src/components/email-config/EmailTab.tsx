import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Proposal } from "@/types/proposal";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { useEmailConfigStore } from "@/store/emailConfigStore";
import { useVenueStore } from "@/store/venueStore";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa";
import { FormLayout } from "@/components/ui/form-layout";
import { emailService } from "@/services/emailService";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { CreateEmailConfigWithFileDTO, UpdateEmailConfigWithFileDTO } from "@/services/emailConfig.service";
import { showSuccessToast } from "../ui/success-toast";
import { useToast } from "@/hooks/use-toast";
interface EmailTabProps {
  proposal: Proposal | null;
  venueUrl?: string;
  venueName?: string;
  form: UseFormReturn<{
    message: string;
    file?: File | null;
  }>;
}

export function EmailTab({
  proposal,
  venueUrl,
  venueName,
  form,
}: EmailTabProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { selectedVenue } = useVenueStore();
  const { fetchEmailConfigByType, currentEmailConfig, updateEmailConfig, createEmailConfig, isLoading } = useEmailConfigStore();
  const { user } = useUserStore();

  // Buscar config de e-mail ao montar
  React.useEffect(() => {
    if (selectedVenue?.id) {
      fetchEmailConfigByType(selectedVenue.id, "PROPOSAL");
    }
  }, [selectedVenue?.id, fetchEmailConfigByType]);

  // Atualizar preview e mensagem do form se vier config
  React.useEffect(() => {
    // Nunca setar preview com a imagem do banco, apenas limpar se não houver arquivo selecionado
    if (!form.getValues("file")) {
      setPreview(null);
    }
    if (currentEmailConfig && currentEmailConfig.message) {
      form.setValue("message", currentEmailConfig.message);
    }
  }, [currentEmailConfig]);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    form.setValue("file", null);
    setPreview(null);
  };
  const { toast } = useToast();
  // Atualiza preview se já houver imagem salva
  React.useEffect(() => {
    if (form.getValues("file") && !preview) {
      const file = form.getValues("file");
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [form, preview]);

  // Função para enviar o e-mail
  const handleSend = async () => {
    if (!proposal || !user || !selectedVenue) {
      toast({
        title: "Dados necessários não encontrados",
        description: "Verifique as informações do cliente e do espaço.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSending(true);
      await emailService.sendProposal({
        proposal: {
          proposalId: proposal.id,
          clientName: proposal.completeClientName,
          clientEmail: proposal.email,
        },
        message: form.getValues("message"),
        userId: user.id,
        username: user.username || "",
        venueId: selectedVenue.id,
      });
      showSuccessToast({
        title: "E-mail enviado com sucesso!",
        description: "O orçamento foi enviado para o cliente por e-mail.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description: "Ocorreu um erro ao enviar o e-mail.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Novo onSubmit para o formCard
  const handleFormSubmit = async () => {
    if (!selectedVenue) return;
    const file = form.getValues("file");
    if (currentEmailConfig) {
      // Atualizar config existente
      await updateEmailConfig({
        emailConfigId: currentEmailConfig.id,
        venueId: selectedVenue.id,
        data: {
          file: file || undefined,
        },
      } as UpdateEmailConfigWithFileDTO);
    } else {
      // Criar nova config
      await createEmailConfig({
        title: `PROPOSAL - ${venueName}`,
        type: "PROPOSAL",
        venueId: selectedVenue.id,
        file: file || undefined,
      } as CreateEmailConfigWithFileDTO);
    }
    setIsEditMode(false);
  };

  const previewImageUrl = preview
    ? preview
    : currentEmailConfig?.backgroundImageUrl
    ? currentEmailConfig?.backgroundImageUrl
    : undefined;

  // PREVIEW (mensagem fixa, logo, fundo)
  const previewCard = (
    <div className="w-full mx-auto bg-white rounded-lg shadow-md border p-8 flex flex-col gap-6">
      <div className="text-2xl font-bold mb-4 text-left">Preview Email</div>
      <div className="relative flex items-center justify-center min-h-[50vh] py-10 px-8 md:px-0 rounded-lg overflow-hidden border flex-1">
        {/* Imagem de fundo */}
        {previewImageUrl && (
          <img
            src={previewImageUrl}
            alt="Imagem de fundo do e-mail"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}
        {/* Card centralizado */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl py-12 px-4
         bg-white rounded-2xl shadow-2xl border text-center min-h-[60vh] mx-auto">
          {/* Logo do espaço */}
          {selectedVenue?.logoUrl ? (
            <img
              src={selectedVenue.logoUrl}
              alt="Logo do espaço"
              className="h-16 mb-4 object-contain mx-auto"
              style={{ maxWidth: 180 }}
            />
          ) : (
            <div className="text-4xl font-extrabold mb-4">Logo</div>
          )}
          {/* Mensagem padrão fixa */}
          <div className="whitespace-pre-line text-lg mb-6">
            Olá {proposal.completeClientName}, recebemos sua mensagem!
            {"\n"}
            {"\n"}
            Agradecemos o seu interesse em conhecer o {venueName}. Simulamos um
            orçamento para seu evento, por gentileza clique no botão abaixo para
            ver a proposta.
          </div>
          {/* Botão Orçamento */}
          <a
            href={`${venueUrl}/orcamento/byId/${proposal.id}`}
            target="_blank"
            className="inline-block bg-black text-white px-8 py-2 rounded-md font-semibold text-lg mb-8 hover:bg-gray-900 transition"
          >
            Orçamento
          </a>
          {/* Siga-nos e ícones */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-medium text-sm mb-1">SIGA-NOS</span>
            <div className="flex gap-4 justify-center items-center">
              {selectedVenue?.tiktokUrl && (
                <a
                  href={selectedVenue.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTiktok size={28} color="#000" />
                </a>
              )}
              {selectedVenue?.instagramUrl && (
                <a
                  href={selectedVenue.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={28} color="#E4405F" />
                </a>
              )}
              {selectedVenue?.facebookUrl && (
                <a
                  href={selectedVenue.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={28} color="#1877F3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Botões fora do preview, alinhados à direita */}
      {!isEditMode && (
        <div className="flex gap-2 w-full justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditMode(true)}
            disabled={isSending}
          >
            Editar e-mail
          </Button>
          <Button type="button" variant="default" onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      )}
    </div>
  );

  // FORMULÁRIO (mensagem e imagem de fundo)
  const formCard = (
    <FormLayout
      title="Editar mensagem e imagem de fundo"
      onSubmit={handleFormSubmit}
      onCancel={() => setIsEditMode(false)}
      form={form}
      customSubmitButton={
        <Button type="submit" variant="default" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Salvando...
            </span>
          ) : (
            "Salvar e visualizar"
          )}
        </Button>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="file">Imagem de fundo (opcional)</Label>
        <div className="flex items-center gap-4">
          <Input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1"
          />
          {(preview || currentEmailConfig?.backgroundImageUrl) && (
            <button
              type="button"
              onClick={removeImage}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Miniatura da imagem */}
        {preview ? (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-[200px] rounded-lg"
            />
          </div>
        ) : currentEmailConfig?.backgroundImageUrl ? (
          <div className="mt-2">
            <img
              src={currentEmailConfig?.backgroundImageUrl}
              alt="Imagem salva"
              className="max-h-[200px] rounded-lg"
            />
          </div>
        ) : null}
      </div>
    </FormLayout>
  );

  return (
    <div className="relative">
      <AnimatedFormSwitcher
        showForm={isEditMode}
        list={previewCard}
        form={formCard}
      />
    </div>
  );
}
