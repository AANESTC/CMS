using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Infrastructure.Data;
using CMS.Domain.Entities;
using System.Threading.Tasks;
using System;

namespace CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class RegisterRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string Role { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Email))
            {
                return BadRequest(new { Message = "User already exists." });
            }

            var user = new User
            {
                UserId = Guid.NewGuid(),
                Username = request.Email,
                // In a real app, hash the password!
                PasswordHash = request.Password, 
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User registered successfully." });
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Email && u.PasswordHash == request.Password);

            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid credentials." });
            }

            // In a real app, generate a JWT token here
            return Ok(new 
            { 
                Message = "Login successful.", 
                Role = user.Role,
                UserId = user.UserId 
            });
        }
    }
}
