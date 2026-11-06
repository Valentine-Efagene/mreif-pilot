import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { AgentType } from '../../agent/agent.enums';

export default function IsNotForIndividual(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNotForIndividual',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const agentType = (args.object as any).agentType;
                    return agentType !== AgentType.INDIVIDUAL || value == null;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} should not be provided for individual agents.`;
                },
            },
        });
    };
}