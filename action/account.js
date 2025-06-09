"use server";
 
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = {...obj};
    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
    if(obj.amount){
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
};

export async function updateDefaultAccount(accountId){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        
        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) throw new Error("User not found");

        // First, set all accounts to non-default
        await db.account.updateMany({
            where: {userId: user.id, isDefault: true},
            data: {isDefault: false},
        });

        // Then, set the selected account as default
        const account = await db.account.update({
            where: {id: accountId, userId: user.id},
            data: {isDefault: true},
        }); 

        revalidatePath("/dashboard");
        return {success: true, data: serializeTransaction(account)};
    }
    catch(error){
        console.error("Error updating default account:", error);
        return {success: false, error: error.message};
    }
}

export async function getAccountWithTransactions(accountId){
    try {
        const {userId} = await auth();
        if(!userId) return null;
            
        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) return null;

        const account = await db.account.findUnique({
            where: {id: accountId, userId: user.id},
            include: {
                transactions: {
                    orderBy: {
                        date: "desc"
                    }
                }
            }
        });

        if(!account) return null;

        const transactionCount = await db.transaction.count({
            where: {
                accountId: accountId
            }
        });

        return {
            ...serializeTransaction(account),
            transactions: account.transactions.map(serializeTransaction),
            _count: {
                transactions: transactionCount
            }
        };
    } catch (error) {
        console.error("Error fetching account with transactions:", error);
        return null;
    }
}

export async function bulkDeleteTransactions(transactionIds){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) throw new Error("User not found");
        
        const transactions = await db.transaction.findMany({
            where:{
                id: {in: transactionIds},
                userId: user.id,
            },
        });

        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            const change = transaction.type === "EXPENSE" ? transaction.amount : -transaction.amount;
            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});

        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: {
                    id: {in: transactionIds},
                    userId: user.id,
                },
            });
            
            for(const [accountId, change] of Object.entries(accountBalanceChanges)){
                await tx.account.update({
                    where: {id: accountId},
                    data: {balance: {increment: change}},
                });
            }
        });
        revalidatePath("/dashboard");
        revalidatePath(`/account/[id]`);
        return {success: true};
    }
    catch(error){
        console.error("Error deleting transactions:", error);
        return {success: false, error: error.message};
    }
}