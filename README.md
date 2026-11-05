# UNIFIND – HỆ THỐNG TÌM KIẾM VÀ QUẢN LÝ ĐỒ THẤT LẠC TRONG TRƯỜNG ĐẠI HỌC
> **Tên tiếng Anh:** University Lost & Found Management System  
> **Đồ án Chuyên ngành:** Công nghệ Phần mềm  
> **Tác giả:** Chu Nguyễn Gia Bảo  

---

## 1. Giới thiệu dự án
**UniFind** là nền tảng trực tuyến giúp sinh viên, giảng viên và nhân viên trong trường đại học đăng tin khi bị mất đồ hoặc nhặt được đồ. Dự án giải quyết tình trạng đăng bài trôi nổi trên các hội nhóm mạng xã hội (Facebook, Zalo) bằng một hệ thống tập trung, chuẩn hóa quy trình tiếp nhận, xác minh quyền sở hữu và bàn giao đồ thất lạc.

### Điểm nổi bật về nghiệp vụ:
- **Cơ chế Private Description (Bảo mật):** Đặc điểm nhận dạng bí mật (số tiền, giấy tờ bên trong, vết trầy xước) được mã hóa/giấu kín trên API công khai, chỉ dùng để đối chiếu khi có người yêu cầu nhận lại đồ (`Claim`).
- **Quy trình Xác minh & Bàn giao khép kín:** Người làm rơi đồ gửi yêu cầu kèm bằng chứng sở hữu -> Nhân viên/Người nhặt xét duyệt -> Cán bộ tiếp nhận lập biên bản bàn giao (`Handover Record`) và cập nhật trạng thái đồ sang đã trao trả.

---

## 2. Công nghệ sử dụng
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios, React Router v7.
- **Backend:** ASP.NET Core 8.0 Web API (Kiến trúc phân tầng Controller - Service - Data/Entities).
- **ORM:** Entity Framework Core 8.0 (Code First / Database First).
- **Cơ sở dữ liệu:** Microsoft SQL Server (12 bảng quan hệ chặt chẽ, hỗ trợ Index tối ưu hóa truy vấn).
- **Authentication & Security:** JSON Web Token (JWT Bearer), mã hóa mật khẩu an toàn bằng BCrypt.
- **Tài liệu API:** Swagger UI / OpenAPI Spec tích hợp sẵn.

---

## 3. Cấu trúc thư mục dự án
```text
ĐACN_ChuNguyenGiaBao/
├── database/
│   └── UniFind_Database.sql      # Script tạo CSDL 12 bảng và Seed Data mẫu
├── docs/
│   ├── SRS_UniFind.md            # Tài liệu đặc tả yêu cầu phần mềm
│   ├── API_Documentation.md      # Danh sách chi tiết các RESTful API
│   └── UML_Diagrams.md           # Bộ sơ đồ UML (Use Case, Activity, Sequence, Class)
├── UniFind.API/                  # Backend ASP.NET Core 8 Web API
│   ├── Controllers/              # Auth, Items, Claims...
│   ├── Models/Entities/          # 12 Entity classes
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Data/                     # UniFindDbContext
│   ├── Services/                 # Business Logic Services
│   ├── Helpers/                  # JwtHelper, PasswordHasher
│   └── Program.cs                # Dependency Injection, Middleware, Swagger
└── unifind-frontend/             # Frontend ReactJS + TypeScript + Vite
    ├── src/
    │   ├── components/           # Navbar, ItemCard, Modals...
    │   ├── contexts/             # AuthContext (quản lý đăng nhập, Token)
    │   ├── pages/                # Home, Detail, Create, Login, Profile, Admin
    │   ├── services/             # Axios API client
    │   └── types/                # TypeScript Interfaces
    └── vite.config.ts
```

---

## 4. Hướng dẫn cài đặt và khởi chạy

### Bước 1: Khởi tạo Cơ sở dữ liệu SQL Server
1. Mở **SQL Server Management Studio (SSMS)** và kết nối tới SQL Server của bạn.
2. Mở file `database/UniFind_Database.sql`.
3. Nhấn **Execute (`F5`)** để tạo CSDL `UniFindDB` cùng toàn bộ 12 bảng và dữ liệu mẫu.

### Bước 2: Chạy Backend ASP.NET Core Web API
```powershell
cd UniFind.API
dotnet run --launch-profile http
```
- API sẽ chạy tại: **`http://localhost:5031`**
- Xem tài liệu tương tác Swagger UI tại: **`http://localhost:5031/swagger`**

### Bước 3: Chạy Frontend ReactJS
```powershell
cd unifind-frontend
npm install
npm run dev
```
- Mở trình duyệt truy cập: **`http://localhost:3000`**

---

## 5. Tài khoản dùng thử (Demo Accounts)

Mật khẩu chung cho tất cả tài khoản mẫu là: **`Password123@`**

| Vai trò (Role) | Họ và tên | Email đăng nhập | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | Quản Trị Viên Hệ Thống | `admin@unifind.edu.vn` | Toàn quyền kiểm duyệt, xem thống kê |
| **Staff** | Thầy Nguyễn Văn Nam (Thủ thư) | `nam.nv@unifind.edu.vn` | Tiếp nhận đồ lưu kho, duyệt Claim, lập biên bản bàn giao |
| **Staff** | Cô Lê Thị Bích (Phòng CTSV) | `bich.lt@unifind.edu.vn` | Quản lý đồ thất lạc cơ sở |
| **Student** | Chu Nguyễn Gia Bảo | `bao.cng@unifind.edu.vn` | Đăng tin, tìm kiếm, gửi yêu cầu nhận đồ |
| **Student** | Nguyễn Văn An | `an.nv@unifind.edu.vn` | Đăng tin mất ví tại Thư viện |
| **Student** | Trần Thị Mai | `mai.tt@unifind.edu.vn` | Đăng tin nhặt được ví |

*(Trên giao diện trang Login `/login` có sẵn 3 nút bấm điền nhanh tài khoản giúp buổi thuyết trình/bảo vệ diễn ra nhanh chóng).*

