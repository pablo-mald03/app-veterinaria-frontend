import type { ZodType } from "zod";

export type Validator = ZodType | ((value: string) => string | undefined);

/*Validator hook  */
export function runValidator(validator: Validator | undefined, value: string): string | undefined {
    if (!validator) return undefined;
    if (typeof validator === "function") return validator(value);

    const result = validator.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
}