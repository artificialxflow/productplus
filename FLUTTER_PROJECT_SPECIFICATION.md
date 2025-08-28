# ProductPlus - Flutter Project Specification

## پروژه ProductPlus - مشخصات کامل برای پیاده‌سازی با Flutter و MySQL

### 📋 خلاصه پروژه
ProductPlus یک سیستم مدیریت محصولات و قیمت‌گذاری است که شامل مدیریت کاربران، دسته‌بندی‌ها، محصولات، سفارشات و سیستم تخفیف می‌باشد. این پروژه با Next.js و Prisma پیاده‌سازی شده و حالا باید با Flutter و MySQL بازسازی شود.

---

## 🏗️ معماری سیستم

### ساختار کلی
- **Frontend**: Flutter (Android/iOS)
- **Backend**: Flutter (HTTP API calls)
- **Database**: MySQL
- **Authentication**: JWT + Local Storage
- **State Management**: Provider/Riverpod
- **UI Framework**: Material Design 3 + RTL Support

---

## 🗄️ ساختار دیتابیس (MySQL)

### جداول اصلی

#### 1. جدول `user_levels` (سطوح تخفیف کاربران)
```sql
CREATE TABLE user_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  discount_percentage INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. جدول `users` (کاربران)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  otp_code VARCHAR(6),
  otp_expires TIMESTAMP NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  level_id INT,
  discount_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (level_id) REFERENCES user_levels(id)
);
```

#### 3. جدول `categories` (دسته‌بندی‌ها)
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4. جدول `products` (محصولات)
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  description TEXT,
  stock INT DEFAULT 0,
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### 5. جدول `product_images` (تصاویر محصولات)
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  `order` INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### 6. جدول `orders` (سفارشات)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 7. جدول `order_items` (آیتم‌های سفارش)
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 📱 ساختار Flutter App

### پوشه‌بندی پروژه
```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── app_config.dart
│   ├── theme.dart
│   └── routes.dart
├── models/
│   ├── user.dart
│   ├── product.dart
│   ├── category.dart
│   ├── order.dart
│   └── user_level.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── storage_service.dart
│   └── notification_service.dart
├── providers/
│   ├── auth_provider.dart
│   ├── product_provider.dart
│   ├── cart_provider.dart
│   └── theme_provider.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── register_screen.dart
│   │   └── otp_verification_screen.dart
│   ├── home/
│   │   ├── home_screen.dart
│   │   └── product_list_screen.dart
│   ├── admin/
│   │   ├── admin_dashboard_screen.dart
│   │   ├── product_management_screen.dart
│   │   ├── user_management_screen.dart
│   │   ├── category_management_screen.dart
│   │   ├── order_management_screen.dart
│   │   └── bulk_import_screen.dart
│   └── profile/
│       ├── profile_screen.dart
│       └── settings_screen.dart
├── widgets/
│   ├── common/
│   │   ├── custom_app_bar.dart
│   │   ├── loading_widget.dart
│   │   ├── error_widget.dart
│   │   └── custom_button.dart
│   ├── product/
│   │   ├── product_card.dart
│   │   ├── product_grid.dart
│   │   └── product_table.dart
│   └── forms/
│       ├── product_form.dart
│       └── category_form.dart
└── utils/
    ├── constants.dart
    ├── helpers.dart
    └── validators.dart
```

---

## 🔧 وابستگی‌های Flutter (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.3.2
  
  # Local Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # UI Components
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  image_picker: ^1.0.4
  file_picker: ^6.1.1
  
  # Notifications
  flutter_local_notifications: ^16.3.0
  
  # Charts & Data
  fl_chart: ^0.65.0
  
  # Utilities
  intl: ^0.18.1
  url_launcher: ^6.2.1
  permission_handler: ^11.0.1
  
  # Excel/CSV Processing
  excel: ^2.1.0
  
  # QR Code
  qr_flutter: ^4.1.0
  
  # Localization
  flutter_localizations:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  hive_generator: ^2.0.1
  build_runner: ^2.4.7
```

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register - ثبت‌نام
POST /api/auth/login - ورود با ایمیل
POST /api/auth/send-otp - ارسال کد OTP
POST /api/auth/verify-otp - تایید کد OTP
POST /api/auth/logout - خروج
GET  /api/auth/verify - بررسی وضعیت احراز هویت
```

