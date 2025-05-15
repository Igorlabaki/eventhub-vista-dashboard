export enum Permissions {
    VIEW_INFO = "VIEW_INFO",
    VIEW_IMAGES = "VIEW_IMAGES",
    VIEW_EVENTS = "VIEW_EVENTS",
    VIEW_PROPOSALS = "VIEW_PROPOSALS",
    VIEW_ANALYSIS = "VIEW_ANALYSIS",
    VIEW_CALENDAR = "VIEW_CALENDAR",
    VIEW_NOTIFICATIONS = "VIEW_NOTIFICATIONS",
    EDIT_VENUE = "EDIT_VENUES",
    EDIT_ORGANIZATION = "EDIT_ORGANIZATION",
    EDIT_IMAGE = "EDIT_IMAGES",
    EDIT_EVENT = "EDIT_EVENTS",
    EDIT_TEXTS = "EDIT_TEXTS",
    EDIT_PROPOSALS = "EDIT_PROPOSALS",
    EDIT_CALENDAR = "EDIT_CALENDARS",
    EDIT_EXPENSES = "EDIT_EXPENSES",
    EDIT_SERVICES = "EDIT_SERVICES",
    EDIT_QUESTIONS = "EDIT_QUESTIONS",
    EDIT_ATTENDANCE_LIST = "EDIT_ATTENDANCE_LIST",
    EDIT_SCHEDULE = "EDIT_SCHEDULE",
    EDIT_PROPOSAL_OPTIONS = "EDIT_PROPOSAL_OPTIONS",
    SEND_CLIENT = "SEND_CLIENT",
    EDIT_DOCUMENTS = "EDIT_DOCUMENTS",
    EDIT_PAYMENTS = "EDIT_PAYMENTS",
    EDIT_DATES = "EDIT_DATES",
    VIEW_AMOUNTS = "VIEW_AMOUNTS",
}

export type PermissionItem = {
    enum: Permissions;
    display: string;
}

export const userViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_EVENTS, display: "Eventos" },
    { enum: Permissions.VIEW_ANALYSIS, display: "Analises" },
    { enum: Permissions.VIEW_CALENDAR, display: "Caledario" },
    { enum: Permissions.VIEW_PROPOSALS, display: "Propostas" },
    { enum: Permissions.VIEW_NOTIFICATIONS, display: "Notificacoes" },
    { enum: Permissions.VIEW_INFO, display: "Informacoes" },
    { enum: Permissions.VIEW_IMAGES, display: "Imagens" },
    { enum: Permissions.VIEW_AMOUNTS, display: "Valores" },
];

export const userEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_ORGANIZATION, display: "Organizacao" },
    { enum: Permissions.EDIT_VENUE, display: "Locacao" },
    { enum: Permissions.EDIT_CALENDAR, display: "Caledario" },
    { enum: Permissions.EDIT_TEXTS, display: "Informacoes" },
    { enum: Permissions.EDIT_QUESTIONS, display: "FAQ" },
    { enum: Permissions.EDIT_EXPENSES, display: "Despesas" },
    { enum: Permissions.EDIT_SERVICES, display: "Servicos" },
    { enum: Permissions.EDIT_IMAGE, display: "Imagens" },
];

export const userProposalPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_EVENT, display: "Eventos" },
    { enum: Permissions.EDIT_DOCUMENTS, display: "Documentos" },
    { enum: Permissions.EDIT_PROPOSALS, display: "Orcamentos" },
    { enum: Permissions.EDIT_SCHEDULE, display: "Programacao do evento" },
    { enum: Permissions.EDIT_PAYMENTS, display: "Pagamento" },
    { enum: Permissions.EDIT_DATES, display: "Datas" },
    { enum: Permissions.SEND_CLIENT, display: "Enviar (orc,contratos,msg)" },
    { enum: Permissions.EDIT_ATTENDANCE_LIST, display: "Lista de presenca" },
];

