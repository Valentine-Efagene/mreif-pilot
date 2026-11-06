import { User } from '../../../../domains/pmb/src/user/user.entity';
import { Pmb } from '../../../../domains/pmb/src/pmb/pmb.entity';
import { Mortgage } from '../../../../domains/pmb/src/mortgage/mortgage.entity';
import { MortgageApplicant } from '../../../../domains/pmb/src/mortgage-applicant/mortgage-applicant.entity';

export const PMB_ENTITIES = [User, Pmb, Mortgage, MortgageApplicant];
export const PMB_CONNECTION = 'pmb';