### Products
```
GET    /api/products - دریافت لیست محصولات
POST   /api/products - ایجاد محصول جدید
GET    /api/products/{id} - دریافت محصول
PUT    /api/products/{id} - ویرایش محصول
DELETE /api/products/{id} - حذف محصول
POST   /api/products/{id}/images - آپلود تصویر
```

### Categories
```
GET    /api/categories - دریافت دسته‌بندی‌ها
POST   /api/categories - ایجاد دسته‌بندی
PUT    /api/categories/{id} - ویرایش دسته‌بندی
DELETE /api/categories/{id} - حذف دسته‌بندی
```

### Users
```
GET    /api/users - دریافت لیست کاربران (Admin)
PUT    /api/users/{id} - ویرایش کاربر
PUT    /api/users/{id}/password - تغییر رمز عبور
PUT    /api/users/{id}/change-role - تغییر نقش کاربر
```

### Orders
```
GET    /api/orders - دریافت سفارشات
POST   /api/orders - ایجاد سفارش جدید
PUT    /api/orders/{id}/status - تغییر وضعیت سفارش
```

### Bulk Import
```
POST /api/bulk-import - آپلود فایل Excel/Word
```

---

## 🎨 UI/UX Requirements

### تم و استایل
- **زبان**: فارسی (RTL)
- **رنگ‌بندی**: Material Design 3
- **فونت**: Vazir یا IRANSans
- **جهت**: راست به چپ (RTL)

### صفحات اصلی
1. **صفحه ورود/ثبت‌نام**
2. **صفحه اصلی (لیست محصولات)**
3. **صفحه جزئیات محصول**
4. **پنل مدیریت (Admin)**
5. **پروفایل کاربر**
6. **مدیریت سفارشات**

### ویژگی‌های UI
- **Responsive Design**: پشتیبانی از اندازه‌های مختلف صفحه
- **Dark Mode**: حالت تاریک و روشن
- **Offline Support**: کارکرد آفلاین
- **Push Notifications**: اعلان‌های فوری
- **Image Caching**: کش کردن تصاویر

---

## 🔐 سیستم احراز هویت

### ویژگی‌ها
- **JWT Token**: احراز هویت با توکن
- **Local Storage**: ذخیره اطلاعات کاربر
- **Auto Login**: ورود خودکار
- **Role-based Access**: دسترسی بر اساس نقش
- **Phone Verification**: تایید شماره موبایل

### نقش‌های کاربر
- **USER**: کاربر عادی
- **ADMIN**: مدیر سیستم

---

## 📊 مدیریت محصولات

### ویژگی‌ها
- **CRUD Operations**: ایجاد، خواندن، ویرایش، حذف
- **Image Management**: مدیریت تصاویر
- **Category Management**: مدیریت دسته‌بندی‌ها
- **Stock Management**: مدیریت موجودی
- **Price Management**: مدیریت قیمت‌ها
- **Bulk Import**: ورود دسته‌جمعی از فایل

### فرمت‌های پشتیبانی شده
- **Excel**: .xlsx, .xls
- **Word**: .docx, .doc
- **CSV**: .csv

---

## 🛒 سیستم سفارش

### ویژگی‌ها
- **Shopping Cart**: سبد خرید
- **Order Tracking**: پیگیری سفارش
- **Status Management**: مدیریت وضعیت
- **Payment Integration**: یکپارچه‌سازی پرداخت
- **Order History**: تاریخچه سفارشات

### وضعیت‌های سفارش
- **PENDING**: در انتظار تایید
- **CONFIRMED**: تایید شده
- **SHIPPED**: ارسال شده
- **DELIVERED**: تحویل داده شده
- **CANCELLED**: لغو شده

---

## 💰 سیستم تخفیف

### ویژگی‌ها
- **User Levels**: سطوح کاربری
- **Discount Percentage**: درصد تخفیف
- **Dynamic Pricing**: قیمت‌گذاری پویا
- **Loyalty Program**: برنامه وفاداری

---

## 📱 ویژگی‌های موبایل

### Android
- **Permissions**: دسترسی‌های لازم
- **File Picker**: انتخاب فایل
- **Image Capture**: عکس‌برداری
- **Push Notifications**: اعلان‌های فوری

