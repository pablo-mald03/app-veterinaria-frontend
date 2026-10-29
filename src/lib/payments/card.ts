import { digitsOnly } from "@/lib/forms/transform";

const MAX_CARD_DIGITS = 19;

export const formatCardNumber = (value: string) =>
    digitsOnly(value).slice(0, MAX_CARD_DIGITS).replace(/(\d{4})(?=\d)/g, "$1 ");

export const formatCardExpiry = (value: string) => {
    const digits = digitsOnly(value).slice(0, 4);
    return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export function passesLuhn(value: string): boolean {
    const digits = digitsOnly(value);
    if (digits.length === 0) return false;

    let sum = 0;
    let double = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = Number(digits[i]);
        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return sum % 10 === 0;
}

export function isFutureExpiry(value: string, today = new Date()): boolean {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) return false;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) return false;

    return year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth() + 1);
}
