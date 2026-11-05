-- =========================================================================
-- ĐỒ ÁN CHUYÊN NGÀNH CÔNG NGHỆ PHẦN MỀM
-- ĐỀ TÀI: UNIFIND - HỆ THỐNG TÌM KIẾM VÀ QUẢN LÝ ĐỒ THẤT LẠC TRONG TRƯỜNG ĐẠI HỌC
-- DATABASE ENGINE: MICROSOFT SQL SERVER 2019+
-- TẬP TIN SCRIPT DDL VÀ DỮ LIỆU MẪU (SEED DATA)
-- =========================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'UniFindDB')
BEGIN
    CREATE DATABASE UniFindDB;
END
GO

USE UniFindDB;
GO

-- 1. BẢNG ROLES (Vai trò người dùng)
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
CREATE TABLE dbo.Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);
GO

-- 2. BẢNG USERS (Tài khoản người dùng: Sinh viên, Giảng viên, Nhân viên, Admin)
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID INT NOT NULL,
    Phone VARCHAR(15) NULL,
    StudentStaffId VARCHAR(50) NULL, -- MSSV hoặc Mã cán bộ/nhân viên
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID)
);
GO

-- 3. BẢNG CATEGORIES (Danh mục đồ vật)
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
CREATE TABLE dbo.Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Icon NVARCHAR(100) NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- 4. BẢNG LOCATIONS (Địa điểm trong khuôn viên trường)
IF OBJECT_ID('dbo.Locations', 'U') IS NOT NULL DROP TABLE dbo.Locations;
CREATE TABLE dbo.Locations (
    LocationID INT IDENTITY(1,1) PRIMARY KEY,
    Campus NVARCHAR(100) NOT NULL DEFAULT N'Cơ sở chính',
    Building NVARCHAR(100) NOT NULL, -- Tòa A, Tòa B, Thư viện, Ký túc xá...
    AreaName NVARCHAR(150) NOT NULL, -- Chi tiết: Tầng 2 Thư viện, Canteen, Phòng B401...
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- 5. BẢNG ITEMS (Thông tin đồ thất lạc / đồ nhặt được)
IF OBJECT_ID('dbo.Items', 'U') IS NOT NULL DROP TABLE dbo.Items;
CREATE TABLE dbo.Items (
    ItemID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CategoryID INT NOT NULL,
    LocationID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,              -- Mô tả công khai (màu sắc cơ bản, vị trí...)
    PrivateDescription NVARCHAR(MAX) NULL,          -- Đặc điểm nhận dạng riêng tư (bảo mật, dùng đối chiếu)
    ItemType VARCHAR(20) NOT NULL,                  -- 'Lost' (Mất đồ) hoặc 'Found' (Nhặt được)
    LostFoundDate DATETIME2 NOT NULL,               -- Thời gian mất hoặc nhặt được
    Status VARCHAR(30) NOT NULL DEFAULT 'PendingApproval', 
    -- Các trạng thái: PendingApproval, Approved_Searching, VerifyingClaim, Returned_HandedOver, Rejected, Hidden, Cancelled
    CustodyType VARCHAR(30) NOT NULL DEFAULT 'SelfRetained', 
    -- 'SelfRetained' (Người nhặt tự giữ) hoặc 'HandedToOffice' (Đã bàn giao cho Phòng quản lý/Bảo vệ)
    CurrentStorageLocation NVARCHAR(255) NULL,      -- Vị trí lưu kho nếu nộp cho phòng quản lý
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Items_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Items_Categories FOREIGN KEY (CategoryID) REFERENCES dbo.Categories(CategoryID),
    CONSTRAINT FK_Items_Locations FOREIGN KEY (LocationID) REFERENCES dbo.Locations(LocationID)
);
GO

-- 6. BẢNG ITEMIMAGES (Hình ảnh đồ vật)
IF OBJECT_ID('dbo.ItemImages', 'U') IS NOT NULL DROP TABLE dbo.ItemImages;
CREATE TABLE dbo.ItemImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    IsThumbnail BIT NOT NULL DEFAULT 0,
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ItemImages_Items FOREIGN KEY (ItemID) REFERENCES dbo.Items(ItemID) ON DELETE CASCADE
);
GO

