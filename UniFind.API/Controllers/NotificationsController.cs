using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniFind.API.Data;

namespace UniFind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly UniFindDbContext _context;

        public NotificationsController(UniFindDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out var id) ? id : 0;
        }

        /// <summary>
        /// Lấy danh sách thông báo của người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetCurrentUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserID == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(30)
                .Select(n => new
                {
                    n.NotificationID,
                    n.Title,
                    n.Message,
                    n.LinkUrl,
                    n.IsRead,
                    n.Type,
                    n.CreatedAt
                })
                .ToListAsync();

            var unreadCount = await _context.Notifications
                .CountAsync(n => n.UserID == userId && !n.IsRead);

            return Ok(new { notifications, unreadCount });
        }

        /// <summary>
        /// Đánh dấu thông báo là đã đọc
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == userId);

            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã đánh dấu thông báo là đã đọc." });
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo là đã đọc
        /// </summary>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            var unread = await _context.Notifications
                .Where(n => n.UserID == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã đánh dấu tất cả là đã đọc." });
        }
    }
}

