"use client";

import { SUPPORTED_BRANDS } from "@/lib/constants";
import { usePortfolioStore, Transaction } from "@/store/portfolioStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TransactionDialogProps {
    existingTransaction?: Transaction;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function TransactionDialog({ existingTransaction, trigger }: TransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { addTransaction, updateTransaction } = usePortfolioStore();

    // Form State
    const [type, setType] = useState<"buy" | "sell" | "gift_in" | "gift_out">("buy");
    const [goldType, setGoldType] = useState("sjc");
    const [brand, setBrand] = useState("SJC");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState("");

    // Validation State
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

    // Load data if editing
    useEffect(() => {
        if (existingTransaction) {
            setType(existingTransaction.type);
            setGoldType(existingTransaction.goldType);
            setBrand(existingTransaction.brand || "SJC");
            // Format quantity with dots for thousands, comma for decimal
            const qtyStr = existingTransaction.quantity.toString().replace('.', ',');
            const [qtyInt, qtyDec] = qtyStr.split(',');
            const qtyFormatted = qtyInt.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (qtyDec ? ',' + qtyDec : '');
            setQuantity(qtyFormatted);
            setPrice(existingTransaction.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
            setDate(existingTransaction.date);
            setNote(existingTransaction.note || "");
        }
    }, [existingTransaction, open]);

    const handleSubmit = async () => {
        const errors: Record<string, boolean> = {};
        if (!quantity) errors.quantity = true;
        if (!price && !type.startsWith('gift')) errors.price = true;
        if (!date) errors.date = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error("Vui lòng nhập đầy đủ các trường bắt buộc");
            return;
        }

        setLoading(true);

        const priceClean = type.startsWith('gift') ? 0 : parseFloat(price.replace(/\./g, ""));
        const quantityClean = parseFloat(quantity.replace(/\./g, '').replace(',', '.'));

        const transactionData = {
            type,
            goldType,
            brand,
            quantity: quantityClean,
            price: priceClean,
            date,
            totalValue: quantityClean * priceClean,
            note: note.trim()
        };

        try {
            if (existingTransaction) {
                // Edit Mode
                await updateTransaction(existingTransaction.id, transactionData);
                toast.success("Cập nhật giao dịch thành công!");
            } else {
                // Add Mode
                await addTransaction(transactionData, user?.uid);
                toast.success(type === "buy" ? "Mua vàng thành công!" : "Bán vàng thành công!");
            }

            setOpen(false);
            if (!existingTransaction) {
                // Only reset if adding
                setQuantity("");
                setPrice("");
                setNote("");
                setFormErrors({});
            }
        } catch (error) {
            console.error("Transaction Error:", error);
            toast.error("Có lỗi xảy ra khi lưu dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Thêm giao dịch
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingTransaction ? "Sửa Giao Dịch" : "Giao dịch Vàng"}</DialogTitle>
                    <DialogDescription>
                        {existingTransaction ? "Cập nhật thông tin giao dịch" : "Nhập thông tin mua/bán vàng (Đơn vị: CHỈ)"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={type.startsWith('gift') ? 'gift' : type} onValueChange={(v) => {
                    // Explicitly cast or handle string value
                    if (v === 'buy') setType('buy');
                    else if (v === 'sell') setType('sell');
                    else setType('gift_in');
                }} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="buy">Mua vào</TabsTrigger>
                        <TabsTrigger value="sell">Bán ra</TabsTrigger>
                        <TabsTrigger value="gift">Quà tặng</TabsTrigger>
                    </TabsList>

                    <div className="space-y-4 py-4">
                        {/* Gift Direction Selector */}
                        {type.startsWith('gift') && (
                            <div className="flex gap-2 mb-2 p-1 bg-secondary/50 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "flex-1 h-7 text-xs transition-all",
                                        type === 'gift_in'
                                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-sm font-semibold"
                                            : "hover:bg-purple-50 text-muted-foreground"
                                    )}
                                    onClick={() => setType('gift_in')}
                                >
                                    Được Tặng (Nhập)
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "flex-1 h-7 text-xs transition-all",
                                        type === 'gift_out'
                                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-sm font-semibold"
                                            : "hover:bg-orange-50 text-muted-foreground"
                                    )}
                                    onClick={() => setType('gift_out')}
                                >
                                    Tặng/Biếu (Xuất)
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Loại vàng <span className="text-red-500">*</span></Label>
                            <Select value={goldType} onValueChange={setGoldType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn loại vàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sjc">Vàng miếng SJC</SelectItem>
                                    <SelectItem value="nhan_9999">Nhẫn tròn 9999</SelectItem>
                                    <SelectItem value="jewelry">Vàng trang sức</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Thương hiệu <span className="text-red-500">*</span></Label>
                            <Select value={brand} onValueChange={setBrand}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn thương hiệu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUPPORTED_BRANDS.map((b) => (
                                        <SelectItem key={b} value={b}>
                                            {b}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Khối lượng (CHỈ) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text"
                                    placeholder="0,5"
                                    inputMode="decimal"
                                    value={quantity}
                                    onChange={(e) => {
                                        // Allow digits and one comma
                                        const rawValue = e.target.value;

                                        // Only allow digits and ',' and '.' (dots might be pasted or user typed, we'll strip them)
                                        const cleanValue = rawValue.replace(/[^0-9,]/g, '');

                                        // Ensure only one comma
                                        const parts = cleanValue.split(',');
                                        if (parts.length > 2) return; // More than one comma

                                        // Format integer part: remove leading zeros (01 -> 1) then add dots
                                        let integerPart = parts[0];
                                        if (integerPart.length > 1 && integerPart.startsWith('0')) {
                                            integerPart = integerPart.replace(/^0+(?=\d)/, '');
                                        }
                                        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

                                        const decimalPart = parts.length > 1 ? ',' + parts[1] : '';

                                        setQuantity(integerPart + decimalPart);
                                        if (formErrors.quantity) setFormErrors({ ...formErrors, quantity: false });
                                    }}
                                    className={cn(formErrors.quantity && "border-red-500 focus-visible:ring-red-500")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Giá (VNĐ/CHỈ) {!type.startsWith('gift') && <span className="text-red-500">*</span>}</Label>
                                <Input
                                    type="text"
                                    placeholder="0"
                                    value={type.startsWith('gift') ? '0' : price}
                                    onChange={(e) => {
                                        // Remove non-digits
                                        const rawValue = e.target.value.replace(/\D/g, "");
                                        // Format with dots
                                        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                        setPrice(formattedValue);
                                        if (formErrors.price) setFormErrors({ ...formErrors, price: false });
                                    }}
                                    disabled={type.startsWith('gift')}
                                    className={cn(
                                        type.startsWith('gift') ? 'bg-muted text-muted-foreground' : '',
                                        formErrors.price && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Ngày giao dịch <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    if (formErrors.date) setFormErrors({ ...formErrors, date: false });
                                }}
                                className={cn(formErrors.date && "border-red-500 focus-visible:ring-red-500")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ghi chú (Tùy chọn)</Label>
                            <Input
                                placeholder={type === 'gift_in' ? "VD: Cưới, Sinh nhật..." : "VD: Tặng mẹ, Quỹ..."}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className={`w-full text-white ${type === 'buy' ? 'bg-green-600 hover:bg-green-700' :
                                type === 'sell' ? 'bg-red-600 hover:bg-red-700' :
                                    type === 'gift_in' ? 'bg-purple-600 hover:bg-purple-700' :
                                        'bg-orange-600 hover:bg-orange-700'
                                }`}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : `Xác nhận ${type === 'buy' ? 'MUA' :
                                type === 'sell' ? 'BÁN' :
                                    type === 'gift_in' ? 'NHẬP QUÀ' : 'XUẤT QUÀ'
                                }`}
                        </Button>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
