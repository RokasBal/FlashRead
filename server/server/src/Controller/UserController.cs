using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.UserNamespace;
using System.Security.Claims;
using server.src;

namespace server.Controller {
    [Route("api")]

    [ApiController]
    public class UserDataController : ControllerBase {
        private readonly UserHandler _userHandler;
        public UserDataController(UserHandler userHandler) {
            _userHandler = userHandler;
        }
        
        [HttpGet("Users/All")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userHandler.GetAllUsersAsync();
            var usersWithoutPasswords = users.Select(user => new UserDTO
            {
                Name = user.Name,
                Email = user.Email,
            });
            return Ok(usersWithoutPasswords);
        }
        [Authorize]
        [HttpGet("Users/GetLogins")]
        public async Task<IActionResult> GetUser() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(userEmail)) {
                return Unauthorized("Invalid token.");
            }

            var user = await _userHandler.GetUserByEmailAsync(userEmail);
            if (user != null) {
                return Ok(new UserDTO { Email = user?.Email, Name = user?.Name});
            }
            return NotFound("User not found.");
        }
        [HttpGet("Users/GetUserDetails")]
        public async Task<IActionResult> GetUserDetails([FromQuery] string email) {
            var user = await _userHandler.GetUserByEmailAsync(email);
            if (user != null) {
                return Ok(new UserDetailsDTO { Email = user?.Email, Name = user?.Name, JoinedAt = user?.JoinedAt });
            }
            return NotFound("User not found.");
        }
        [Authorize]
        [HttpGet("Settings/GetProfilePicture")]
        public async Task<IActionResult> GetProfilePicture() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Invalid token.");
            }
            var user = await _userHandler.GetUserByEmailAsync(userEmail);
            if (user != null) {
                Console.WriteLine("defaultPicture: ");
                Console.WriteLine(user.ProfilePic);
                if (user.ProfilePic == null || user.ProfilePic.Length == 0) {
                    var defaultPicturePath = Path.Combine(Directory.GetCurrentDirectory(), "src", "images", "defaultPicture.jpg");
                    var defaultPicture = await System.IO.File.ReadAllBytesAsync(defaultPicturePath);
                    return File(defaultPicture, "image/jpeg", "defaultPicture.jpg");
                }

                return File(user.ProfilePic, "image/jpeg", "profile.jpg");
            }
            return NotFound("User not found.");
        }
        [Authorize]
        [HttpPost("Settings/UpdateProfilePicture")]
        public async Task<IActionResult> UpdateProfilePicture(IFormFile profilePicture) {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                return Unauthorized("Invalid token.");
            }
            var user = await _userHandler.GetUserByEmailAsync(userEmail);
            if (user == null) {
                return NotFound("User not found.");
            }

            if (profilePicture == null || profilePicture.Length == 0) {
                return BadRequest("Invalid profile picture.");
            }

            var profilePic = null as byte[];

            using (var memoryStream = new MemoryStream()) {
                await profilePicture.CopyToAsync(memoryStream);
                profilePic = memoryStream.ToArray();
            }

            await _userHandler.UpdateProfilePictureAsync(userEmail, profilePic);

            return Ok("Profile picture updated successfully.");
        }
        [Authorize]
        [HttpGet("Users/GetUserHistory")]
        public async Task<IActionResult> GetUserHistory() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                return Unauthorized("Invalid token.");
            }
            var user = await _userHandler.GetUserByEmailAsync(userEmail);
            if (user != null) {
                var history = await _userHandler.GetTaskHistoryByEmail(userEmail);
                return Ok(history);
            }
            return NotFound("User not found.");
        }
        [Authorize]
        [HttpPost("Users/ChangePassword")]
        public async Task<IActionResult> ChangeUserPassword([FromBody] ChangePasswordRequest request) {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                return Unauthorized("Invalid token.");
            }
            var dbUser = await _userHandler.GetUserByEmailAsync(userEmail);
            if (dbUser == null) {
                return NotFound("User not found.");
            }
            if (string.IsNullOrEmpty(request.OldPassword) || !_userHandler.VerifyPassword(request.OldPassword, dbUser.Password)) {
                return Unauthorized("Invalid password.");
            }
            if (string.IsNullOrEmpty(request.NewPassword)) {
                return BadRequest("New password cannot be null or empty.");
            }
            await _userHandler.ChangeUserPasswordAsync(userEmail, request.NewPassword);
            return Ok("Password changed.");
        }
        [Authorize]
        [HttpPost("Users/ChangeUserName")]
        public async Task<IActionResult> ChangeUserName([FromBody] ChangeUserNameRequest request) {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                return Unauthorized("Invalid token.");
            }
            if (string.IsNullOrEmpty(request.NewName)) {
                return BadRequest("New name cannot be null or empty.");
            }
            await _userHandler.ChangeUserNameAsync(userEmail, request.NewName);
            return Ok("Name changed.");
        }
        [Authorize]
        [HttpGet("Users/DeleteUser")]
        public async Task<IActionResult> DeleteUser() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                return Unauthorized("Invalid token.");
            }
            await _userHandler.DeleteUserByEmailAsync(userEmail);
            return Ok("User deleted.");
        }
        [HttpPost("Users/TotalScoreLeaderboard")]
        public async Task<IActionResult> GetTotalScoreLeaderBoard([FromQuery] int page) {
            if (page < 1) {
                return BadRequest("Invalid page number.");
            }
            var pageSize = 10;
            var skip = (page - 1) * pageSize;
            
            var pagedResult = await _userHandler.GetTotalScoresAsync(skip, pageSize);
            
            return Ok(pagedResult);
        }

        [HttpPost("Users/HighScoreLeaderboard")]
        public async Task<IActionResult> GetHighScoreLeaderBoard([FromQuery] int page) {
            if (page < 1) {
                return BadRequest("Invalid page number.");
            }
            
            var pageSize = 10;
            var skip = (page - 1) * pageSize;

            var highScores = await _userHandler.GetHighScoresAsync(skip, pageSize);

            return Ok(highScores);
        }
    }
    public record UserScore {
        public string? Name { get; set; }
        public int Score { get; set; }
        public int? Gamemode { get; set; }
    }
    public record ChangePasswordRequest {
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
    }
    public record ChangeUserNameRequest {
        public string? NewName { get; set; }
    }
}