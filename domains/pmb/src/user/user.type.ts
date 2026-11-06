import { User } from "./user.entity";
import { PaginatedData } from '../common/common.type';

export interface IPaginatedUsers {
    total: number;
    totalPages: number;
    currentPage: number;
    data: User[];
}

export class PaginatedUsers extends PaginatedData {
    data: User[];
}