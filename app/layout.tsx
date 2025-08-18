import type { Metadata } from "next";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const metadata: Metadata = {
  title: "لیست قیمت - Smartwise",
  description: "مدیریت محصولات و قیمت‌ها",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-vazir">
        {children}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
