// Formato de montos en quetzales. Q 1,250.00 (es-GT, moneda GTQ).

const formatter = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
});

export function formatCost(amount: number): string {
    return formatter.format(amount);
}
