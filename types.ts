
export enum Step {
    FIELD = 1,
    LEVEL = 2,
    CLO = 3,
    OPTIONS = 4,
    PLAN = 5,
}

export interface UserSelections {
    field: string;
    level: string;
    clos: string[];
}

export interface SuggestedTool {
    toolName: string;
    description: string;
}

export interface AssessmentPlan {
    title: string;
    description: string;
    designSteps: string[];
    tips: string[];
    suggestedAiTools: SuggestedTool[];
}
