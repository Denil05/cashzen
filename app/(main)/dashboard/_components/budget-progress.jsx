"use client";
import { updateBudget } from '@/action/budget';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const BudgetProgress = ({initialBudget, currentExpense}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(
        initialBudget?.amount?.toString() || ""
    );

    const percentUsed = initialBudget?.amount ? (currentExpense / initialBudget.amount) * 100 : 0;

    const handleUpdateBudget = async () => {
        const amount = parseFloat(newBudget);

        if(isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        await updateBudgetFn(amount);
    };

    const {
        loading: isLoading,
        fn: updateBudgetFn,
        data: updateBudgetData,
        error,
    } = useFetch(updateBudget);

    useEffect(() => {
        if(updateBudgetData?.success) {
            setIsEditing(false);
            toast.success("Budget updated successfully");
        }
    }, [updateBudgetData]);

    useEffect(() => {
        if(error) {
            toast.error(error.message || "Failed to update budget");
        }
    }, [error]);

    const handleCancel = () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setIsEditing(false);
    }
    
  return (
    <Card>
      <CardHeader className = "flex flex-row item-center justify-between space-y-0 pb-2">
        <div className="flex-1">
            <CardTitle>Monthly Budget(Default Account)</CardTitle>
            <div className="flex items-center gap-2 mt-1">
            {isEditing?<div className="flex items-center gap-2">
                <Input type='number' value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className = "w-32" placeholder="Enter amount" autoFocus disabled={isLoading}/>
                <Button variant = "ghost" size="icon" onClick={handleUpdateBudget} disabled={isLoading}>
                    <Check className = "w-4 h-4 text-green-500"/>
                </Button>
                <Button variant = "ghost" size="icon" onClick={handleCancel} disabled={isLoading}>
                    <X className = "w-4 h-4 text-red-500"/>
                </Button>
            </div> 
            : 
            <>
                <CardDescription>
                    {initialBudget? 
                        `$${currentExpense.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent`
                        :
                        "No budget set"}
                </CardDescription>
                <Button variant="ghost" size="icon" onClick={()=>setIsEditing(true)} className="h-6 w-6">
                    <Pencil className = "h-3 w-3"/>
                </Button>
            </>}
            </div>
        </div>
        </CardHeader>
        <CardContent>
            {initialBudget && 
                <div className="space-y-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Progress value={percentUsed} extrastyle={`${percentUsed>=90 ? "bg-red-500" : percentUsed>=70 ? "bg-yellow-500" : "bg-green-500"}`} />
                                <p className="text-xs text-muted-foreground text-right mt-2">{percentUsed.toFixed(2)}% used</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" sideOffset={8}>
                            {percentUsed.toFixed(2)}%
                        </TooltipContent>
                    </Tooltip>
                </div>
            }
        </CardContent>
    </Card>
  )
}

export default BudgetProgress;
