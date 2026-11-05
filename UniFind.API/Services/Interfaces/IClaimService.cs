using UniFind.API.DTOs.Claims;

namespace UniFind.API.Services.Interfaces
{
    public interface IClaimService
    {
        Task<ClaimDto?> CreateClaimAsync(CreateClaimDto dto, int userId);
        Task<List<ClaimDto>> GetClaimsByItemAsync(int itemId, int currentUserId, string currentUserRole);
        Task<List<ClaimDto>> GetMyClaimsAsync(int userId);
        Task<List<ClaimDto>> GetAllClaimsAsync(string? status);
        Task<bool> ReviewClaimAsync(int claimId, ReviewClaimDto dto, int reviewerUserId);
        Task<bool> CreateHandoverAsync(CreateHandoverDto dto, int staffUserId);
    }
}

