"use client";

import { useMemo, useState } from "react";
import { Transaction } from "@/store/portfolioStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Gift, Trash2, Pencil, PiggyBank } from "lucide-react";
import { TransactionDialog } from "./TransactionDialog";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TransactionHistoryProps {
    transactions: Transaction[];
}

type FilterType = 'all' | 'buy' | 'sell' | 'gift';

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
    const { removeTransaction } = usePortfolioStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortOrder] = useState<'desc' | 'asc'>('desc');

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // 1. Type Filter
            if (filterType === 'buy' && t.type !== 'buy') return false;
            if (filterType === 'sell' && t.type !== 'sell') return false;
            if (filterType === 'gift' && !t.type.startsWith('gift')) return false;

            // 2. Search Filter (Note or Gold Type or Date)
            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                const matchesNote = t.note?.toLowerCase().includes(lowerTerm);
                const matchesType = t.goldType.toLowerCase().includes(lowerTerm);
                const matchesDate = t.date.includes(lowerTerm);
                return matchesNote || matchesType || matchesDate;
            }

            return true;
        }).sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [transactions, filterType, searchTerm, sortOrder]);



    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            {/* Header with Search & Controls */}
            <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Lịch Sử Giao Dịch</h3>
                    <p className="text-sm text-muted-foreground">
                        Hiển thị {filteredTransactions.length}/{transactions.length} giao dịch
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="bg-background pl-9 w-full sm:w-[200px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        {(['all', 'buy', 'sell', 'gift'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    filterType === type
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                )}
                            >
                                {type === 'all' ? 'Tất cả' : type === 'buy' ? 'Mua' : type === 'sell' ? 'Bán' : 'Quà'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="max-h-[500px] overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Filter className="h-10 w-10 opacity-20 mb-3" />
                        <p>Không tìm thấy giao dịch nào</p>
                    </div>
                ) : (
                    <>
                        {/* MOBILE VIEW (< md) */}
                        <div className="divide-y md:hidden">
                            {filteredTransactions.map((t) => (
                                <div key={t.id} className="relative group grid grid-cols-[auto_1fr_auto] gap-3 p-4 hover:bg-muted/50 transition-colors items-start">
                                    {/* 1. Icon (Left) */}
                                    <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full mt-1",
                                        t.type === 'buy' ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                                            t.type === 'sell' ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                                                t.type === 'gift_in' ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" :
                                                    "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                    )}>
                                        {t.type === 'buy' ? <ArrowDownRight className="h-5 w-5" /> :
                                            t.type === 'sell' ? <ArrowUpRight className="h-5 w-5" /> :
                                                t.type === 'gift_in' ? <PiggyBank className="h-5 w-5" /> :
                                                    <Gift className="h-5 w-5" />}
                                    </div>

                                    {/* 2. Info (Middle) */}
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-sm">
                                                {t.type === 'buy' ? 'Mua vào' : t.type === 'sell' ? 'Bán ra' : t.type === 'gift_in' ? 'Được tặng' : 'Tặng quà'}
                                            </p>
                                            <span className="inline-flex items-center rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-background/50">
                                                {t.goldType === 'nhan_9999' ? 'Nhẫn 9999' : t.goldType === 'sjc' ? 'SJC' : 'Trang sức'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                            <span className="whitespace-nowrap">
                                                {new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="font-medium text-foreground/80">
                                                {t.quantity.toString().replace('.', ',')} Chỉ
                                            </span>
                                            {t.brand && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20">
                                                        {t.brand}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. Value & Actions (Right) */}
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-right">
                                            <p className={cn(
                                                "font-bold text-sm tabular-nums leading-tight",
                                                t.type === 'buy' ? "text-red-600 dark:text-red-400" :
                                                    t.type === 'sell' ? "text-green-600 dark:text-green-400" :
                                                        t.type === 'gift_in' ? "text-purple-600" :
                                                            "text-orange-600"
                                            )}>
                                                {t.type === 'buy' ? '-' : t.type === 'sell' ? '+' : ''}
                                                {t.totalValue.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-muted-foreground">₫</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                            <TransactionDialog
                                                existingTransaction={t}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background hover:shadow-sm">
                                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                }
                                            />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa giao dịch?</AlertDialogTitle>
                                                        <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => removeTransaction(t.id)} className="bg-red-600 hover:bg-red-700 text-white">Xóa</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP VIEW (Table) */}
                        <div className="hidden md:block px-6 pb-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[100px]">Ngày</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Sản phẩm / Thương hiệu</TableHead>
                                        <TableHead className="text-right">KL (Chỉ)</TableHead>
                                        <TableHead className="text-right">Giá (₫/Chỉ)</TableHead>
                                        <TableHead className="text-right">Thành tiền</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.map((t) => (
                                        <TableRow key={t.id} className="group hover:bg-muted/50">
                                            <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-full",
                                                        t.type === 'buy' ? "bg-red-100 text-red-600" :
                                                            t.type === 'sell' ? "bg-green-100 text-green-600" :
                                                                t.type === 'gift_in' ? "bg-purple-100 text-purple-600" :
                                                                    "bg-orange-100 text-orange-600"
                                                    )}>
                                                        {t.type === 'buy' ? <ArrowDownRight className="h-4 w-4" /> :
                                                            t.type === 'sell' ? <ArrowUpRight className="h-4 w-4" /> :
                                                                t.type === 'gift_in' ? <PiggyBank className="h-4 w-4" /> :
                                                                    <Gift className="h-4 w-4" />}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {t.type === 'buy' ? 'Mua vào' : t.type === 'sell' ? 'Bán ra' : t.type === 'gift_in' ? 'Được tặng' : 'Tặng quà'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="inline-flex items-center rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-background/50">
                                                        {t.goldType === 'nhan_9999' ? 'Nhẫn 9999' : t.goldType === 'sjc' ? 'SJC' : 'Trang sức'}
                                                    </span>
                                                    {t.brand && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20">
                                                            {t.brand}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {t.quantity.toString().replace('.', ',')}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                                                {t.price > 0 ? t.price.toLocaleString('vi-VN') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={cn(
                                                    "font-bold text-sm tabular-nums",
                                                    t.type === 'buy' ? "text-red-600" :
                                                        t.type === 'sell' ? "text-green-600" :
                                                            t.type === 'gift_in' ? "text-purple-600" :
                                                                "text-orange-600"
                                                )}>
                                                    <span>{t.type === 'buy' ? '-' : t.type === 'sell' ? '+' : ''}</span>
                                                    {t.totalValue.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-muted-foreground">₫</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground italic">
                                                {t.note || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <TransactionDialog
                                                        existingTransaction={t}
                                                        trigger={
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background">
                                                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </Button>
                                                        }
                                                    />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Xóa giao dịch?</AlertDialogTitle>
                                                                <AlertDialogDescription>Không thể hoàn tác.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => removeTransaction(t.id)} className="bg-red-600 text-white">Xóa</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
