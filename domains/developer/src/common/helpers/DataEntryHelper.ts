import { faker } from "@faker-js/faker/.";
import { CreateDeveloperDto, UpdateDeveloperDto } from "../../developer/developer.dto";
import { CreateUserDto } from "../../user/user.dto";
import { Role } from "../../user/user.enums";
import { ModeOfBusinessRegistration } from "../../developer/developer.enums";

export default class DataEntryHelper {
    public static createUserDto: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        roles: [Role.DEVELOPER],
        phone: faker.phone.number()
    };

    public static createDeveloperDto: CreateDeveloperDto = {
        userId: 1,
    };

    public static updateDeveloperDto: UpdateDeveloperDto = {
        businessName: 'Dangote Group',
        accountName: 'Aliko Dangote'
    };

    public static buildCreateDeveloperDto: (userId: number) => CreateDeveloperDto = (userId) => {
        const data: CreateDeveloperDto = {
            userId,
            businessName: faker.company.name(),
            accountName: faker.company.name(),
            accountNumber: faker.finance.accountNumber(),
            operatingAddress: faker.location.streetAddress(),
            registeredAddress: faker.location.streetAddress(),
            isGovernmentAgency: faker.datatype.boolean(),
            hasTrackRecordInPropertyDevelopment: faker.datatype.boolean(),
            hasAuditedAccounts: faker.datatype.boolean(),
            jobRole: faker.person.jobTitle(),
            tin: faker.finance.accountNumber(),
            rcNumber: faker.finance.accountNumber(),
            yearsOfOperation: faker.number.int({ min: 1, max: 20 }),
            modeOfRegistration: faker.helpers.enumValue(ModeOfBusinessRegistration),
            agreedToTerms: faker.datatype.boolean(),
            logo: faker.image.urlPicsumPhotos()
        }

        return data
    };

    public static buildUpdateDeveloperDto: () => UpdateDeveloperDto = () => {
        const data: UpdateDeveloperDto = {
            businessName: 'Dangote Group'
        }

        return data
    };
}