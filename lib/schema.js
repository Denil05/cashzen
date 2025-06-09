import { z } from "zod";

export const transactionSchema = z.object({
    type: z.enum(["EXPENSE", "INCOME"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().min(1, "Description is required"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Invalid date format",
    }),
    category: z.string().min(1, "Category is required"),
    accountId: z.string().min(1, "Account is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    nextRecurringDate: z.date().optional(),
}); 