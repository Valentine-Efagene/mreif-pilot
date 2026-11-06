import { Mortgage } from "./mortgage.entity";
import { PaginatedData } from "../common/common.type";

export interface IPaginatedMortgages {
    total: number;
    totalPages: number;
    currentPage: number;
    data: Mortgage[];
}

export class PaginatedUsers extends PaginatedData {
    data: Mortgage[];
}