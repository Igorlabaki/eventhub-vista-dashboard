export enum Permissions {
    VIEW_PROPOSAL_INFO = "VIEW_PROPOSAL_INFO",
    VIEW_IMAGES = "VIEW_IMAGES",
    VIEW_CONTACTS = "VIEW_CONTACTS",
    VIEW_EVENTS = "VIEW_EVENTS",
    VIEW_PROPOSALS = "VIEW_PROPOSALS",
    VIEW_ANALYSIS = "VIEW_ANALYSIS",
    VIEW_CALENDAR = "VIEW_CALENDAR",
    VIEW_NOTIFICATIONS = "VIEW_NOTIFICATIONS",
    VIEW_VENUES = "VIEW_VENUES",
    VIEW_ORGANIZATION = "VIEW_ORGANIZATION",
    VIEW_CONTRACTS = "VIEW_CONTRACTS",
    VIEW_PERMISSIONS = "VIEW_PERMISSIONS",
    EDIT_ORGANIZATION = "EDIT_ORGANIZATION",
    EDIT_IMAGE = "EDIT_IMAGES",
    EDIT_EVENT = "EDIT_EVENTS",
    EDIT_TEXTS = "EDIT_TEXTS",
    EDIT_PROPOSALS = "EDIT_PROPOSALS",
    EDIT_CALENDAR = "EDIT_CALENDARS",
    EDIT_EXPENSES = "EDIT_EXPENSES",
    EDIT_SERVICES = "EDIT_SERVICES",
    EDIT_QUESTIONS = "EDIT_QUESTIONS",
    EDIT_CONFIRM_ATTENDANCE_LIST = "EDIT_CONFIRM_ATTENDANCE_LIST",
    EDIT_SCHEDULE = "EDIT_SCHEDULE",
    EDIT_PROPOSAL_OPTIONS = "EDIT_PROPOSAL_OPTIONS",
    SEND_CLIENT = "SEND_CLIENT",
    EDIT_DOCUMENTS = "EDIT_DOCUMENTS",
    EDIT_PAYMENTS = "EDIT_PAYMENTS",
    EDIT_DATES = "EDIT_DATES",
    VIEW_AMOUNTS = "VIEW_AMOUNTS",
    VIEW_PRICES = "VIEW_PRICES",
    VIEW_SITE = "VIEW_SITE",
    VIEW_EXPENSES = "VIEW_EXPENSES",
    VIEW_SERVICES = "VIEW_SERVICES",
    VIEW_CONFIGURATIONS = "VIEW_CONFIGURATIONS",
    VIEW_OWNERS = "VIEW_OWNERS",
    EDIT_ATTENDANCE_LIST = "EDIT_ATTENDANCE_LIST",
    VIEW_ORG_SITE = "VIEW_ORG_SITE",
    VIEW_ORG_CONFIG = "VIEW_ORG_CONFIG",
    EDIT_CONTRACTS = "EDIT_CONTRACTS",
    EDIT_PERMISSIONS = "EDIT_PERMISSIONS",
    EDIT_OWNERS = "EDIT_OWNERS",
    EDIT_ORG_SITE = "EDIT_ORG_SITE",
    EDIT_ORG_CONFIG = "EDIT_ORG_CONFIG",
    EDIT_VENUES = "EDIT_VENUES",
    EDIT_VENUE_CONFIG = "EDIT_VENUE_CONFIG",
    VIEW_VENUE_SITE = "VIEW_VENUE_SITE",
    EDIT_PRICES = "EDIT_PRICES",
    EDIT_CONTACTS = "EDIT_CONTACTS",
    EDIT_VENUE_SITE = "EDIT_VENUE_SITE",
    VIEW_VENUE_INFO = "VIEW_VENUE_INFO",
    VIEW_DOCUMENTS = "VIEW_DOCUMENTS",
    VIEW_DATES = "VIEW_DATES",
    VIEW_SCHEDULE = "VIEW_SCHEDULE",
    VIEW_ATTENDANCE_LIST = "VIEW_ATTENDANCE_LIST",
    VIEW_PAYMENTS = "VIEW_PAYMENTS",
    VIEW_HISTORY = "VIEW_HISTORY",
    EDIT_PROPOSAL = "EDIT_PROPOSAL",
}

