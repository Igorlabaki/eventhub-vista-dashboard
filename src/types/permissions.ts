export enum Permissions {
    /* Proposal */

        /* VIEW */
            VIEW_PROPOSAL_INFO = "VIEW_PROPOSAL_INFO",
            VIEW_PROPOSAL_DATES = "VIEW_PROPOSAL_DATES",
            VIEW_PROPOSAL_HISTORY = "VIEW_PROPOSAL_HISTORY",
            VIEW_PROPOSAL_SCHEDULE = "VIEW_PROPOSAL_SCHEDULE",
            VIEW_PROPOSAL_PAYMENTS = "VIEW_PROPOSAL_PAYMENTS",
            VIEW_PROPOSAL_DOCUMENTS = "VIEW_PROPOSAL_DOCUMENTS",
            VIEW_PROPOSAL_PERSONAL_INFO = "VIEW_PROPOSAL_PERSONAL_INFO",
            VIEW_PROPOSAL_ATTENDANCE_LIST = "VIEW_PROPOSAL_ATTENDANCE_LIST",
        /* SEND */
            SEND_PROPOSAL_INFO = "SEND_PROPOSAL_INFO",
            SEND_PROPOSAL_TEXT = "SEND_PROPOSAL_TEXT",
            SEND_PROPOSAL_LINKS = "SEND_PROPOSAL_LINKS",
            SEND_PROPOSAL_DOCUMENTS = "SEND_PROPOSAL_DOCUMENTS",
        /* EDIT */
            EDIT_PROPOSAL_INFO = "EDIT_PROPOSAL_INFO",
            EDIT_PROPOSAL_DATES = "EDIT_PROPOSAL_DATES",
            EDIT_PROPOSAL_SCHEDULE = "EDIT_PROPOSAL_SCHEDULE",
            EDIT_PROPOSAL_PAYMENTS = "EDIT_PROPOSAL_PAYMENTS",
            EDIT_PROPOSAL_DOCUMENTS = "EDIT_PROPOSAL_DOCUMENTS",
            EDIT_PROPOSAL_ATTENDANCE_LIST = "EDIT_PROPOSAL_ATTENDANCE_LIST",
        /* CONFIRM */
            CONFIRM_PROPOSAL_ATTENDANCE_LIST = "CONFIRM_PROPOSAL_ATTENDANCE_LIST",

    /* Venue */

        /* VIEW */
            VIEW_VENUE_INFO = "VIEW_VENUE_INFO",
            VIEW_VENUE_SITES = "VIEW_VENUE_SITES",
            VIEW_VENUE_PRICES = "VIEW_VENUE_PRICES",
            VIEW_VENUE_EVENTS = "VIEW_VENUE_EVENTS",
            VIEW_VENUE_ANALYSIS = "VIEW_VENUE_ANALYSIS",
            VIEW_VENUE_CALENDAR = "VIEW_VENUE_CALENDAR",
            VIEW_VENUE_CONTACTS = "VIEW_VENUE_CONTACTS",
            VIEW_VENUE_SERVICES = "VIEW_VENUE_SERVICES",
            VIEW_VENUE_EXPENSES = "VIEW_VENUE_EXPENSES",
            VIEW_VENUE_PROPOSALS = "VIEW_VENUE_PROPOSALS",
            VIEW_VENUE_PERMISSIONS = "VIEW_VENUE_PERMISSIONS",
            VIEW_VENUE_NOTIFICATIONS = "VIEW_VENUE_NOTIFICATIONS",
            VIEW_VENUE_CONFIG = "VIEW_VENUE_CONFIG",

        /* EDIT */
            EDIT_VENUE_INFO = "EDIT_VENUE_INFO",
            EDIT_VENUE_SITE = "EDIT_VENUE_SITE",
            EDIT_VENUE_EVENTS = "EDIT_VENUE_EVENTS",
            EDIT_VENUE_PRICES = "EDIT_VENUE_PRICES",
            EDIT_VENUE_CALENDAR = "EDIT_VENUE_CALENDAR",
            EDIT_VENUE_EXPENSES = "EDIT_VENUE_EXPENSES",
            EDIT_VENUE_SERVICES = "EDIT_VENUE_SERVICES",
            EDIT_VENUE_CONTACTS = "EDIT_VENUE_CONTACTS",
            EDIT_VENUE_PROPOSALS = "EDIT_VENUE_PROPOSALS",
    
    /* Organization */

        /* VIEW */
            VIEW_ORG_INFO = "VIEW_ORG_INFO",
            VIEW_ORG_SITE = "VIEW_ORG_SITE",
            VIEW_ORG_VENUES = "VIEW_ORG_VENUES",
            VIEW_ORG_OWNERS = "VIEW_ORG_OWNERS",
            VIEW_ORG_CONTRACTS = "VIEW_ORG_CONTRACTS",
            VIEW_ORG_PERMISSIONS = "VIEW_ORG_PERMISSIONS",
        /* EDIT */
            EDIT_ORG_INFO = "EDIT_ORG_INFO",
            EDIT_ORG_SITE = "EDIT_ORG_SITE",
            EDIT_ORG_VENUES = "EDIT_ORG_VENUES",
            EDIT_ORG_OWNERS = "EDIT_ORG_OWNERS",
            EDIT_ORG_CONTRACTS = "EDIT_ORG_CONTRACTS",
            EDIT_ORG_PERMISSIONS = "EDIT_ORG_PERMISSIONS",

    /* General */

        /* VIEW */
            VIEW_AMOUNTS = "VIEW_AMOUNTS",

}

