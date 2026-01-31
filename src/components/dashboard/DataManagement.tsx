"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson } from "lucide-react";
import { usePortfolioStore, Transaction } from "@/store/portfolioStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataManagement() {
    const { transactions, importTransactions } = usePortfolioStore();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    const handleExport = () => {
        if (transactions.length === 0) {
            toast.error("Không có dữ liệu để xuất");
            return;
        }

        // Create clean export schema (Allowed fields only)
        const exportData = transactions.map(t => ({
            type: t.type,
            goldType: t.goldType,
            brand: t.brand,
            quantity: t.quantity,
            price: t.price,
            totalValue: t.totalValue,
            date: t.date,
            note: t.note
        }));

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `oh-my-gold-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Đã xuất file backup thành công!");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            toast.error("Vui lòng chọn file JSON hợp lệ");
            return;
        }

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const parsedData = JSON.parse(content);

                if (!Array.isArray(parsedData)) {
                    throw new Error("Format file không đúng (phải là danh sách)");
                }

                // Simple validation
                const validTransactions = parsedData.filter((t: Partial<Transaction>) =>
                    t.type && t.goldType && t.date && typeof t.quantity === 'number' && typeof t.price === 'number'
                ) as Omit<Transaction, "id">[];

                if (validTransactions.length === 0) {
                    toast.error("Không tìm thấy dữ liệu giao dịch hợp lệ trong file");
                    return;
                }

                // Call store action
                const { added, skipped } = await importTransactions(validTransactions, user?.uid);

                if (added > 0) {
                    toast.success(`Đã nhập thành công ${added} giao dịch!${skipped > 0 ? ` (Bỏ qua ${skipped} trùng lặp)` : ''}`);
                } else if (skipped > 0) {
                    toast.info(`Tất cả ${skipped} giao dịch đều đã tồn tại, không có gì mới.`);
                } else {
                    toast.warning("Không nhập được giao dịch nào.");
                }

            } catch (error) {
                console.error("Import Error:", error);
                toast.error("Lỗi khi đọc file backup");
            } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
            }
        };

        reader.readAsText(file);
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
                        <FileJson className="h-4 w-4" />
                        Dữ liệu
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Quản lý dữ liệu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Xuất file Backup (JSON)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportClick} disabled={importing}>
                        <Upload className="mr-2 h-4 w-4" />
                        {importing ? "Đang xử lý..." : "Nhập từ file Backup"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Icon Only - Optional or included in main menu? 
                For now we only show it on desktop inside History header or somewhere similar.
                Actually we can make it visible on mobile as an icon button.
            */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleExport}>
                <Download className="h-5 w-5 text-muted-foreground" />
            </Button>
            {/* Import on mobile might be tricky if via same button, better separate or menu */}
        </>
    );
}
