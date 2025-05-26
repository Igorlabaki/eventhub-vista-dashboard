import { Contract } from "./contract";

export interface Clause {
    id: string;
    text: string;
    title: string;
    position?: number;
    createdAt: Date;
    updatedAt: Date;
    clauseId?: string;
    contracts?: Contract[];
    clause?: Clause;
    organizationId: string;
}

export interface CreateClauseDTO {
    text: string;
    title: string;
    organizationId: string;
}

export interface UpdateClauseDTO {
    previousTitle: string;
    clauseId: string;
    data: {
      text: string;
      title: string;
    };
}

export interface ClauseByIdResponse {
    success: true,
    message: string,
    data: {
        clause: Clause
    },
    count: number,
    type: string
}

export interface ClauseListResponse {
    success: true,
    message: string,
    data: {
        clauseList: Clause[]
    },
    count: number,
    type: string
}

export interface ClauseCreateResponse {
    success: true,
    message: string,
    data: Clause,
    count: number,
    type: string
}

export interface ClauseDeleteResponse {
    success: true,
    message: string,
    data: Clause,
    count: number,
    type: string
}

export interface ClauseUpdateResponse {
    success: true,
    message: string,
    data: Clause,
    count: number,
    type: string
}