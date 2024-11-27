using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.src;
using server.UserNamespace;
using System.Security.Claims;
namespace server.Controller {
    [Route("api")]

    [ApiController]
    public class AuthController : ControllerBase {
        private readonly UserHandler _userHandler;
        public AuthController(UserHandler userHandler) {
            _userHandler = userHandler;
        }
        [HttpPost("Users/Register")]
        public async Task<IActionResult> PostUser([FromBody] UserFromAPI userAPI) {
            var user = IUserApi.convertUserFromAPI(userAPI);
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid user data.");
            }
            try 
            {
                var result = await _userHandler.RegisterUserAsync(user);
                var token = await _userHandler.LoginUserAsync(user);
                return Ok(new { Token = token});
            }
            catch (UserAlreadyExistsException e)
            {
                return StatusCode(500, e.Message);
            }
        }
        [HttpPost("Users/Login")]
        public async Task<IActionResult> PostLogin([FromBody] UserFromAPI userAPI) {
            var user = IUserApi.convertUserFromAPI(userAPI);
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid user data.");
            }
            try {
                var result = await _userHandler.LoginUserAsync(user);
                return Ok(new { Token = result });
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }
        }
        [Authorize]
        [HttpPost("Users/CheckAuth")]
        public IActionResult CheckAuth() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Invalid token.");
            }
            return Ok("Token is valid.");
        }
    }
}