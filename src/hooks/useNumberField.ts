"use client";

import { useMemo } from "react";
import { useField } from "@/hooks/useField";
import type { Validator } from "@/lib/forms/validator";

interface UseNumberFieldOptions {
    initialValue?: number;
    validator?: Validator;
    validateOn?: "change" | "blur" | "submit";
    transform?: (value: number) => number;
}

/**
 * Number field adapter hook for the validation
 */
export function useNumberField({
    initialValue = 0,
    validator,
    validateOn = "blur",
    transform,
}: UseNumberFieldOptions = {}) {
    const field = useField({
        initialValue: String(initialValue),
        validator,
        validateOn,
    });

    const valueAsNumber = useMemo(() => {
        if (field.value === "") return 0;
        const n = Number(field.value);
        return Number.isNaN(n) ? 0 : n;
    }, [field.value]);

    const setNumber = (next: number) => {
        const transformed = transform ? transform(next) : next;
        field.setValue(String(transformed));
    };

    return {
        ...field,
        value: valueAsNumber,
        setValue: setNumber,
    };
}