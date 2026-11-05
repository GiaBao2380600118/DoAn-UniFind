using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UniFind.API.Models.Entities;
using SecurityClaim = System.Security.Claims.Claim;
using SecurityClaimTypes = System.Security.Claims.ClaimTypes;

namespace UniFind.API.Helpers
{
    public class JwtHelper
    {
        private readonly IConfiguration _configuration;

        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user, string roleName)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var keyString = jwtSettings["Key"] ?? "UniFind_Super_Secret_Key_For_JWT_Authentication_Capstone_2026_DotNet8";
            var issuer = jwtSettings["Issuer"] ?? "UniFind.API";
            var audience = jwtSettings["Audience"] ?? "UniFind.Client";
            var expiryMinutes = int.TryParse(jwtSettings["ExpiryMinutes"], out var minutes) ? minutes : 1440; // 24 hours

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<SecurityClaim>
            {
                new SecurityClaim(SecurityClaimTypes.NameIdentifier, user.UserID.ToString()),
                new SecurityClaim(SecurityClaimTypes.Name, user.FullName),
                new SecurityClaim(SecurityClaimTypes.Email, user.Email),
                new SecurityClaim(SecurityClaimTypes.Role, roleName),
                new SecurityClaim("StudentStaffId", user.StudentStaffId ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public static bool VerifyPassword(string password, string passwordHash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch
            {
                return false;
            }
        }
    }
}
