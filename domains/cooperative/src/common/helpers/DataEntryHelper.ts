import { faker } from '@faker-js/faker';
import { LicenseType } from "../../cooperative/cooperative.enums";
import { CreateCooperativeDto, UpdateCooperativeDto } from "../../cooperative/cooperative.dto";
import { CreateUserDto } from "../../user/user.dto";
import { UserRole } from "../../user/user.enums";

export default class DataEntryHelper {
    public static getCreateUserDto: () => CreateUserDto = () => ({
        firstName: "Jane",
        lastName: "Doe",
        cooperativeId: 1,
        email: 'janedoe@testmail.com',
        roles: [UserRole.USER],
    });

    public static getCreateCooperativeDto: () => CreateCooperativeDto = () => ({
        name: faker.company.name(),
        rcNumber: faker.commerce.isbn(),
        code: "7483",
        licenseType: LicenseType.NATIONAL,
        mobile: "+23478548834",
        phone: "+2342012808822",
        email: faker.internet.email(),
        logo: null,
    });

    public static getUpdateCooperativeDto: () => CreateCooperativeDto = () => ({
        name: "Jane Doe",
        rcNumber: faker.commerce.isbn(),
        code: "7483",
        licenseType: LicenseType.NATIONAL,
        mobile: "+23478548834",
        phone: "+23456544664",
        email: faker.internet.email(),
        website: faker.internet.domainName(),
        logo: null,
    });

    public static buildCreateUserDto: (cooperativeId?: number, roles?: UserRole[]) => CreateUserDto = (cooperativeId, roles) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const data: CreateUserDto = {
            firstName,
            lastName,
            cooperativeId,
            roles: roles ? roles : [UserRole.USER],
            email: faker.internet.email({ firstName, lastName })
        }

        return data
    };

    public static buildCreateCooperativeDto: () => CreateCooperativeDto = () => {
        const _data: CreateCooperativeDto = this.getCreateCooperativeDto()

        const data: CreateCooperativeDto = {
            ..._data
        }

        return data
    };

    public static buildUpdateCooperativeDto: (userId?: number) => UpdateCooperativeDto = (userId) => {
        const data: UpdateCooperativeDto = {
            name: "Jane Doe",
            rcNumber: faker.commerce.isbn(),
            code: "7483",
            licenseType: LicenseType.NATIONAL,
            mobile: "+23478548834",
            phone: "+2342012808822",
            email: "fhf@info.ng",
            website: faker.internet.domainName(),
            logo: null,
        }

        return data
    };
}