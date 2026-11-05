# BỘ SƠ ĐỒ THIẾT KẾ UML HỆ THỐNG UNIFIND
> Phục vụ cho Báo cáo Đồ án Chuyên ngành Công nghệ Phần mềm

---

## 1. Sơ đồ Use Case tổng quát (Use Case Diagram)

```mermaid
flowchart LR
    subgraph Actors
        Guest["Khách (Chưa đăng nhập)"]
        Student["Sinh viên / Giảng viên"]
        Staff["Nhân viên / Cán bộ quản lý"]
        Admin["Quản trị viên (Admin)"]
    end

    subgraph UniFind_System["Hệ thống UniFind"]
        UC01["Xem danh sách & Tìm kiếm đồ vật"]
        UC02["Đăng ký / Đăng nhập"]
        UC03["Đăng tin mất đồ (Lost)"]
        UC04["Đăng tin nhặt được (Found)"]
        UC05["Gửi yêu cầu nhận lại đồ (Claim)"]
        UC06["Theo dõi trạng thái đồ cá nhân"]
        UC07["Xét duyệt yêu cầu nhận đồ (Review Claim)"]
        UC08["Lập biên bản bàn giao (Handover Record)"]
        UC09["Quản lý địa điểm & danh mục"]
        UC10["Quản lý tài khoản & Thống kê"]
    end

    Guest --> UC01
    Guest --> UC02

    Student --> UC01
    Student --> UC03
    Student --> UC04
    Student --> UC05
    Student --> UC06

    Staff --> UC07
    Staff --> UC08
    Staff --> UC01

    Admin --> UC09
    Admin --> UC10
    Admin --> UC07
```

---

## 2. Sơ đồ Hoạt động: Quy trình Bàn giao Tài sản (Activity Diagram)

```mermaid
flowchart TD
    Start([Bắt đầu: Nhặt được đồ]) --> Step1[Sinh viên đăng tin nhặt được]
    Step1 --> Decision1{Tự giữ hay gửi trường?}
    
    Decision1 -- Tự giữ --> Step2A[Lưu giữ tại chỗ và chờ liên hệ]
    Decision1 -- Gửi văn phòng --> Step2B[Bàn giao cho Thủ thư / Bảo vệ]
    Step2B --> Step2C[Nhân viên gán vị trí kho lưu trữ]

    Step2A --> Step3[Sinh viên mất đồ tìm thấy và gửi Claim kèm bằng chứng]
    Step2C --> Step3

    Step3 --> Step4[Người phụ trách đối chiếu với Private Description]
    Step4 --> Decision2{Bằng chứng trùng khớp?}

    Decision2 -- Không khớp --> Step5A[Từ chối yêu cầu và gửi lý do]
    Step5A --> EndReject([Kết thúc: Từ chối])

    Decision2 -- Trùng khớp --> Step5B[Chấp thuận yêu cầu Approved]
    Step5B --> Step6[Người nhận đến văn phòng xuất trình giấy tờ]
    Step6 --> Step7[Nhân viên lập Handover Record và ký xác nhận]
    Step7 --> Step8[Hệ thống đổi trạng thái đồ sang Returned]
    Step8 --> EndSuccess([Kết thúc: Trao trả thành công])
```

---

## 3. Sơ đồ Lớp thực thể (Class Diagram)

```mermaid
classDiagram
    class User {
        +int UserID
        +string FullName
        +string Email
        +string PasswordHash
        +int RoleID
        +string Phone
        +string StudentStaffId
        +bool IsActive
    }

    class Role {
        +int RoleID
        +string RoleName
        +string Description
    }

    class Item {
        +int ItemID
        +int UserID
        +int CategoryID
        +int LocationID
        +string Title
        +string Description
        +string PrivateDescription
        +string ItemType
        +DateTime LostFoundDate
        +string Status
        +string CustodyType
    }

    class Category {
        +int CategoryID
        +string CategoryName
        +string Icon
    }

    class Location {
        +int LocationID
        +string Building
        +string AreaName
    }

    class Claim {
        +int ClaimID
        +int ItemID
        +int UserID
        +string ProofDescription
        +string Status
        +int ReviewedBy
    }

    class HandoverRecord {
        +int HandoverID
        +int ClaimID
        +int StaffID
        +int ReceiverID
        +DateTime HandoverDate
        +string HandoverLocation
        +bool Confirmed
    }

    Role "1" <-- "*" User : has
    User "1" <-- "*" Item : posts
    Category "1" <-- "*" Item : classifies
    Location "1" <-- "*" Item : locates
    Item "1" <-- "*" Claim : receives
    User "1" <-- "*" Claim : submits
    Claim "1" <-- "1" HandoverRecord : results_in
    User "1" <-- "*" HandoverRecord : confirmed_by
```

