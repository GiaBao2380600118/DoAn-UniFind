using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniFind.API.DTOs.Claims;
using UniFind.API.Services.Interfaces;

namespace UniFind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClaimsController : ControllerBase
    {
        private readonly IClaimService _claimService;

        public ClaimsController(IClaimService claimService)
        {
            _claimService = claimService;
        }

        private (int userId, string role) GetCurrentUserContext()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = int.TryParse(userIdStr, out var id) ? id : 0;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Student";
            return (userId, role);
        }

        /// <summary>
        /// Gửi yêu cầu nhận lại đồ vật kèm mô tả bằng chứng
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateClaim([FromBody] CreateClaimDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (userId, _) = GetCurrentUserContext();
            var claim = await _claimService.CreateClaimAsync(dto, userId);
            if (claim == null)
            {
                return BadRequest(new { message = "Không thể gửi yêu cầu nhận đồ (đồ vật không tồn tại hoặc đã được bàn giao)." });
            }

            return Ok(claim);
        }

        /// <summary>
        /// Xem danh sách yêu cầu nhận đồ của chính mình
        /// </summary>
        [HttpGet("my-claims")]
        public async Task<IActionResult> GetMyClaims()
        {
            var (userId, _) = GetCurrentUserContext();
            var claims = await _claimService.GetMyClaimsAsync(userId);
            return Ok(claims);
        }

        /// <summary>
        /// Xem danh sách các yêu cầu nhận đồ của một món đồ (Chỉ người đăng bài hoặc Staff/Admin)
        /// </summary>
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetClaimsByItem(int itemId)
        {
            var (userId, role) = GetCurrentUserContext();
            var claims = await _claimService.GetClaimsByItemAsync(itemId, userId, role);
            return Ok(claims);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Claims trong hệ thống (Dành cho Staff và Admin)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllClaims([FromQuery] string? status)
        {
            var claims = await _claimService.GetAllClaimsAsync(status);
            return Ok(claims);
        }

        /// <summary>
        /// Xét duyệt yêu cầu nhận đồ (Chấp nhận hoặc Từ chối)
        /// </summary>
        [HttpPut("{id}/review")]
        public async Task<IActionResult> ReviewClaim(int id, [FromBody] ReviewClaimDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (userId, _) = GetCurrentUserContext();
            var success = await _claimService.ReviewClaimAsync(id, dto, userId);
            if (!success)
            {
                return NotFound(new { message = "Không tìm thấy yêu cầu nhận đồ." });
            }

            return Ok(new { message = "Cập nhật kết quả xét duyệt thành công." });
        }

        /// <summary>
        /// Tạo biên bản bàn giao tài sản thực tế (Dành cho Cán bộ / Nhân viên)
        /// </summary>
        [HttpPost("handover")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> CreateHandover([FromBody] CreateHandoverDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (userId, _) = GetCurrentUserContext();
            var success = await _claimService.CreateHandoverAsync(dto, userId);
            if (!success)
            {
                return BadRequest(new { message = "Không thể tạo biên bản bàn giao. Đảm bảo yêu cầu nhận đồ đã được chấp thuận trước đó." });
            }

            return Ok(new { message = "Tạo biên bản bàn giao thành công và hoàn tất trao trả đồ vật." });
        }
    }
}

