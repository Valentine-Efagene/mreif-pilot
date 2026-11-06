import { User } from '../../../../domains/rsa/src/user/user.entity';
import { Rsa } from '../../../../domains/rsa/src/rsa/rsa.entity';
import { RsaDocument } from '../../../../domains/rsa/src/rsa-document/rsa-document.entity';
import { Mortgage } from '../../../../domains/rsa/src/mortgage/mortgage.entity';

export const RSA_ENTITIES = [User, Rsa, RsaDocument, Mortgage];
export const RSA_CONNECTION = 'rsa';