-- 7. BẢNG CLAIMS (Yêu cầu nhận lại đồ)
IF OBJECT_ID('dbo.Claims', 'U') IS NOT NULL DROP TABLE dbo.Claims;
CREATE TABLE dbo.Claims (
    ClaimID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    UserID INT NOT NULL,                            -- Người gửi yêu cầu nhận đồ
    ProofDescription NVARCHAR(MAX) NOT NULL,        -- Mô tả chứng minh sở hữu (ảnh đối chiếu, chi tiết bí mật)
    ContactPhone VARCHAR(15) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'Pending',   -- 'Pending', 'Approved', 'Rejected', 'Cancelled'
    ReviewedBy INT NULL,                            -- Nhân viên hoặc người đăng tin duyệt
    ReviewedAt DATETIME2 NULL,
    ReviewNote NVARCHAR(500) NULL,                  -- Lý do duyệt hoặc từ chối
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Claims_Items FOREIGN KEY (ItemID) REFERENCES dbo.Items(ItemID),
    CONSTRAINT FK_Claims_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Claims_ReviewedBy FOREIGN KEY (ReviewedBy) REFERENCES dbo.Users(UserID)
);
GO

-- 8. BẢNG HANDOVERRECORDS (Biên bản bàn giao tài sản)
IF OBJECT_ID('dbo.HandoverRecords', 'U') IS NOT NULL DROP TABLE dbo.HandoverRecords;
CREATE TABLE dbo.HandoverRecords (
    HandoverID INT IDENTITY(1,1) PRIMARY KEY,
    ClaimID INT NOT NULL UNIQUE,
    StaffID INT NOT NULL,                           -- Cán bộ / Nhân viên xác nhận bàn giao
    ReceiverID INT NOT NULL,                        -- Người nhận tài sản
    HandoverDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    HandoverLocation NVARCHAR(200) NOT NULL,
    VerificationPhotoUrl NVARCHAR(500) NULL,        -- Ảnh lưu trữ biên bản hoặc lúc trao trả
    Note NVARCHAR(500) NULL,
    Confirmed BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_HandoverRecords_Claims FOREIGN KEY (ClaimID) REFERENCES dbo.Claims(ClaimID),
    CONSTRAINT FK_HandoverRecords_Staff FOREIGN KEY (StaffID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_HandoverRecords_Receiver FOREIGN KEY (ReceiverID) REFERENCES dbo.Users(UserID)
);
GO

-- 9. BẢNG NOTIFICATIONS (Thông báo hệ thống và realtime)
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL DROP TABLE dbo.Notifications;
CREATE TABLE dbo.Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    LinkUrl NVARCHAR(500) NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    Type VARCHAR(50) NOT NULL DEFAULT 'System',     -- 'ItemApproved', 'NewClaim', 'ClaimApproved', 'HandoverComplete', 'MatchSuggestion'
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
GO

-- 10. BẢNG REPORTS (Báo cáo vi phạm / khiếu nại)
IF OBJECT_ID('dbo.Reports', 'U') IS NOT NULL DROP TABLE dbo.Reports;
CREATE TABLE dbo.Reports (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
    ReporterID INT NOT NULL,
    ItemID INT NULL,
    ClaimID INT NULL,
    Reason NVARCHAR(1000) NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'Pending',   -- 'Pending', 'Resolved', 'Dismissed'
    HandledBy INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Reports_Reporter FOREIGN KEY (ReporterID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Reports_Items FOREIGN KEY (ItemID) REFERENCES dbo.Items(ItemID),
    CONSTRAINT FK_Reports_Claims FOREIGN KEY (ClaimID) REFERENCES dbo.Claims(ClaimID),
    CONSTRAINT FK_Reports_HandledBy FOREIGN KEY (HandledBy) REFERENCES dbo.Users(UserID)
);
GO

-- 11. BẢNG ITEMSTATUSHISTORY (Lịch sử chuyển đổi trạng thái đồ vật)
IF OBJECT_ID('dbo.ItemStatusHistory', 'U') IS NOT NULL DROP TABLE dbo.ItemStatusHistory;
CREATE TABLE dbo.ItemStatusHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    ChangedBy INT NOT NULL,
    OldStatus VARCHAR(30) NULL,
    NewStatus VARCHAR(30) NOT NULL,
    Reason NVARCHAR(500) NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_StatusHistory_Items FOREIGN KEY (ItemID) REFERENCES dbo.Items(ItemID),
    CONSTRAINT FK_StatusHistory_Users FOREIGN KEY (ChangedBy) REFERENCES dbo.Users(UserID)
);
GO

-- 12. BẢNG AUDITLOGS (Nhật ký kiểm toán hệ thống)
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
CREATE TABLE dbo.AuditLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL,
    Action VARCHAR(100) NOT NULL,
    TableName VARCHAR(50) NOT NULL,
    RecordID INT NULL,
    IpAddress VARCHAR(50) NULL,
    OldData NVARCHAR(MAX) NULL,
    NewData NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- =========================================================================
-- CÁC CHỈ MỤC INDEX ĐỂ TỐI ƯU HIỆU NĂNG TÌM KIẾM
-- =========================================================================
CREATE INDEX IX_Items_Status_Type ON dbo.Items (Status, ItemType);
CREATE INDEX IX_Items_CategoryID ON dbo.Items (CategoryID);
CREATE INDEX IX_Items_LocationID ON dbo.Items (LocationID);
CREATE INDEX IX_Items_LostFoundDate ON dbo.Items (LostFoundDate DESC);
CREATE INDEX IX_Claims_ItemID_Status ON dbo.Claims (ItemID, Status);
CREATE INDEX IX_Notifications_User_Read ON dbo.Notifications (UserID, IsRead);
GO

-- =========================================================================
-- DỮ LIỆU MẪU (SEED DATA CHO DEMO VÀ KIỂM THỬ)
-- =========================================================================

-- 1. Insert Roles
INSERT INTO dbo.Roles (RoleName, Description) VALUES
(N'Admin', N'Quản trị viên toàn quyền hệ thống'),
(N'Staff', N'Nhân viên tiếp nhận, quản lý kho và bàn giao đồ thất lạc'),
(N'Lecturer', N'Giảng viên / Cán bộ trường'),
(N'Student', N'Sinh viên trường đại học');
GO

-- 2. Insert Users (Password hash giả lập 'Password123@' đã mã hóa BCrypt)
INSERT INTO dbo.Users (FullName, Email, PasswordHash, RoleID, Phone, StudentStaffId) VALUES
(N'Quản Trị Viên Hệ Thống', 'admin@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 1, '0901000001', 'AD001'),
(N'Thầy Nguyễn Văn Nam (QL Thư viện)', 'nam.nv@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 2, '0902000002', 'ST001'),
(N'Cô Lê Thị Bích (Phòng CTSV)', 'bich.lt@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 2, '0902000003', 'ST002'),
(N'TS. Trần Hoàng Quân', 'quan.th@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 3, '0903000001', 'GV001'),
(N'Chu Nguyễn Gia Bảo', 'bao.cng@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 4, '0904000001', 'SV202401'),
(N'Nguyễn Văn An', 'an.nv@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 4, '0904000002', 'SV202402'),
(N'Trần Thị Mai', 'mai.tt@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 4, '0904000003', 'SV202403'),
(N'Lê Hoàng Phúc', 'phuc.lh@unifind.edu.vn', '$2a$11$q6kE71pU2/rL3QpY5T0hOeaq3YV6c8gI4Z7gA0p9C1kP8aZ5y4H4q', 4, '0904000004', 'SV202404');
GO

-- 3. Insert Categories
INSERT INTO dbo.Categories (CategoryName, Icon, Description) VALUES
(N'Ví tiền & Bóp cầm tay', 'wallet', N'Ví tiền, bóp tiền các loại'),
(N'Giấy tờ & Thẻ sinh viên', 'id-card', N'CMND/CCCD, thẻ sinh viên, bằng lái xe, thẻ ngân hàng'),
(N'Thiết bị điện tử', 'laptop', N'Laptop, máy tính bảng, điện thoại di động'),
(N'Tai nghe & Phụ kiện công nghệ', 'headphones', N'Tai nghe Bluetooth, sạc dự phòng, chuột, USB'),
(N'Balo, Túi xách & Cặp', 'backpack', N'Balo học sinh, túi chéo, cặp tài liệu'),
(N'Chìa khóa & Thẻ xe', 'key', N'Chìa khóa xe, chìa khóa phòng trọ, móc khóa'),
(N'Áo khoác & Trang phục', 'shirt', N'Áo khoác đồng phục, mũ bảo hiểm, găng tay'),
(N'Sách giáo trình & Dụng cụ học tập', 'book', N'Sách, vở ghi chép, máy tính cầm tay Casio');
GO

-- 4. Insert Locations
INSERT INTO dbo.Locations (Campus, Building, AreaName, Description) VALUES
(N'Cơ sở chính', N'Tòa Nhà Thư Viện', N'Thư viện tầng 2 - Khu bàn tự học', N'Khu tự học yên tĩnh dãy A'),
(N'Cơ sở chính', N'Tòa Nhà Thư Viện', N'Thư viện tầng 1 - Quầy mượn trả sách', N'Gần quầy thủ thư'),
(N'Cơ sở chính', N'Tòa A', N'Hội trường A lớn', N'Hội trường chính tầng 1'),
(N'Cơ sở chính', N'Tòa B', N'Phòng máy tính B302', N'Phòng thực hành CNTT'),
(N'Cơ sở chính', N'Tòa C', N'Phòng học lý thuyết C201', N'Dãy phòng học tầng 2'),
(N'Cơ sở chính', N'Khu Dịch Vụ', N'Canteen trường - Khu bàn ăn trung tâm', N'Khu vực ăn trưa sinh viên'),
(N'Cơ sở chính', N'Khu Thể Thao', N'Sân bóng rổ ngoài trời', N'Bên cạnh khán đài'),
(N'Cơ sở chính', N'Khu Thể Thao', N'Nhà thi đấu đa năng', N'Sàn thi đấu cầu lông'),
(N'Cơ sở chính', N'Bãi Xe', N'Bãi giữ xe sinh viên Cổng 1', N'Dãy để xe số 4'),
(N'Cơ sở chính', N'Tòa Hành Chính', N'Văn phòng một cửa - Phòng CTSV', N'Phòng 102 Tòa Nhà Điều Hành');
GO

-- 5. Insert Sample Items
-- Bài 1: Sinh viên An mất ví
INSERT INTO dbo.Items (UserID, CategoryID, LocationID, Title, Description, PrivateDescription, ItemType, LostFoundDate, Status, CustodyType)
VALUES (
    6, 1, 1, 
    N'Làm rơi ví da nam màu nâu tại bàn tự học Thư viện tầng 2',
    N'Tôi có ngồi học tại thư viện tầng 2 chiều ngày hôm qua, lúc ra về có để quên chiếc ví da màu nâu sẫm, bên ngoài có logo kim loại nhỏ.',
    N'Bên trong có CCCD tên Nguyễn Văn An, 1 thẻ ATM Vietcombank đuôi 4821 và khoảng 250.000 VNĐ tiền mặt.',
    'Lost', '2026-11-02 15:30:00', 'Approved_Searching', 'SelfRetained'
);

-- Bài 2: Sinh viên Mai nhặt được ví tương tự
INSERT INTO dbo.Items (UserID, CategoryID, LocationID, Title, Description, PrivateDescription, ItemType, LostFoundDate, Status, CustodyType, CurrentStorageLocation)
VALUES (
    7, 1, 1, 
    N'Nhặt được ví da nam màu nâu tại khu tự học Thư viện',
    N'Chiều qua mình nhặt được một chiếc ví da nam màu nâu rơi dưới gầm ghế dãy bàn tự học Thư viện tầng 2. Mình đã mang bàn giao cho bàn Quầy thủ thư tầng 1.',
    N'Bên trong có thẻ sinh viên tên An và một số giấy tờ tùy thân khác.',
    'Found', '2026-11-02 17:00:00', 'VerifyingClaim', 'HandedToOffice', N'Tủ đồ thất lạc Thư viện Tầng 1 - Ngăn A03'
);

-- Bài 3: Giảng viên Quân để quên máy tính cầm tay
INSERT INTO dbo.Items (UserID, CategoryID, LocationID, Title, Description, PrivateDescription, ItemType, LostFoundDate, Status, CustodyType)
VALUES (
    4, 8, 4,
    N'Quên máy tính Casio fx-580VN X tại bàn giáo viên phòng máy B302',
    N'Sau giờ dạy tiết 7-9 ngày thứ Hai, tôi có để quên một máy tính Casio màu đen trên bàn giáo viên phòng B302.',
    N'Mặt sau máy có dán sticker hình logo trường và viết tắt chữ GV.THQ.',
    'Lost', '2026-11-01 16:45:00', 'Approved_Searching', 'SelfRetained'
);

-- Bài 4: Sinh viên Phúc nhặt được tai nghe Bluetooth
INSERT INTO dbo.Items (UserID, CategoryID, LocationID, Title, Description, PrivateDescription, ItemType, LostFoundDate, Status, CustodyType)
VALUES (
    8, 4, 6,
    N'Nhặt được hộp tai nghe Bluetooth màu trắng ở Canteen',
    N'Trưa nay tại bàn canteen số 12 mình có nhặt được 1 hộp tai nghe không dây màu trắng, vỏ có ốp silicon.',
    N'Ốp silicon màu xanh mint có móc khóa hình chú vịt vàng, tai bên trái bị trầy nhẹ ở đuôi.',
    'Found', '2026-11-03 11:45:00', 'Approved_Searching', 'SelfRetained'
);
GO

-- 6. Insert Sample Images
INSERT INTO dbo.ItemImages (ItemID, ImageUrl, IsThumbnail) VALUES
(1, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 1),
(2, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 1),
(3, 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600', 1),
(4, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 1);
GO

-- 7. Insert Sample Claim (An nhận ví của Mai bàn giao)
INSERT INTO dbo.Claims (ItemID, UserID, ProofDescription, ContactPhone, Status, ReviewedBy, ReviewedAt, ReviewNote)
VALUES (
    2, 6,
    N'Tôi là chủ nhân của chiếc ví. Trong ví có CCCD mang tên Nguyễn Văn An, ngày sinh 15/08/2003, và thẻ sinh viên trường. Tôi có thể đọc đúng số đuôi thẻ ngân hàng bên trong.',
    '0904000002', 'Approved', 2, '2026-11-03 08:00:00', N'Đã đối chiếu thông tin CCCD trùng khớp với bạn An'
);
GO

-- 8. Insert Sample Handover Record (Thủ thư bàn giao cho bạn An)
INSERT INTO dbo.HandoverRecords (ClaimID, StaffID, ReceiverID, HandoverDate, HandoverLocation, Note, Confirmed)
VALUES (
    1, 2, 6, 
    '2026-11-03 08:30:00',
    N'Quầy quản lý bạn đọc Thư viện Tầng 1',
    N'Sinh viên Nguyễn Văn An đã ký xác nhận nhận lại đầy đủ tài sản gồm ví, giấy tờ tùy thân và tiền mặt.',
    1
);
GO

-- 9. Insert Sample Notifications
INSERT INTO dbo.Notifications (UserID, Title, Message, LinkUrl, Type) VALUES
(6, N'Yêu cầu nhận đồ đã được chấp thuận', N'Yêu cầu nhận lại ví của bạn tại Thư viện đã được nhân viên chấp thuận. Vui lòng đến Quầy thủ thư Tầng 1 để nhận lại đồ.', '/claims/1', 'ClaimApproved'),
(7, N'Đồ bạn nhặt được đã bàn giao thành công', N'Chiếc ví bạn nhặt được tại Thư viện đã được trao trả tận tay cho chủ nhân. Cảm ơn nghĩa cử đẹp của bạn!', '/items/2', 'HandoverComplete');
GO

