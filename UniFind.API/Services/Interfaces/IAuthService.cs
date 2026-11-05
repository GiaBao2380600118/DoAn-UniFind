using UniFind.API.DTOs.Auth;

namespace UniFind.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request);
        Task<bool> IsEmailTakenAsync(string email);
    }
}

