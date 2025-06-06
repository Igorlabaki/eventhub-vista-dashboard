import { api } from "@/lib/axios";

interface SendProposalEmailParams {
  proposal: {
    proposalId: string;
    clientName: string;
    clientEmail: string;
  };
  message?: string;
  userId?: string;
  username?: string;
}

interface SendContractEmailParams {
  proposal: {
    proposalId: string;
    clientName: string;
    clientEmail: string;
  };
  message?: string;
  userId?: string;
  username?: string;
}

export const emailService = {
  async sendProposal(params: SendProposalEmailParams): Promise<void> {
    await api.post("/email/proposal", params);
  },

  async sendContract(params: SendContractEmailParams): Promise<void> {
    await api.post("/email/contract", params);
  },
}; 