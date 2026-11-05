using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using UniFind.API.Data;
using UniFind.API.Helpers;
using UniFind.API.Services.Implementations;
using UniFind.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình DbContext kết nối SQL Server
var connectionString = builder.Configuration.GetConnectionString("UniFindConnection");
builder.Services.AddDbContext<UniFindDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Đăng ký Dependency Injection cho Helpers & Services
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IClaimService, ClaimService>();

// 3. Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? "UniFind_Super_Secret_Key_For_JWT_Authentication_Capstone_2026_DotNet8";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "UniFind.API",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "UniFind.Client",
        ClockSkew = TimeSpan.Zero
    };
});

// 4. Cấu hình CORS cho Frontend React (hỗ trợ cả Vite port 5173 và React 3000)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 5. Cấu hình Controllers và JSON Formatter
builder.Services.AddControllers();

// 6. Cấu hình Swagger kèm nút 'Authorize' hỗ trợ Bearer Token
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "UniFind API - Hệ Thống Quản Lý Đồ Thất Lạc Đại Học",
        Version = "v1",
        Description = "Tài liệu API chính thức cho Đề tài Đồ án Chuyên ngành Công nghệ Phần mềm UniFind"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT Bearer token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Tạo thư mục wwwroot/uploads nếu chưa có
var uploadsDir = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
if (!Directory.Exists(uploadsDir))
{
    Directory.CreateDirectory(uploadsDir);
}

app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || true) // Luôn bật Swagger để dễ demo
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "UniFind API v1");
        c.RoutePrefix = "swagger";
    });

    // Tự động chuyển hướng từ trang chủ sang /swagger
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
