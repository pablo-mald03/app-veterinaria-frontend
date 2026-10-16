
//Validator for digits only
export const digitsOnly = (value: string) => value.replace(/\D/g, "");

//Keeps digits and at most one decimal point, with up to 2 decimals (prices, percentages)
export const decimalOnly = (value: string) => {
    const [integer, ...decimals] = value.replace(/[^\d.]/g, "").split(".");
    return decimals.length ? `${integer}.${decimals.join("").slice(0, 2)}` : integer;
};