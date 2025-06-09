"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";


const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const seralizeAmount = (transaction) => {
    return {
        ...transaction,
        amount: transaction.amount.toNumber(),
    };
};

export async function createTransaction(data){
    try{
        const {userId} = await auth();
        if(!userId){
            return {error: "Unauthorized"}
        }

        const req = await request();

        const decision = await aj.protect(req, {
            userId,
            requested: 1,
        })
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                const { remaining, reset } = decision.reason;
                console.error({
                    code:"RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInseconds: reset, 
                    },
                });

                throw new Error("Too many requests. Please try again later.");
            }
            throw new Error("Request Blocked"); 
        }   

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if(!user){
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            },
        });
        if(!account){
            throw new Error("Account not found");
        }
        
        const balanceChange = data.type === "INCOME" ? data.amount : -data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;
        const transaction = await db.$transaction(async(tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    date: new Date(data.date),
                    category: data.category,
                    accountId: account.id,
                    userId: user.id,
                    isRecurring: data.isRecurring,
                    recurringInterval: data.recurringInterval,
                    nextRecurringDate: data.isRecurring && data.recurringInterval 
                        ? calculateNextRecurringDate(data.date, data.recurringInterval) 
                        : null,
                },
            });
            await tx.account.update({
                where: { id: account.id },
                data: { balance: newBalance },
            });
            return newTransaction;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);

        return {success: true, data: seralizeAmount(transaction)};
        
    }
    catch(error){
        console.error("Transaction creation error:", error);
        return {success: false, error: error.message};
    }
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

export async function scanReceipt(file){
    try{
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const arrayBuffer = await file.arrayBuffer();

        const base64String = Buffer.from(arrayBuffer).toString('base64');

        const prompt = `Analyze this receipt image and extract the following information in JSON format:
            - Total amount (just the number)
            - Date (in ISO format)
            - Description or items purchased (brief summary)
            - Merchant/store name
            - Type (must be "EXPENSE" for receipts)
            - Category (must be one of: housing, transportation, groceries, utilities, entertainment, food,
            shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense)
            
            Only respond with the valid JSON in this exact format:
            {
                "amount": number,
                "date": "ISO date string",
                "description": "string",
                "merchantName": "string",
                "type": "EXPENSE",
                "category": "string"
            }
            
            If it's not a receipt, return an empty object {}`;

        const result = await model.generateContent([
            {
                inlineData:{
                    data: base64String,
                    mimeType: file.type,
                },
            },
            prompt,
        ]);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try{
            const data= JSON.parse(cleanedText);
            return {
                amount: parseFloat(data.amount),
                date: new Date(data.date).toISOString(),
                description: data.description,
                merchantName: data.merchantName,
                type: data.type,
                category: data.category
            };
        }
        catch(parseError){
            console.error("Error parsing JSON response:", parseError);
            throw new Error("Invalid response formate from Gemini");
        }
    } catch(error) {
        console.error("Error scanning receipt:", error.message);
        throw new Error("Error scanning receipt");
    }
}

export async function getTransaction(id){
    const { userId } = await auth();
    if(!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if(!user) throw new Error("User not found");

    const transaction = await db.transaction.findUnique({
        where: { 
            id, 
            userId: user.id,
        },
    });

    if(!transaction) throw new Error("Transaction not found");
    
    return seralizeAmount(transaction);
}

export async function updateTransaction(id,data) {
    try{
        const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");
    
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
    
        if(!user) throw new Error("User not found");
        
        const originalTransaction = await db.transaction.findUnique({
            where: { 
                id,
                userId: user.id,
            },
            include: {
                account: true,
            },
        });
        if(!originalTransaction)throw new Error("Transaction not found");

        const oldBalanceChange = 
            originalTransaction.type === "EXPENSE"
            ? -originalTransaction.amount.toNumber()
            : originalTransaction.amount.toNumber();
        
        const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

        const netBalanceChange = newBalanceChange-oldBalanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const update = await tx.transaction.update({
                where: {
                    id,
                    userId: user.id,
                },
                data:{
                    ...data,
                    nextRecurringDate: 
                      data.isRecurring && data.recurringInterval
                        ? calculateNextRecurringDate(data.date, data.recurringInterval)
                        : null,

                },
            });

            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance: {
                        increment: netBalanceChange,
                    },
                },
            });
            return update;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${data.accountId}`);

        return { success: true, data: seralizeAmount(transaction)};
    } catch(error) {
        throw new Error(error.message);
    }
}