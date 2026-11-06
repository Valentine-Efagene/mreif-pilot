import { MortgageApplicant } from "./mortgage-applicant.entity";
import { PaginatedData } from "../common/common.type";

export interface IPaginatedMortgageApplicants {
    total: number;
    totalPages: number;
    currentPage: number;
    data: MortgageApplicant[];
}

export class PaginatedUsers extends PaginatedData {
    data: MortgageApplicant[];
}