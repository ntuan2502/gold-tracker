export const SUPPORTED_BRANDS = ["SJC", "DOJI", "PNJ", "Bảo Tín Minh Châu", "Bảo Tín Mạnh Hải", "Phú Quý", "Mi Hồng", "Ngọc Thẩm"];

export const GOLD_TYPES = [
    { value: "bar", label: "Vàng miếng" },
    { value: "ring_9999", label: "Nhẫn tròn 9999" }
];

export const SCRAPER_CONFIG = {
    URL: "https://giavang.org/",
    UNIT_MULTIPLIER: 1000 // Convert to VND/Chi if source is different or standardizes usage
};

export const REFRESH_INTERVAL = 60000; // 1 minute
