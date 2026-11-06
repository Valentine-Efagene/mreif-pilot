import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { AgentType } from '../../agent/agent.enums';

const LIMIT = 100

export default function IsRequiredForCompanies(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isRequiredForCompanies',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [propertyName],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const agentType = (args.object as any).agentType;

                    if (agentType == AgentType.ORGANISATION) {
                        if (value == null) {
                            return false
                        }

                        if (typeof value === 'string' && value.length > LIMIT) {
                            return false
                        }
                    }

                    return true
                },
                defaultMessage(args: ValidationArguments) {
                    const { value } = args

                    if (typeof value === 'string' && value.length > LIMIT) {
                        return `${args.property} must be shorter than or equal to ${LIMIT} characters`
                    }

                    return `${args.property} is required for agent organisations.`;
                },
            },
        });
    };
}