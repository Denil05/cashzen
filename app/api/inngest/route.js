import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlert, generateMonthlyReports, processRecurringTransactions, triggerRecurringTransactions } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [checkBudgetAlert, triggerRecurringTransactions,processRecurringTransactions,generateMonthlyReports],
  middleware: {
    onError: (error) => {
      console.error("Inngest function error:", error);
      return {
        status: 500,
        body: { error: "Internal server error" }
      };
    }
  }
});
