using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TestAPI.Models;
using Microsoft.Extensions.Identity.Core;
using System.Diagnostics.Eventing.Reader;
using Microsoft.AspNetCore.Authentication.BearerToken;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using System.Text;
namespace TestAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        public AuthController(UserManager<User>userManager, SignInManager<User> signInManager, IConfiguration configuration, RoleManager<IdentityRole> roleManager)
        {
            _configuration= configuration;
            _userManager= userManager;
            _signInManager= signInManager;
            _roleManager=roleManager;
        }
        [HttpPost("register")]//регистрация
        public async Task<ActionResult<AuthResponse>> Registration(RegisterModel registerModel)
        {   
            Console.WriteLine($"Email:{registerModel.Email}");

            Console.WriteLine($"Username:{registerModel.Username}");

            Console.WriteLine("Register password length: " + (registerModel?.Password?.Length ?? -1));


            if (!ModelState.IsValid)//невалидная модель
            {
                return BadRequest(new AuthResponse
                {
                    IsSuccess = false,
                    Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                });
            }

            var user = new User
            {   UserName=registerModel.Username,
                Email = registerModel.Email,
                FirstName = registerModel.FirstName,
                LastName = registerModel.LastName,
            };

            var result = await _userManager.CreateAsync(user,registerModel.Password);

            if (result.Succeeded)
            {   
                if (!await _userManager.IsInRoleAsync(user, "User"))//добавляем проверку user на наличие роли
                {   //создаем при необходимости и присваиваем
                    var roleExist = await _roleManager.RoleExistsAsync("User");
                    if (!roleExist)
                    {
                        await _roleManager.CreateAsync(new IdentityRole("User"));
                    }
                    await _userManager.AddToRoleAsync(user, "User");
                }
                return Ok(new AuthResponse
                {   //ответ в случае успеха
                    IsSuccess = true,
                    Message = "User was registred",
                    Email = user.Email,
                    UserId = user.Id,
                });
            }

            else
            {
                return BadRequest(new AuthResponse
                {
                    IsSuccess = false,
                    Errors = result.Errors.Select(v => v.Description).ToList()
                });
            }
        }



        [HttpPost("login")]
        public async Task<ActionResult<LoginModel>> Login(LoginModel loginModel)
        {
            Console.WriteLine($"Email:{loginModel.Email}");
            Console.WriteLine($"Remember:{loginModel.RememberMe}");
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponse()
                {
                    IsSuccess = false,
                    Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                });
            }
            var user = await _userManager.FindByEmailAsync(loginModel.Email);
            if (user == null)
            {
                return Unauthorized(new AuthResponse
                {
                    IsSuccess = false,
                    Message = "Login error!"
                });
            }
            var result = await _signInManager.PasswordSignInAsync( user, loginModel.Password, loginModel.RememberMe, lockoutOnFailure: false);

            if(result.Succeeded) 
            {
                var token = await GenerateJwtToken(user);
                return Ok(new AuthResponse
                {
                    IsSuccess = true,
                    Message = "Login successful",
                    Token = token,
                    Email = user.Email,
                    UserId = user.Id
                    
                });
            }

            if (result.IsLockedOut)
            {
                return Unauthorized(new AuthResponse
                {
                    IsSuccess = false,
                    Message = "Account locked out"
                });
            }


            if (result.IsNotAllowed)
            {  
                return Unauthorized(new AuthResponse
                {
                    IsSuccess = false,
                    Message = "Email not confirmed or account not allowed to sign in."
                });
            }

            return Unauthorized(new AuthResponse
            {
                IsSuccess = false,   //ответ при несоблюдении всех условий
                Message = "Invalid login attempt"
            });
        }


        public async Task<string> GenerateJwtToken(User user)
        {
            var claims = new List<Claim>//список свойств jwt-токена
            {
                new Claim(JwtRegisteredClaimNames.Sub,user.Email),
                new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier , user.Id.ToString()),
                new Claim(ClaimTypes.Email,user.Email),
                new Claim("FirstName",user.FirstName??""),
                new Claim("LastName",user.LastName??""),
            };
            var roles= await _userManager.GetRolesAsync(user);

            claims.AddRange(roles.Select(role=>new Claim(ClaimTypes.Role,role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var creds=new SigningCredentials(key,SecurityAlgorithms.HmacSha256);

            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims:claims,
                expires:expires,
                signingCredentials:creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
