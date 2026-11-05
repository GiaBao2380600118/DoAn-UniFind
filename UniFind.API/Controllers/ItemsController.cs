using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniFind.API.DTOs.Items;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly IItemService _itemService;

        public ItemsController(IItemService itemService)
        {
            _itemService = itemService;
        }

        private (int? userId, string? role) GetCurrentUserContext()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdStr, out var id) ? id : null;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return (userId, role);
        }

        /// <summary>
        /// Lấy danh sách đồ vật theo bộ lọc và phân trang
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetItems([FromQuery] ItemFilterDto filter)
        {
            var result = await _itemService.GetItemsAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Xem chi tiết một bài đăng đồ vật (áp dụng bảo mật với PrivateDescription)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetItemById(int id)
        {
            var (userId, role) = GetCurrentUserContext();
            var item = await _itemService.GetItemByIdAsync(id, userId, role);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy đồ vật." });
            }
            return Ok(item);
        }

        /// <summary>
        /// Đăng tin mới (Mất đồ hoặc Nhặt được)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateItem([FromBody] CreateItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (userId, _) = GetCurrentUserContext();
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var result = await _itemService.CreateItemAsync(dto, userId.Value);
            return CreatedAtAction(nameof(GetItemById), new { id = result.ItemID }, result);
        }

        /// <summary>
        /// Lấy danh sách bài đăng của chính người dùng hiện tại
        /// </summary>
        [HttpGet("my-items")]
        [Authorize]
        public async Task<IActionResult> GetMyItems()
        {
            var (userId, _) = GetCurrentUserContext();
            if (!userId.HasValue) return Unauthorized();

            var items = await _itemService.GetMyItemsAsync(userId.Value);
            return Ok(items);
        }

        /// <summary>
        /// Cập nhật trạng thái bài đăng (duyệt, ẩn, hoàn tất...)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var (userId, _) = GetCurrentUserContext();
            if (!userId.HasValue) return Unauthorized();

            var success = await _itemService.UpdateItemStatusAsync(id, dto.Status, userId.Value, dto.Reason);
            if (!success)
            {
                return BadRequest(new { message = "Không thể cập nhật trạng thái đồ vật." });
            }

            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }

        /// <summary>
        /// Lấy toàn bộ danh mục đồ vật
        /// </summary>
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _itemService.GetCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách địa điểm trong trường
        /// </summary>
        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _itemService.GetLocationsAsync();
            return Ok(locations);
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }
}

