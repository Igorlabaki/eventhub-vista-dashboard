import jsPDF from "jspdf";
import extenso from "extenso";
import { parseISO, isValid, format } from "date-fns";
import { Venue } from "@/types/venue";
import { Clause, Contract } from "@/types/contract";
import { Proposal } from "@/types/proposal";
import { Attachment } from "@/types/attachment";
import { Owner } from "@/types/owner";


export function generateContractPdf({
  contract,
  owner,
  currentProposal,
  selectedVenue,
  paymentInfo,
  formValues,
  toast
}: {
  contract: Contract,
  owner: Owner,
  currentProposal: Proposal,
  selectedVenue: Venue,
  paymentInfo: {
    amount: number,
    dueDate: string,
    paymentMethod: string,
    paymentValue: string,
    signalAmount: string,
    numberPayments: string,
    perPersonPrice: string,
  },
  formValues: Record<string, unknown>,
  toast: (args: { title: string; description: string; variant?: string }) => void
}) {
  // Função para converter para número romano
  const toRoman = (num: number) => {
    const roman = [
      '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
      'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'
    ];
    return roman[num] || num;
  };

  // Função para substituir variáveis do template
  function replaceTemplateVars(text: string) {
    const values: Record<string, unknown> = {
      owner: owner,
      client: currentProposal || {},
      venue: selectedVenue || {},
      proposal: currentProposal || {},
      paymentInfo: paymentInfo || {},
    };

  
    return text.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
      const [obj, prop] = p1.trim().split('.');
      const value = values[obj] && typeof values[obj] === 'object' && values[obj] !== null && (values[obj] as Record<string, unknown>)[prop] !== undefined ? (values[obj] as Record<string, unknown>)[prop] : undefined;
      if (value !== undefined) {
        if (["totalAmount", "signalAmount", "paymentValue", "perPersonPrice"].includes(prop)) {
          const numericValue = Number(value);
          const formattedValue = numericValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
          });
          const valueExtenso = extenso(numericValue.toFixed(2).replace(".", ","), {
            mode: "currency"
          });
          return `${formattedValue} (${valueExtenso})`;
        }
        if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          const parsedDate = parseISO(value);
          return isValid(parsedDate)
            ? format(parsedDate,
                parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0
                  ? "dd/MM/yyyy 'às' HH:mm"
                  : "dd/MM/yyyy")
            : value;
        }
        return value as string;
      }
      return match;
    });
  }

  try {
    if (!contract) {
      toast({
        title: "Erro",
        description: "Contrato não encontrado.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomPadding = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título em maiúsculo e negrito, centralizado, mesmo com quebras de linha
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    const contractTitle = (contract.title || contract.name || "CONTRATO").toUpperCase();
    const titleLines = contractTitle.split('\n');
    titleLines.forEach(line => {
      const lineWidth = doc.getTextWidth(line);
      const lineX = (pageWidth - lineWidth) / 2;
      doc.text(line, lineX, y);
      y += 5; // Espaço menor entre linhas do título
    });
    y += 33;

    // Cláusulas
    if (contract.clauses && Array.isArray(contract.clauses)) {
      (contract.clauses as Clause[]).forEach((clause: Clause, idx: number) => {
        const romanNum = toRoman(idx + 1);
        // Renderiza o número romano e o título da cláusula em negrito
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const clauseTitle = clause.title ? `${romanNum} - ${replaceTemplateVars(clause.title)}` : `${romanNum}`;
        const titleLines = doc.splitTextToSize(clauseTitle, 190);
        // Renderiza o texto da cláusula normal
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(replaceTemplateVars(clause.text), 190);
        // Estimar altura do bloco (título + texto + espaçamento padronizado)
        const blockHeight = titleLines.length * 7 + textLines.length * 7 + 15;
        if (y + blockHeight > pageHeight - bottomPadding) {
          doc.addPage();
          y = 20;
        }
        // Renderiza título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(titleLines, 10, y);
        y += titleLines.length * 7;
        // Renderiza texto
        doc.setFont("helvetica", "normal");
        doc.text(textLines, 15, y);
        y += textLines.length * 7;
        // Espaçamento padronizado entre cláusulas
        y += 8;
      });
      // Garante padding no fim da última página
      // Removido para evitar espaçamento excessivo
      // if (y < pageHeight - bottomPadding) {
      //   y = pageHeight - bottomPadding;
      // }
    }

    // Bloco de assinaturas ao final do contrato
    y += 20;
    if (y + 60 > pageHeight - bottomPadding) {
      doc.addPage();
      y = 40;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Por estarem acordadas, assinam o presente instrumento.", 10, y);
    y += 10;
    const today = new Date();
    doc.text(`São Paulo, ${format(today, "dd/MM/yyyy")}.`, 10, y);
    y += 30;
    // Linhas de assinatura
    const sigWidth = 60;
    const sigY = y;
    // Locador(a)
    doc.line(20, sigY, 20 + sigWidth, sigY);
    doc.text("Locador(a)", 20 + sigWidth / 2 - doc.getTextWidth("Locador(a)") / 2, sigY + 8);
    // Locatário(a)
    doc.line(pageWidth - 20 - sigWidth, sigY, pageWidth - 20, sigY);
    doc.text("Locatário(a)", pageWidth - 20 - sigWidth / 2 - doc.getTextWidth("Locatário(a)") / 2, sigY + 8);

    // Adicionar anexos (attachments) do selectedVenue, cada um em uma página
    if (selectedVenue && Array.isArray(selectedVenue.attachments)) {
      selectedVenue.attachments.forEach((attachment: Attachment) => {
        doc.addPage();
        let attachY = 40;
        // Título centralizado, maiúsculo, grande
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        const attachTitle = (attachment.title || "ANEXO").toUpperCase();
        const attachTitleWidth = doc.getTextWidth(attachTitle);
        const attachTitleX = (pageWidth - attachTitleWidth) / 2;
        doc.text(attachTitle, attachTitleX, attachY);
        attachY += 20;
        // Texto alinhado à esquerda
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const attachTextLines = doc.splitTextToSize(attachment.text || "", 170);
        attachTextLines.forEach((line: string) => {
          doc.text(line, 20, attachY);
          attachY += 8;
        });
      });
    }

    // Abrir PDF em nova aba
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
    toast({
      title: "Sucesso!",
      description: "Contrato gerado para visualização.",
    });
  } catch (error) {
    toast({
      title: "Erro",
      description: "Erro ao gerar contrato. Tente novamente.",
      variant: "destructive",
    });
  }
} 