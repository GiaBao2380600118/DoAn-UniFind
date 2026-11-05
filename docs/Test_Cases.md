# BỘ KỊCH BẢN KIỂM THỬ PHẦN MỀM (TEST CASES) - UNIFIND

---

| Mã TC | Phân hệ | Chức năng kiểm thử | Dữ liệu đầu vào (Input) | Kết quả kỳ vọng (Expected Output) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Auth | Đăng ký tài khoản mới | Họ tên, email hợp lệ, mật khẩu >= 6 ký tự | Đăng ký thành công, tạo User trong CSDL, trả về JWT Token | **PASS** |
| **TC02** | Auth | Đăng ký với Email đã tồn tại | Email đã có trong CSDL (`admin@unifind.edu.vn`) | Báo lỗi: *"Email này đã được sử dụng trong hệ thống."* (HTTP 400) | **PASS** |
| **TC03** | Auth | Đăng nhập sai mật khẩu | Email đúng, mật khẩu sai | Từ chối đăng nhập (HTTP 401 Unauthorized) | **PASS** |
| **TC04** | Auth | Đăng nhập đúng thông tin | Email: `bao.cng@unifind.edu.vn`, Pass: `Password123@` | Đăng nhập thành công, nhận Bearer Token, hiển thị tên trên thanh Menu | **PASS** |
| **TC05** | Items | Đăng tin thiếu thông tin bắt buộc | Để trống Tiêu đề hoặc Mô tả | Báo lỗi dữ liệu không hợp lệ, không cho gửi | **PASS** |
| **TC06** | Items | Đăng tin hợp lệ (Lost) | Loại: Lost, Danh mục: Ví, Địa điểm: Canteen, có PrivateDescription | Tạo bài đăng thành công, chuyển hướng đến trang chi tiết bài viết | **PASS** |
| **TC07** | Items | Bảo mật trường PrivateDescription | Khách/Người dùng khác xem bài đăng qua API | Trường `privateDescription` trả về `null` hoặc không hiển thị trên UI | **PASS** |
| **TC08** | Items | Xem PrivateDescription bởi chính chủ/Staff | Chủ bài đăng hoặc tài khoản Staff/Admin đăng nhập xem | Hiển thị đầy đủ ô cảnh báo vàng chứa đặc điểm nhận dạng bí mật | **PASS** |
| **TC09** | Items | Tìm kiếm đồ vật theo từ khóa & bộ lọc | Từ khóa: *"ví da"*, Danh mục: *"Ví tiền"* | Danh sách lọc chính xác các bài có tiêu đề/mô tả tương ứng | **PASS** |
| **TC10** | Claims | Gửi yêu cầu nhận đồ (Claim) | Chọn bài nhặt ví, nhập bằng chứng mô tả bí mật | Gửi thành công, trạng thái đồ chuyển sang `VerifyingClaim`, tạo Claim `Pending` | **PASS** |
| **TC11** | Claims | Xét duyệt Claim bởi Nhân viên | Nhân viên đăng nhập, bấm Chấp thuận (Approved) | Claim đổi sang `Approved`, sinh viên nhận được thông báo hướng dẫn | **PASS** |
| **TC12** | Handover | Lập biên bản bàn giao tài sản | Nhân viên nhập địa điểm: *"Thư viện T1"*, bấm Xác nhận | Đồ vật đổi trạng thái `Returned_HandedOver`, tạo bản ghi trong `HandoverRecords` | **PASS** |
| **TC13** | Claims | Ngăn gửi Claim cho đồ đã trao trả | Gửi Claim cho món đồ đã có trạng thái `Returned_HandedOver` | Hệ thống từ chối yêu cầu mới để ngăn trục lợi (HTTP 400) | **PASS** |

