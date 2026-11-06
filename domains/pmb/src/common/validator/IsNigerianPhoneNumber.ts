import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsNigerianPhoneConstraint implements ValidatorConstraintInterface {
    validate(phone: any, args: ValidationArguments) {
        const nigerianPhoneRegex = /^(?:\+234|0)[1-9][0-9]{9}$/;
        return typeof phone === 'string' && nigerianPhoneRegex.test(phone);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Phone number must be a valid Nigerian mobile or landline number.';
    }
}

export function IsNigerianPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsNigerianPhoneConstraint,
        });
    };
}
