"use client";  
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useEffect} from 'react'
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { bulkDeleteTransactions } from '@/action/account';
import useFetch  from '@/hooks/use-fetch';

const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};

function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

const TransactionTable = ({transactions}) => {

    const router = useRouter();

    const [selectedIds, setselectedIds]=useState([]);

    const [sortConfig, setSortConfigId]=useState({
        field:"date",
        direction:"desc",
    });

    const [searchTerm, setSearchTerm]=useState("");
    const [typeFilter, setTypeFilter]=useState("");
    const [recurringFilter, setRecurringFilter]=useState("");

    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
    }=useFetch(bulkDeleteTransactions); 

    const handleBulkDelete = async () => {
        if(!window.confirm("Are you sure you want to delete these transactions?")) return;
        deleteFn(selectedIds);
    };

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.success("Transactions deleted successfully"); 
            setselectedIds([]);
        }
    }, [deleted, deleteLoading]);

    const filteredAndSortedTransactions = useMemo(() => {
        let filteredTransactions = [...transactions];
        if(searchTerm){
            const searchTermLower = searchTerm.toLowerCase();
            filteredTransactions = filteredTransactions.filter(
                (transaction) => 
                transaction.description?.toLowerCase().includes(searchTermLower)
            );
        }
        if(recurringFilter){
          filteredTransactions=filteredTransactions.filter((transaction) => {
            if(recurringFilter==="Recurring")return transaction.isRecurring;
            return !transaction.isRecurring;
            });
        }
        if(typeFilter)
        {
            filteredTransactions=filteredTransactions.filter((transaction) => {
                return transaction.type === typeFilter;    
            });
        }

        filteredTransactions.sort((a,b) => {
            let comparison = 0;
            switch(sortConfig.field){
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                default:
                    comparison = 0; 
            }
            if(sortConfig.direction === "asc"){ 
                return comparison;
            } 
            return -comparison;
        });
        return filteredTransactions;
    },[
        transactions,
        searchTerm,
        typeFilter,
        recurringFilter,
        sortConfig,
    ]);

    const handleSort = (field) => {
        setSortConfigId((prevConfig) => ({
            field,
            direction:
                prevConfig.field === field && prevConfig.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    const handleSelect = (id) => {
        setselectedIds(current => current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
    }
    const handleSelectAll = (id) => {
        setselectedIds(current => current.length === filteredAndSortedTransactions.length ? [] : filteredAndSortedTransactions.map(transaction => transaction.id));
    }
    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setselectedIds([]);
    }

  return (
    <div className="space-y-4">
        {deleteLoading && <BarLoader className='mt-4' width={"100%"} color="#9333ea"/>}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input className="pl-8" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={value => setTypeFilter(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Types"/>
                    </SelectTrigger>
                    <SelectContent>
                        {/* <SelectItem value="">All</SelectItem> */}
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={recurringFilter} onValueChange={value => setRecurringFilter(value)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Transaction"/>
                    </SelectTrigger>
                    <SelectContent>
                        {/* <SelectItem value="">All</SelectItem> */}
                        <SelectItem value="Recurring">Recurrning</SelectItem>
                        <SelectItem value="Non-Recurring">Non-Recurring</SelectItem>
                    </SelectContent>
                </Select>

                {selectedIds.length > 0 && <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                        <Trash2 className="h-4 w-4 mr-2"/>
                        Delete({selectedIds.length})
                    </Button>
                </div>}

                {(searchTerm || typeFilter || recurringFilter) && 
                    <Button variant="outline" size="icon" className="bg-black text-white" onClick={handleClearFilters} title="Clear Filters">
                        <X className="h-4 w-4"/>
                    </Button>
                }
            </div>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow> 
                    <TableHead className="w-[50px]">
                        <Checkbox onCheckedChange={() => handleSelectAll()} checked={selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0} />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                        <div className="flex items-center">Date{" "} {sortConfig.field === 'date'&& (
                            sortConfig.direction==='asc'? (<ChevronUp className="ml-1 h-4 w-4"/>):(<ChevronDown className="ml-1 h-4 w-4"/>)
                        )}
                        </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("category")}><div className="flex items-center">Category{" "} {sortConfig.field === 'category'&& (
                            sortConfig.direction==='asc'? (<ChevronUp className="ml-1 h-4 w-4"/>):(<ChevronDown className="ml-1 h-4 w-4"/>)
                        )}</div></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                        <div className="flex items-center justify-end">Amount{" "} {sortConfig.field === 'amount'&& (
                            sortConfig.direction==='asc'? (<ChevronUp className="ml-1 h-4 w-4"/>):(<ChevronDown className="ml-1 h-4 w-4"/>)
                        )}</div>
                    </TableHead>
                    <TableHead>Recurring</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedTransactions === 0?(
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">No Transaction Found</TableCell>
                        </TableRow>
                    ):(
                        filteredAndSortedTransactions.map((transaction)=>(
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <Checkbox onCheckedChange={() => handleSelect(transaction.id)} checked={selectedIds.includes(transaction.id)} />
                                </TableCell>
                                <TableCell>
                                    {isValidDate(transaction.date) ? format(new Date(transaction.date), "PP") : "-"}
                                </TableCell>
                                <TableCell>
                                    {transaction.description}
                                </TableCell>
                                <TableCell>
                                    <span style={{
                                        background: categoryColors[transaction.category],
                                    }}
                                    className = "px-2 py-1 rounded text-white text-sm"
                                    >{transaction.category}</span>
                                </TableCell>
                                <TableCell className="text-right font-medium"  style={{color: transaction.type==="EXPENSE"? "red":"green",}}>
                                    {transaction.type==="EXPENSE"? "-":"+"}
                                    ${transaction.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {transaction.isRecurring?(
                                        <TooltipProvider>
                                            <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="outline" className="gap-1 text-purple-700 hover:bg-purple-200">
                                                    <RefreshCw className="w-3 h-3" />
                                                    {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        Next Date:
                                                    </div>
                                                    <div>
                                                        {isValidDate(transaction.nextRecurringDate) ? format(new Date(transaction.nextRecurringDate), "PP") : "-"}
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                      
                                    ):(
                                        <Badge variant="outline" className="gap-1">
                                            <Clock className="w-3 h-3" />
                                            One-time
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-right">
                                            <MoreHorizontal className="w-4 h-4" />  
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}>
                                            Edit
                                        </DropdownMenuItem>   
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" 
                                        onClick={() => deleteFn(transaction.id)}
                                        >
                                        Delete</DropdownMenuItem>
                                        
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    </div>
  )
}

export default TransactionTable;
