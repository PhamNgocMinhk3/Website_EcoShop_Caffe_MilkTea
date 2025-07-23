using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.DTOs;
using Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthController(AppDbContext context, IConfiguration config, IEmailService emailService)
    {
        _context = context;
        _config = config;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email đã tồn tại.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = 1 // Mặc định là Khách Hàng
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đăng ký thành công!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto request)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Email hoặc mật khẩu không chính xác.");

        var accessToken = CreateAccessToken(user);
        var refreshToken = CreateRefreshToken();
        await SaveRefreshToken(user, refreshToken);

        // SỬA ĐỔI Ở ĐÂY: Trả về thêm cả user.Id
        return Ok(new TokenDto(user.Id, accessToken, refreshToken));
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenDto tokenDto)
    {
        var principal = GetPrincipalFromExpiredToken(tokenDto.AccessToken);
        var userEmail = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var user = await _context.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Email == userEmail);

        if (user == null || user.RefreshToken != tokenDto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return BadRequest("Invalid client request");

        var newAccessToken = CreateAccessToken(user);
        var newRefreshToken = CreateRefreshToken();
        await SaveRefreshToken(user, newRefreshToken);

        // Trả về thêm cả user.Id khi refresh token
        return Ok(new TokenDto(user.Id, newAccessToken, newRefreshToken));
    }
    
    [Authorize]
    [HttpPost("validate-token")]
    public IActionResult ValidateToken()
    {
        return Ok(new { isValid = true, message = "Token hợp lệ." });
    }
    
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user != null)
        {
            var newPassword = Path.GetRandomFileName().Replace(".", "").Substring(0, 8);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            string emailBody = $"<div style='font-family: Arial, sans-serif; line-height: 1.6;'><h2>Khôi phục mật khẩu cho tài khoản Trà Sữa</h2><p>Chào bạn,</p><p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu của bạn.</p><p>Mật khẩu mới của bạn là: <strong style='font-size: 18px; color: #E74C3C;'>{newPassword}</strong></p><p>Vui lòng sử dụng mật khẩu này để đăng nhập và đổi lại mật khẩu ngay để đảm bảo an toàn.</p><p>Trân trọng,<br>Đội ngũ Trà Sữa</p></div>";
            await _emailService.SendEmailAsync(user.Email, "Mật khẩu mới cho tài khoản Trà Sữa", emailBody);
        }
        return Ok(new { message = "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một mật khẩu mới." });
    }

    // --- Private Helper Methods ---
    private string CreateAccessToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.Name)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["AccessTokenDurationInMinutes"]!)),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string CreateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    private async Task SaveRefreshToken(User user, string refreshToken)
    {
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(double.Parse(_config["JwtSettings:RefreshTokenDurationInDays"]!));
        await _context.SaveChangesAsync();
    }
    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!)),
            ValidateLifetime = false 
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
        if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
}
