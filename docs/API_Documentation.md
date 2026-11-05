# TÀI LIỆU THIẾT KẾ RESTful API – UNIFIND

### Base URL: `http://localhost:5031`
### Swagger UI: `http://localhost:5031/swagger`

---

## 1. Phân hệ Xác thực (Authentication) - `/api/auth`

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản sinh viên/giảng viên mới |
| `POST` | `/api/auth/login` | Public | Đăng nhập nhận JWT Token (thời hạn 24h) |
| `GET` | `/api/auth/me` | Bearer Token | Lấy thông tin cá nhân của token đang đăng nhập |

---

## 2. Phân hệ Quản lý Đồ thất lạc (Items) - `/api/items`

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/items` | Public | Tìm kiếm, lọc nâng cao theo danh mục, địa điểm, từ khóa, khoảng thời gian (hỗ trợ phân trang) |
| `GET` | `/api/items/{id}` | Public / Auth | Xem chi tiết bài đăng (áp dụng bảo mật không lộ `PrivateDescription` cho người ngoài) |
| `POST` | `/api/items` | Bearer Token | Đăng bài báo mất hoặc nhặt được |
| `GET` | `/api/items/my-items` | Bearer Token | Lấy danh sách các bài do chính mình đăng |
| `PUT` | `/api/items/{id}/status` | Bearer Token | Cập nhật trạng thái bài đăng (duyệt, ẩn, hủy) |
| `GET` | `/api/items/categories` | Public | Lấy danh mục đồ vật (Ví, Giấy tờ, Laptop...) |
| `GET` | `/api/items/locations` | Public | Lấy danh sách địa điểm trong trường (Thư viện, Tòa A, Canteen...) |

---

## 3. Phân hệ Yêu cầu nhận lại & Bàn giao (Claims & Handover) - `/api/claims`

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/claims` | Bearer Token | Gửi yêu cầu nhận lại đồ kèm mô tả bằng chứng sở hữu |
| `GET` | `/api/claims/my-claims` | Bearer Token | Xem danh sách các yêu cầu nhận đồ của mình |
| `GET` | `/api/claims/item/{itemId}` | Owner/Staff | Xem danh sách người đang yêu cầu nhận một món đồ |
| `GET` | `/api/claims` | Staff, Admin | Toàn bộ danh sách Claims cần xử lý trong hệ thống |
| `PUT` | `/api/claims/{id}/review` | Staff/Owner | Phê duyệt (`Approved`) hoặc Từ chối (`Rejected`) claim |
| `POST` | `/api/claims/handover` | Staff, Admin | Lập biên bản trao trả đồ vật thực tế và hoàn tất chu trình |