### iOS
- **Photo Library**: دسترسی به گالری
- **Camera Access**: دسترسی به دوربین
- **File Sharing**: اشتراک‌گذاری فایل
- **Local Notifications**: اعلان‌های محلی

---

## 🚀 Deployment & Distribution

### Android
- **Build**: APK/AAB
- **Store**: Google Play Store
- **Signing**: Keystore Configuration

### iOS
- **Build**: IPA
- **Store**: App Store
- **Signing**: Apple Developer Account

---

## 📋 چک‌لیست پیاده‌سازی

### فاز 1: پایه پروژه
- [ ] راه‌اندازی پروژه Flutter
- [ ] تنظیم MySQL Database
- [ ] پیاده‌سازی مدل‌های داده
- [ ] تنظیم API Service

### فاز 2: احراز هویت
- [ ] صفحات ورود/ثبت‌نام
- [ ] JWT Authentication
- [ ] Local Storage
- [ ] Phone Verification

### فاز 3: مدیریت محصولات
- [ ] CRUD Operations
- [ ] Image Management
- [ ] Category Management
- [ ] Bulk Import

### فاز 4: پنل مدیریت
- [ ] Admin Dashboard
- [ ] User Management
- [ ] Order Management
- [ ] Analytics

### فاز 5: ویژگی‌های پیشرفته
- [ ] Offline Support
- [ ] Push Notifications
- [ ] Dark Mode
- [ ] Localization

### فاز 6: تست و انتشار
- [ ] Unit Testing
- [ ] Integration Testing
- [ ] UI Testing
- [ ] Store Deployment

---

## 🔧 تنظیمات محیط توسعه

### پیش‌نیازها
- **Flutter SDK**: 3.16.0+
- **Dart SDK**: 3.2.0+
- **Android Studio**: 2023.1+
- **Xcode**: 15.0+ (برای iOS)
- **MySQL**: 8.0+
- **Node.js**: 18.0+ (برای API)

### متغیرهای محیطی
```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/productplus

# JWT
JWT_SECRET=your-secret-key-here

# API Base URL
API_BASE_URL=https://swpl.ir/api

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

---

## 📚 منابع و مراجع

### Flutter
- [Flutter Documentation](https://docs.flutter.dev/)
- [Flutter Cookbook](https://docs.flutter.dev/cookbook)
- [Material Design 3](https://m3.material.io/)

### MySQL
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

### State Management
- [Provider Package](https://pub.dev/packages/provider)
- [Riverpod](https://riverpod.dev/)

### UI Components
- [Flutter Widgets](https://docs.flutter.dev/development/ui/widgets)
- [Material Components](https://m3.material.io/components)

---

## 💡 نکات مهم پیاده‌سازی

### 1. RTL Support
- استفاده از `Directionality.rtl`
- تنظیم `TextDirection.rtl`
- پشتیبانی از فونت‌های فارسی

### 2. State Management
- استفاده از Provider برای مدیریت state
- جداسازی business logic از UI
- مدیریت cache و offline data

### 3. Security
- رمزنگاری رمز عبور با bcrypt
- استفاده از HTTPS
- اعتبارسنجی ورودی‌ها
- مدیریت JWT tokens

### 4. Performance
- Lazy loading برای تصاویر
- Pagination برای لیست‌ها
- Caching داده‌ها
- Optimized database queries

### 5. User Experience
- Loading states
- Error handling
- Offline indicators
- Smooth animations

---

## 🎯 نتیجه‌گیری

این پروژه یک سیستم کامل مدیریت محصولات است که باید با Flutter پیاده‌سازی شود. تمرکز اصلی بر روی:

1. **User Experience**: رابط کاربری ساده و کاربردی
2. **Performance**: سرعت بالا و بهینه‌سازی
3. **Security**: امنیت بالا و محافظت از داده‌ها
4. **Scalability**: قابلیت توسعه و گسترش
5. **Maintainability**: قابلیت نگهداری و توسعه

با پیروی از این مشخصات، می‌توانید یک اپلیکیشن موبایل کامل و حرفه‌ای ایجاد کنید که تمام نیازهای کسب‌وکار را برآورده کند.
