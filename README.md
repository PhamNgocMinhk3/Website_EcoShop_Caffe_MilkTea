# 🧋 Project Drink Tea

> **Hệ thống quản lý quán trà sữa hiện đại – Tối ưu cho trải nghiệm người dùng và quản trị**


## 🚀 Tổng quan

**Project Drink Tea** là giải pháp quản lý quán trà sữa toàn diện, gồm:
- **Client**: Ứng dụng web Angular 20, giao diện hiện đại, responsive, trải nghiệm mượt mà.
- **Server**: API ASP.NET Core 8, bảo mật JWT, kết nối PostgreSQL, hiệu năng cao.



## 🗂️ Cấu trúc thư mục

| Thư mục         | Mô tả                        |
|-----------------|------------------------------|
| `client/`       | Frontend Angular (UI/UX)     |
| `Server/`       | Backend ASP.NET Core (API)   |



## ⚙️ Cài đặt nhanh

### Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) >= 18.x
- [.NET SDK](https://dotnet.microsoft.com/en-us/download) >= 8.0
- [PostgreSQL](https://www.postgresql.org/) >= 14

### 1️⃣ Cài đặt Client (Angular)
```bash
cd client
npm install
```

### 2️⃣ Cài đặt Server (ASP.NET Core)
```bash
cd Server
dotnet restore
```



## 🔧 Cấu hình hệ thống

- Sửa `Server/appsettings.json`:
  - `ConnectionStrings:DefaultConnection`: Kết nối PostgreSQL
  - `JwtSettings`: Bảo mật JWT
  - `MailSettings`: SMTP gửi mail (quên mật khẩu)
  - `VnPaySettings`: Thanh toán VNPay (nếu dùng)
- Đảm bảo API server chạy ở `http://localhost:5000` (hoặc sửa lại CORS nếu cần)



## ▶️ Chạy dự án

### 🖥️ Chạy Server
```bash
cd Server
dotnet ef database update   # Tạo/migrate database
DOTNET_ENVIRONMENT=Development dotnet run
```

### 🌐 Chạy Client
```bash
cd client
npm start
```

- Truy cập: [http://localhost:4200](http://localhost:4200)
- Đăng nhập admin mặc định: (tùy cấu hình seed)



## ✨ Tính năng nổi bật

| Chức năng                | Mô tả ngắn gọn                                                                 |
|--------------------------|-------------------------------------------------------------------------------|
| 🔐 Xác thực & phân quyền | Đăng nhập, đăng ký, JWT, phân quyền user/admin                                |
| 👩‍💼 Quản lý nhân viên    | Thêm/sửa/xóa, nhập file, xem chi tiết, phân ca, chấm công                     |
| 🧾 Quản lý đơn hàng      | Xem, lọc, cập nhật trạng thái, chi tiết từng đơn                              |
| 🥤 Quản lý sản phẩm      | CRUD sản phẩm, hình ảnh, giá, trạng thái                                      |
| 🪑 Quản lý bàn           | Thêm/sửa/xóa, cập nhật trạng thái, chọn bàn khi đặt món                       |
| 🏪 Quản lý kho           | Theo dõi tồn kho, nhập/xuất, cảnh báo nguyên liệu sắp hết                     |
| ⏰ Chấm công             | Check-in/out ca làm việc, xem lịch sử, chuyên cần                             |
| 📅 Phân ca/lịch làm việc | Kéo thả trực quan, xem lịch tuần, phân công linh hoạt                         |
| 💰 Bảng lương            | Xem, lọc, xuất Excel bảng lương theo tháng/năm                                |
| 📊 Thống kê/báo cáo      | Biểu đồ doanh thu, top sản phẩm, top topping, bảng xếp hạng nhân viên, tồn kho|
| 🛒 Đặt hàng & thanh toán | Chọn sản phẩm, giỏ hàng, chọn bàn, thanh toán, xem kết quả                    |
| 📢 Thông báo             | Popup/trang thông báo trạng thái đơn, nhắc nhở, hệ thống                      |
| 📞 Liên hệ               | Gửi phản hồi, góp ý, hỗ trợ khách hàng                                        |



## 🖼️ Sơ lược các trang & trải nghiệm

### 👤 Trang người dùng (User)

| Trang                | Đường dẫn                | Mục đích & UX/UI nổi bật                                                                 |
|----------------------|--------------------------|------------------------------------------------------------------------------------------|
| **Trang chủ**        | `/`                      | Landing page, banner động, sản phẩm nổi bật, CTA rõ ràng                                |
| **Sản phẩm**         | `/products`              | Lọc, tìm kiếm, xem chi tiết, thêm vào giỏ hàng, hình ảnh lớn, rating                    |
| **Chi tiết sản phẩm**| `/products/:id`          | Mô tả, topping, giá, thêm vào giỏ, gợi ý sản phẩm liên quan                             |
| **Chọn bàn**         | `/tables/select`         | Chọn bàn trực quan, trạng thái màu sắc, UX mobile-friendly                              |
| **Giỏ hàng**         | (popup/trang riêng)      | Xem, sửa, xóa sản phẩm, tổng tiền, chuyển nhanh sang thanh toán                         |
| **Thanh toán**       | `/checkout`              | Nhập thông tin, chọn phương thức, xác nhận, UX rõ ràng, cảnh báo lỗi                    |
| **Kết quả thanh toán**| `/checkout/payment-result`| Thông báo động, icon trạng thái, hướng dẫn tiếp theo                                   |
| **Liên hệ**          | `/contact`               | Form liên hệ, xác thực, gửi mail, feedback nhanh                                        |
| **Thông báo**        | (popup/trang riêng)      | Hiển thị trạng thái đơn, nhắc nhở, hiệu ứng động                                        |
| **Xác thực**         | `/auth`                  | Đăng nhập, đăng ký, quên mật khẩu, UX đơn giản, xác thực email                          |

### 🛠️ Trang quản trị (Admin)

| Trang                  | Đường dẫn                | Mục đích & UX/UI nổi bật                                                                |
|------------------------|--------------------------|-----------------------------------------------------------------------------------------|
| **Dashboard**          | `/admin/dashboard`       | Thống kê nhanh, biểu đồ động, tổng quan hệ thống, animation chart                      |
| **Nhân viên**          | `/admin/employees`       | Danh sách, tìm kiếm, modal thêm/sửa, nhập file, phân ca, UX tối ưu thao tác             |
| **Sản phẩm**           | `/admin/products`        | CRUD, upload ảnh, modal chi tiết, phân trang, filter                                    |
| **Đơn hàng**           | `/admin/orders`          | Danh sách, lọc trạng thái, xem chi tiết, cập nhật nhanh                                 |
| **Bàn**                | `/admin/tables`          | Quản lý bàn, trạng thái màu, thao tác nhanh, UX trực quan                               |
| **Kho/Nguyên liệu**    | `/admin/warehouse`       | Theo dõi tồn kho, nhập/xuất, cảnh báo, import file, phân trang                          |
| **Chấm công**          | `/admin/time-tracking`   | Check-in/out, xem lịch sử, trạng thái động, đồng hồ thời gian thực                     |
| **Phân ca**            | `/admin/work-schedule`   | Kéo thả phân ca, xem lịch tuần, modal phân công, UX drag-drop                          |
| **Xem lịch**           | `/admin/view-schedule`   | Lịch tuần, xem phân công toàn bộ nhân viên, responsive                                  |
| **Bảng lương**         | `/admin/payroll`         | Xem, lọc, xuất Excel, bảng động, highlight trạng thái                                   |
| **Thống kê/Báo cáo**   | `/admin/statistics`      | Biểu đồ doanh thu, top sản phẩm, topping, nhân viên, tồn kho, animation                 |


## 💡 Tips sử dụng nhanh

- **⌨️ Shortcut:** Sử dụng phím tắt (nếu có) để thao tác nhanh trên dashboard.
- **🔍 Tìm kiếm:** Sử dụng ô tìm kiếm trên mọi trang quản lý để lọc dữ liệu tức thì.
- **📱 Mobile:** Giao diện tối ưu cho điện thoại, thao tác chạm/kéo thả mượt mà.
- **🛡️ Bảo mật:** Đăng xuất khi không sử dụng, đổi mật khẩu định kỳ.
- **📤 Xuất Excel:** Bảng lương, kho, đơn hàng đều có thể xuất file chỉ với 1 click.
- **🧑‍💼 Phân quyền:** Chỉ admin mới truy cập được các trang quản trị.



## 🔗 API tiêu biểu

| Chức năng         | Endpoint                        | Method | Body/Params                  |
|-------------------|----------------------------------|--------|------------------------------|
| Đăng ký           | `/api/Auth/register`             | POST   | `{ email, password }`        |
| Đăng nhập         | `/api/Auth/login`                | POST   | `{ email, password }`        |
| Chấm công         | `/api/ChamCong/check-in`         | POST   | `{ maNV }`                   |
| Lấy bảng lương    | `/api/Luong?month=7&year=2025`   | GET    | -                            |

> Xem chi tiết các API khác tại Swagger: [`http://localhost:5000/swagger`](http://localhost:5000/swagger)



## 🛡️ Lưu ý bảo mật & vận hành

- **Không commit thông tin mật khẩu, secret key thật lên GitHub** (hãy thay đổi trước khi public)
- Đổi mật khẩu email, JWT secret, database khi triển khai thật
- Sử dụng HTTPS khi deploy production
- Sao lưu database định kỳ



## 📚 Tài nguyên tham khảo

- [Angular CLI](https://angular.dev/tools/cli)
- [ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)



## 🤝 Đóng góp & License

- Pull request, issue, góp ý vui lòng gửi qua GitHub.
- License: MIT (hoặc cập nhật theo dự án của bạn).


> **Mọi thắc mắc, góp ý hoặc cần hỗ trợ, hãy liên hệ qua trang [Liên hệ](http://localhost:4200/contact) hoặc tạo issue trên GitHub!** 