export type PermissionItem = {
    enum: Permissions;
    display: string;
}

export const organizationViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_VENUES, display: "Espaços" },
    { enum: Permissions.VIEW_CONTRACTS, display: "Contratos" },
    { enum: Permissions.VIEW_PERMISSIONS, display: "Permissões" },
    { enum: Permissions.VIEW_OWNERS, display: "Proprietários" },
    { enum: Permissions.VIEW_ORG_SITE, display: "Site" },
    { enum: Permissions.VIEW_ORG_CONFIG, display: "Configurações" },
];

export const organizationEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_VENUES, display: "Espaços" },
    { enum: Permissions.EDIT_CONTRACTS, display: "Contratos" },
    { enum: Permissions.EDIT_PERMISSIONS, display: "Permissões" },
    { enum: Permissions.EDIT_OWNERS, display: "Proprietários" },
    { enum: Permissions.EDIT_ORG_SITE, display: "Site" },
    { enum: Permissions.EDIT_ORG_CONFIG, display: "Configurações" },
];

export const venueViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_NOTIFICATIONS, display: "Notificacoes" },
    { enum: Permissions.VIEW_VENUE_INFO, display: "Informacoes" },
    { enum: Permissions.VIEW_PRICES, display: "Preços" },
    { enum: Permissions.VIEW_CONTACTS, display: "Contatos" },
    { enum: Permissions.VIEW_PROPOSALS, display: "Orcamentos" },
    { enum: Permissions.VIEW_VENUE_SITE, display: "Site" },
    { enum: Permissions.VIEW_EXPENSES, display: "Despesas" },
    { enum: Permissions.VIEW_SERVICES, display: "Serviços" },
    { enum: Permissions.VIEW_EVENTS, display: "Eventos" },
    { enum: Permissions.VIEW_ANALYSIS, display: "Análises" },
    { enum: Permissions.VIEW_CALENDAR, display: "Calendário" },
    { enum: Permissions.VIEW_CONFIGURATIONS, display: "Configurações" },
];
export const venueEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_VENUE_CONFIG, display: "Espaço" },
    { enum: Permissions.EDIT_CALENDAR, display: "Calendário" },
    { enum: Permissions.EDIT_EXPENSES, display: "Despesas" },
    { enum: Permissions.EDIT_SERVICES, display: "Serviços" },
    { enum: Permissions.EDIT_PRICES, display: "Preços" },
    { enum: Permissions.EDIT_CONTACTS, display: "Contatos" },
    { enum: Permissions.EDIT_PROPOSALS, display: "Orçamentos" },
    { enum: Permissions.EDIT_PAYMENTS, display: "Pagamento" },
    { enum: Permissions.EDIT_DATES, display: "Datas" },
    { enum: Permissions.EDIT_VENUE_SITE, display: "Site" },
];

export const proposalViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_PROPOSAL_INFO, display: "Informacoes" },
    { enum: Permissions.VIEW_DOCUMENTS, display: "Documentos" },
    { enum: Permissions.VIEW_DATES, display: "Datas" },
    { enum: Permissions.VIEW_SCHEDULE, display: "Programacao do evento" },
    { enum: Permissions.VIEW_ATTENDANCE_LIST, display: "Lista de presenca" },
    { enum: Permissions.VIEW_PAYMENTS, display: "Pagamento" },
    { enum: Permissions.VIEW_HISTORY, display: "Historico" },

];

export const proposalEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_PROPOSAL, display: "Orçamento" },
    { enum: Permissions.EDIT_DOCUMENTS, display: "Documentos" },
    { enum: Permissions.EDIT_SCHEDULE, display: "Programação do evento" },
    { enum: Permissions.EDIT_PAYMENTS, display: "Pagamento" },
    { enum: Permissions.EDIT_DATES, display: "Datas" },
    { enum: Permissions.SEND_CLIENT, display: "Enviar (orc,contratos,msg,links,etc)" },
    { enum: Permissions.EDIT_ATTENDANCE_LIST, display: "Lista de presença" },
    { enum: Permissions.EDIT_CONFIRM_ATTENDANCE_LIST, display: "Confirmar/Cancelar presença" },
];

export const generalPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_AMOUNTS, display: "Valores" },
]
