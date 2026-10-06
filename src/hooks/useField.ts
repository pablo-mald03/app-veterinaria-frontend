"use client";

import { runValidator, type Validator } from "@/lib/forms/validator";
import { useState } from "react";

export type ValidateOn = "change" | "blur" | "submit";

//Validation model
interface UseFieldOptions {
    initialValue?: string;
    validator?: Validator;
    validateOn?: ValidateOn;
    transform?: (value: string) => string;
}

//Field state with derived validation
export function useField({ initialValue = "", validator, validateOn = "blur", transform }: UseFieldOptions = {}) {
    const [value, setValue] = useState(initialValue);
    const [touched, setTouched] = useState(false);
    const [dirty, setDirty] = useState(false);

    const rawError = runValidator(validator, value);
    const visible = touched || (validateOn === "change" && dirty);

    const change = (next: string) => {
        setValue(transform ? transform(next) : next);
        setDirty(true);
    };

    const blur = () => {
        if (validateOn !== "submit") setTouched(true);
    };

    /** Mark as touched the field */
    const validate = (): boolean => {
        setTouched(true);
        return rawError === undefined;
    };

    const reset = () => {
        setValue(initialValue);
        setTouched(false);
        setDirty(false);
    };

    const error = visible ? rawError : undefined;

    return {
        value,
        error,
        valid: rawError === undefined,
        touched,
        setValue: change,
        validate,
        reset,
        props: { value, error, onValueChange: change, onBlur: blur },
    };
}