export type PermissionItem = {
    enum: Permissions;
    display: string;
}

export const organizationViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_ORG_SITE, display: "Site" },
    { enum: Permissions.VIEW_ORG_VENUES, display: "Espaços" },
    { enum: Permissions.VIEW_ORG_INFO, display: "Informações" },
    { enum: Permissions.VIEW_ORG_CONTRACTS, display: "Contratos" },
    { enum: Permissions.VIEW_ORG_OWNERS, display: "Proprietários" },
    { enum: Permissions.VIEW_ORG_PERMISSIONS, display: "Permissões" },
];

export const organizationEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_ORG_SITE, display: "Site" },
    { enum: Permissions.EDIT_ORG_VENUES, display: "Espaços" },
    { enum: Permissions.EDIT_ORG_OWNERS, display: "Proprietários" },
    { enum: Permissions.EDIT_ORG_CONTRACTS, display: "Contratos" },
    { enum: Permissions.EDIT_ORG_PERMISSIONS, display: "Permissões" },
];

export const venueViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_VENUE_SITES, display: "Site" },
    { enum: Permissions.VIEW_VENUE_PRICES, display: "Preços" },
    { enum: Permissions.VIEW_VENUE_INFO, display: "Informacoes" },
    { enum: Permissions.VIEW_VENUE_EXPENSES, display: "Despesas" },
    { enum: Permissions.VIEW_VENUE_SERVICES, display: "Serviços" },
    { enum: Permissions.VIEW_VENUE_CONTACTS, display: "Contatos" },
    { enum: Permissions.VIEW_VENUE_PROPOSALS, display: "Orcamentos" },
    { enum: Permissions.VIEW_VENUE_NOTIFICATIONS, display: "Notificacoes" },
    { enum: Permissions.VIEW_VENUE_CALENDAR, display: "Calendario" },
    { enum: Permissions.VIEW_VENUE_EVENTS, display: "Eventos" },
    { enum: Permissions.VIEW_VENUE_ANALYSIS, display: "Analise" },
    { enum: Permissions.VIEW_VENUE_CONFIG, display: "Configuracoes" },
];
export const venueEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_VENUE_SITE, display: "Site" },
    { enum: Permissions.EDIT_VENUE_PRICES, display: "Preços" },
    { enum: Permissions.EDIT_VENUE_EVENTS, display: "Eventos" },
    { enum: Permissions.EDIT_VENUE_INFO, display: "Informacoes" },
    { enum: Permissions.EDIT_VENUE_EXPENSES, display: "Despesas" },
    { enum: Permissions.EDIT_VENUE_SERVICES, display: "Serviços" },
    { enum: Permissions.EDIT_VENUE_CONTACTS, display: "Contatos" },
    { enum: Permissions.EDIT_VENUE_CALENDAR, display: "Calendário" },
    { enum: Permissions.EDIT_VENUE_PROPOSALS, display: "Orcamentos" },
];

export const proposalViewPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_PROPOSAL_DATES, display: "Datas" },
    { enum: Permissions.VIEW_PROPOSAL_INFO, display: "Informacoes do Evento" },
    { enum: Permissions.VIEW_PROPOSAL_PERSONAL_INFO, display: "Informacoes do Pessoais" },
    { enum: Permissions.VIEW_PROPOSAL_HISTORY, display: "Historico" },
    { enum: Permissions.VIEW_PROPOSAL_PAYMENTS, display: "Pagamento" },
    { enum: Permissions.VIEW_PROPOSAL_DOCUMENTS, display: "Documentos" },
    { enum: Permissions.VIEW_PROPOSAL_SCHEDULE, display: "Programacao do evento" },
    { enum: Permissions.VIEW_PROPOSAL_ATTENDANCE_LIST, display: "Lista de presenca" },

];

export const proposalEditPermissions: PermissionItem[] = [
    { enum: Permissions.EDIT_PROPOSAL_INFO, display: "Informacoes" },
    { enum: Permissions.EDIT_PROPOSAL_DATES, display: "Datas" },
    { enum: Permissions.EDIT_PROPOSAL_PAYMENTS, display: "Pagamento" },
    { enum: Permissions.EDIT_PROPOSAL_DOCUMENTS, display: "Documentos" },
    { enum: Permissions.EDIT_PROPOSAL_SCHEDULE, display: "Programacao do evento" },
    { enum: Permissions.EDIT_PROPOSAL_ATTENDANCE_LIST, display: "Lista de presenca" },
    { enum: Permissions.CONFIRM_PROPOSAL_ATTENDANCE_LIST, display: "Confirmar/Cancelar presenca" },
];

export const generalPermissions: PermissionItem[] = [
    { enum: Permissions.VIEW_AMOUNTS, display: "Valores" },
]
