import { inngest } from "@/lib/inngest/client";
import { db } from "../prisma";
import { sendEmail } from "@/action/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include:{
          user:{
            include:{
              accounts:{
                where:{
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for(const budget of budgets){
      const defaultAccount = budget.user.accounts[0];
      if(!defaultAccount) continue;
      
      const startDate = new Date();
      startDate.setDate(1);
      const expenses = await db.transaction.aggregate({
        where:{
          userId: budget.userId,
          accountId: defaultAccount.id,
          type: "EXPENSE",
          date:{
            gte: startDate,
          },
        },
        _sum:{
          amount: true,
        },
      });
      
      const totalExpenses = expenses._sum.amount?.toNumber() || 0;
      const budgetAmount = budget.amount;
      const percentageUsed = (totalExpenses / budgetAmount) * 100;
      
      if(percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))){
        //send Email
        await sendEmail({
          to: budget.user.email,
          subject: `Budget Alert for ${defaultAccount.name}`,
          react: EmailTemplate({
            userName: budget.user.name,
            type: "budget-alert",
            data: {
              percentageUsed,
              budgetAmount: Number(budgetAmount),
              totalExpenses: Number(totalExpenses),
              month: new Date().toLocaleString('default', { month: 'long' }),
              year: new Date().getFullYear(),
              accountName: defaultAccount.name,
            },
          }),
        });

        //Update lastAlertSent
        await db.budget.update({
          where:{
            id: budget.id,
          },
          data:{
            lastAlertSent: new Date(),
          },
        });
      }
    }
  }
);

function isNewMonth(lastAlertSent, currentDate){
  return (lastAlertSent.getMonth() !== currentDate.getMonth() || lastAlertSent.getFullYear() !== currentDate.getFullYear());
}

export const triggerRecurringTransactions= inngest.createFunction({
  id: "trigger-recurring-transaction",
  name: "Trigger Recurring Transaction",
  },{cron: "0 0 * * *"},
  async({ step })=>{
      try {
        const recurringTransactions = await step.run(
          "fetch-recurring-transaction",
          async()=>{
            return await db.transaction.findMany({
              where:{
                isRecurring: true,
                status: "COMPLETED",
                OR: [
                  { lastProcessed: null },
                  { nextRecurringDate: { lte: new Date() } },
                ],
              },
            });
            
          }
        );

        if(recurringTransactions.length > 0){
          const events = recurringTransactions.map((transaction) => ({
            name: "transaction.recurring.process",
            data: { transactionId: transaction.id, userId: transaction.userId },
          }));

          await inngest.send(events);
        }

        return { triggered: recurringTransactions.length };
      } catch (error) {
        console.error("Error in triggerRecurringTransactions:", error);
        throw error;
      }
  }
);

export const processRecurringTransactions= inngest.createFunction({
    id: "process-recurring-transaction",
    throttle:{
      limit:10,
      period:'1m',
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async({ event, step}) => {
    try {
      if(!event?.data?.transactionId || !event?.data?.userId){
        console.error("Invalid event data:", event.data);
        return { error: "Missing required event data" };
      }

      const result = await step.run("process-transaction",async()=>{
        const transaction = await db.transaction.findUnique({
          where: {
            id: event.data.transactionId,
            userId: event.data.userId,
          },
          include: {
            account: true,
          }
        });

        if(!transaction) {
          console.error("Transaction not found:", event.data.transactionId);
          return null;
        }

        if(!isTransactionDue(transaction)) {
          return null;
        }

        if(!transaction.recurringInterval) {
          console.error("Transaction has no recurring interval:", event.data.transactionId);
          return null;
        }

        const newTransaction = await db.$transaction(async (tx) => {
          const created = await tx.transaction.create({
            data: {
              type: transaction.type,
              amount: transaction.amount,
              description: `${transaction.description} (Recurring)`,
              date: new Date(),
              category: transaction.category,
              userId: transaction.userId,
              accountId: transaction.accountId,
              isRecurring: false,
            },
          });

          const balanceChange = transaction.type === "EXPENSE" ? -transaction.amount.toNumber() : transaction.amount.toNumber();
          const updatedAccount = await tx.account.update({
            where: {id: transaction.accountId },
            data: { balance: { increment: balanceChange} },
          });

          const updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              lastProcessed: new Date(),
              nextRecurringDate: calculateNextRecurringDate(
                new Date(),
                transaction.recurringInterval
              ),
            },
          });

          return { created, updatedAccount, updatedTransaction };
        });

        return newTransaction;
      });

      return result;
    } catch (error) {
      console.error("Error in processRecurringTransactions:", error);
      throw error;
    }
  }
);

function isTransactionDue(transaction){
  if(!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  return nextDue <= today;
}

function calculateNextRecurringDate(startdate, interval){
  const date = new Date(startdate);
  switch(interval){
      case "DAILY":
          date.setDate(date.getDate() + 1);
          break;
      case "WEEKLY":
          date.setDate(date.getDate() + 7);
          break;
      case "MONTHLY":
          date.setMonth(date.getMonth() + 1);
          break;
      case "YEARLY":
          date.setFullYear(date.getFullYear() + 1);
          break;
  }
  return date;
}

export const generateMonthlyReports = inngest.createFunction({
  id: "Generate-monthly-reports",
  name: "Generate Monthly Reports",
},
{cron: "0 0 1 * *"},
async({step})=>{
  const users = await step.run("fetch-users" , async () => {
    return await db.user.findMany({
      include: { accounts: true},
    });
  });

  for(const user of users){
    await step.run(`generate-report-${user.id}`, async()=>{
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth()-1);

      const stats = await getMonthlyStats(user.id, lastMonth);
      const monthName = lastMonth.toLocaleString("default", {
        month: "long",
      });
      const insights = await generateFinancialInsights(stats, monthName);

      await sendEmail({
        to: user.email,
        subject: "Your Monthly Financial Report",
        react: EmailTemplate({
          userName: user.name,
          type: "monthly-report",
          data: {
            month: monthName,
            year: lastMonth.getFullYear(),
            stats: {
              totalIncome: stats.totalIncome,
              totalExpenses: stats.totalExpenses,
              budgetAmount: 0,
              byCategory: stats.byCategory,
              previousMonthIncome: 0,
              previousMonthExpenses: 0
            },
            insights: insights
          },
        }),
      });      
    });
  }
  return { processed: users.length };
});

const getMonthlyStats = async (userId, month) => {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date:{
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats,t) => {
      const amount = t.amount.toNumber();
      if(t.type === "EXPENSE"){
        stats.totalExpenses += amount;
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
      } else { 
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
};

async function generateFinancialInsights(stats, month){
  const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `; 

  try{
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  }
  catch(error){
    console.error("Error generating insights:",error);
    return [
      "Your highest expense category this month might need attention",
      "Consider setting up a budget for better financial managment.",
      "Track your recurring expense to identify potential savings."
    ];
  }
}