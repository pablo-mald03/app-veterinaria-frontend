"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";
import type { DropdownOption } from "@/components/ui/common/Dropdown";

//The categories are not paginated in the UI, so a large page is requested
const CATEGORY_PAGE_SIZE = 200;

//Category options for the products filter (all) and form (inactive ones cannot be chosen)
export function useProductCategories() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        let active = true;

        categoryService
            .getAll({ size: CATEGORY_PAGE_SIZE })
            .then((result) => {
                if (active) setCategories(result.categories);
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    return useMemo(
        () => ({
            filterOptions: categories.map((c): DropdownOption => ({ value: String(c.id), label: c.name })),
            formOptions: categories.map(
                (c): DropdownOption => ({ value: String(c.id), label: c.name, disabled: !c.status, hint: c.status ? undefined : "Inactiva" }),
            ),
        }),
        [categories],
    );
}
