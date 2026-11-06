import { OnboardingStage } from "../proposed-development/proposed-development.type";
import { OnboardingStageName } from "../proposed-development/proposed-development.enums";
import { DeveloperOnboardingStage } from "../developer/developer.dto";
import { DeveloperOnboardingStageName } from "../developer/developer.enums";

export const defaultProposedDevelopmentOnboardingStages: OnboardingStage[] = [
    {
        name: OnboardingStageName.PRELIMINARY_EVALUATION,
        completed: false,
        completedAt: null,
    },
    {
        name: OnboardingStageName.PROJECT_INFO_DOCUMENTS,
        completed: false,
        completedAt: null,
    },
    {
        name: OnboardingStageName.TECHNICAL_DOCUMENTATION,
        completed: false,
        completedAt: null,
    },
    {
        name: OnboardingStageName.SALES_STRATEGY,
        completed: false,
        completedAt: null,
    },
    {
        name: OnboardingStageName.PROJECT_VIABILITY,
        completed: false,
        completedAt: null,
    },
];

export const defaultDeveloperOnboardingStages: DeveloperOnboardingStage[] = [
    {
        name: DeveloperOnboardingStageName.BUSINESS_DETAILS,
        completed: false,
        completedAt: null,
        isCurrent: false
    },
    {
        name: DeveloperOnboardingStageName.GROUP_ENTITIES,
        completed: false,
        completedAt: null,
        isCurrent: false
    },
    {
        name: DeveloperOnboardingStageName.DEVELOPER_DOCUMENTS,
        completed: false,
        completedAt: null,
        isCurrent: false
    },
    {
        name: DeveloperOnboardingStageName.BANK_INFORMATION,
        completed: false,
        completedAt: null,
        isCurrent: false
    },
    {
        name: DeveloperOnboardingStageName.DIRECTORS_FORM,
        completed: false,
        completedAt: null,
        isCurrent: false
    },
    {
        name: DeveloperOnboardingStageName.TERMS_AND_CONDITION,
        completed: false,
        completedAt: null,
        isCurrent: false
    },
];