import { faker } from '@faker-js/faker';
import { LicenseType } from "../../pmb/pmb.enums";
import { CreatePmbDto, UpdatePmbDto } from "../../pmb/pmb.dto";
import { CreateUserDto } from "../../user/user.dto";
import { UserRole } from "../../user/user.enums";

export default class DataEntryHelper {
    public static getCreateUserDto: () => CreateUserDto = () => ({
        firstName: "Jane",
        lastName: "Doe",
        pmbEmployerId: 1,
        email: 'janedoe@testmail.com',
        roles: [UserRole.PMB],
    });

    public static getCreatePmbDto: () => CreatePmbDto = () => ({
        name: faker.company.name(),
        rcNumber: faker.commerce.isbn(),
        code: "7483",
        licenseType: LicenseType.NATIONAL,
        mobile: "+23478548834",
        phone: "+2342012808822",
        email: faker.internet.email(),
        website: faker.internet.domainName(),
        logo: null,
    });

    public static getUpdatePmbDto: () => CreatePmbDto = () => ({
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

    public static buildCreateUserDto: (domain: string, pmbEmployerId?: number, category?: 'staff' | 'customer', roles?: UserRole[]) => CreateUserDto = (domain, pmbEmployerId, category, roles) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const data: CreateUserDto = {
            firstName,
            lastName,
            pmbEmployerId: category === 'staff' ? pmbEmployerId : null,
            pmbParentId: category === 'customer' ? pmbEmployerId : null,
            roles: roles ? roles : [UserRole.PMB],
            email: `${firstName}${lastName}@${domain}`
        }

        return data
    };

    public static buildCreatePmbDto: (domain: string) => CreatePmbDto = (domain) => {
        const _data: CreatePmbDto = this.getCreatePmbDto()

        const data: CreatePmbDto = {
            domain,
            ..._data
        }

        return data
    };

    public static buildUpdatePmbDto: (domain: string, userId?: number) => UpdatePmbDto = (domain, userId) => {
        const data: UpdatePmbDto = {
            name: "Jane Doe",
            rcNumber: faker.commerce.isbn(),
            code: "7483",
            domain,
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