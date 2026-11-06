import { faker } from '@faker-js/faker';
import { CreateRsaDto, UpdateRsaDto } from "../../rsa/rsa.dto";
import { CreateUserDto } from "../../user/user.dto";
import { UserRole } from "../../user/user.enums";
import { CreateMortgageDto } from '../../mortgage/mortgage.dto';

const MIN_DOCUMENT_SIZE = 34545
const MAX_DOCUMENT_SIZE = 50000

export default class DataEntryHelper {
    public static createUserDto: CreateUserDto = {
        firstName: "Jane",
        lastName: "Doe",
        email: 'janedoe@testmail.com',
        roles: [UserRole.PMB]
    };

    public static createRsaDto: CreateRsaDto = {
        rsaDocuments: [],
        mortgageId: 1,
        rsa: 'PEN-4545454545454',
        pfa: 'Homebase'
    };

    public static createMortgageDto: CreateMortgageDto = {
        userId: 1
    };

    public static updateRsaDto: UpdateRsaDto = {
    };

    public static buildCreateUserDto: (roles?: UserRole[]) => CreateUserDto = (roles) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const data: CreateUserDto = {
            firstName,
            lastName,
            roles: roles ? roles : [UserRole.PMB],
            email: `${firstName}${lastName}@testmail.com`,
        }

        return data
    };

    public static buildCreateMortgageDto: (userId: number) => CreateMortgageDto = (userId) => {
        const data: CreateMortgageDto = {
            ...this.createMortgageDto,
            userId
        }

        return data
    };

    public static buildCreateRsaDto: (mortgageId: number) => CreateRsaDto = (mortgageId) => {
        const _data = this.createRsaDto

        const data: CreateRsaDto = {
            ..._data,
            mortgageId,
            rsaDocuments: [
                {
                    name: faker.word.noun(),
                    url: faker.internet.url(),
                    size: faker.number.float({
                        min: MIN_DOCUMENT_SIZE,
                        max: MAX_DOCUMENT_SIZE
                    })
                },
                {
                    name: faker.word.noun(),
                    url: faker.internet.url(),
                    size: faker.number.float({
                        min: MIN_DOCUMENT_SIZE,
                        max: MAX_DOCUMENT_SIZE
                    })
                },
            ]
        }

        return data
    };
}