# GoldTracker - Sổ Vàng Tích Sản 🏆

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg) ![React](https://img.shields.io/badge/React-19-blue.svg) ![Bun](https://img.shields.io/badge/Bun-Fast-orange.svg)

**GoldTracker** là ứng dụng web quản lý danh mục đầu tư vàng cá nhân hiện đại, giúp bạn theo dõi tài sản, cập nhật giá thị trường real-time và tối ưu lợi nhuận đầu tư.

## 🌟 Tính Năng Nổi Bật

### 1. Quản Lý Danh Mục Đầu Tư (Portfolio)
- **Theo dõi chi tiết**: Ghi lại lịch sử Mua, Bán và Vàng Được Tặng.
- **Phân loại tài sản**: Tách biệt rõ ràng giữa "Vàng Tự Mua (Đầu tư)" và "Vàng Quà Tặng" để tính toán hiệu quả đầu tư chính xác.
- **Định giá Real-time**: Tự động tính tổng tài sản và lợi nhuận (Lời/Lỗ) dựa trên giá thị trường hiện tại.

### 2. Thông Tin Thị Trường (Market Insights)
- **Cập nhật liên tục**: Giá vàng từ các thương hiệu lớn (SJC, DOJI, PNJ, Bảo Tín Minh Châu, Ngọc Thẩm...).
- **Smart Insights**: Tự động đề xuất:
  - **Nên Mua Ở Đâu?** (Tìm nơi bán rẻ nhất).
  - **Nên Bán Ở Đâu?** (Tìm nơi thu mua cao nhất).
- **Trực quan hóa**: Giao diện bảng giá hiện đại, dễ nhìn.

### 3. Trải Nghiệm Người Dùng (UX)
- **Mobile-First Design**: Giao diện tối ưu hoàn hảo cho điện thoại.
- **Sticky Footer Ticker**: Dòng giá chạy liên tục dưới chân màn hình như sàn chứng khoán.
- **Dark Mode Ready**: Giao diện sáng/tối linh hoạt (đang phát triển).

## 🛠 Công Nghệ Sử Dụng

Dự án được xây dựng trên nền tảng công nghệ mới nhất (2025 Standard):

- **Core**: [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/).
- **Language**: TypeScript.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/).
- **Runtime & Package Manager**: [Bun](https://bun.sh/) (Siêu nhanh).
- **Icons**: Lucide React.
- **Data Persistence**: Firebase / Firestore.
- **State Management**: Zustand.

## 🚀 Cài Đặt & Chạy Dự Án

Dự án sử dụng **Bun**. Hãy đảm bảo bạn đã cài đặt Bun.

```bash
# 1. Clone dự án
git clone https://github.com/ntuan2502/gold-tracker.git
cd gold-tracker

# 2. Cài đặt dependencies
bun install

# 3. Chạy server development
bun run dev
```

Truy cập `http://localhost:3000` để trải nghiệm.

## 📱 Giao Diện Mobile
- **Header thông minh**: Tự động thu gọn tên người dùng và hiển thị nút "Thêm giao dịch" full-width thuận tiện thao tác một tay.
- **Thống kê phân tầng**: Tổng tài sản và Lợi nhuận được tách dòng rõ ràng, đảm bảo hiển thị tốt với số tiền hàng chục tỷ đồng.

## ⚠️ Troubleshooting (Sự cố thường gặp)

### Lỗi: `auth/unauthorized-domain` khi Deploy lên Vercel
Đây là tính năng bảo mật của Firebase. Để fix:
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Vào **Authentication** -> **Settings** -> **Authorized domains**.
3. Nhấn **Add domain** và thêm domain của bạn (ví dụ: `gold-tracker.vercel.app`).

## 📄 License
MIT License.

---
*Developed with ❤️ by [Tún](https://github.com/ntuan2502)*
