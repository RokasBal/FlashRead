using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.src;
using server.UserNamespace;
using System.Security.Claims;
using server.src.Settings;
using server.Exceptions;
using server.Utility;

namespace server.Controller {
    [Route("api")]

    [ApiController]
    public class AccountSettingsController : ControllerBase {
        private readonly UserHandler _userHandler;
        private readonly Settings _settings;
        public AccountSettingsController(UserHandler userHandler, Settings settings) {
            _userHandler = userHandler;
            _settings = settings;
        }

        [Authorize]
        [HttpGet("User/GetCurrentUserName")]
        public async Task<IActionResult> GetCurrentUserName() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                throw new UnauthorizedException("Invalid token.");
            }

            var user = await _userHandler.GetUserByEmailAsync(userEmail);
            if (user == null) {
                throw new NotFoundException("User not found.");
            }
            return Ok(new Name { Value = user.Name });
        }

        [Authorize]
        [HttpGet("User/GetUserInfo")]
        public async Task<IActionResult> GetUserInfo() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                throw new UnauthorizedException("Invalid token.");
            }

            var user = await _userHandler.GetUserByEmailAsync(userEmail);
            if (user == null) {
                throw new NotFoundException("User not found.");
            }
            return Ok(new { Name = user.Name, JoinedAt = user.JoinedAt });   
        }

        [Authorize]
        [HttpGet("User/GetThemeSettings")]
        public async Task<IActionResult> GetThemeSettings() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedException("Invalid token.");
            }
            var settingsId = await _userHandler.GetSettingsIdByEmailAsync(userEmail);
            if (settingsId == null)
            {
                throw new NotFoundException("Settings not found.");
            }
            var theme = await _userHandler.GetSettingsThemeById(settingsId);
            if (theme == null)
            {
                throw new NotFoundException("Theme not found.");
            }
            var settings = await _settings.GetSettingsByThemeAsync(theme);
            return Ok(settings);
        }

        [Authorize]
        [HttpGet("User/GetFontSettings")]
        public async Task<IActionResult> GetFontSettings() {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedException("Invalid token.");
            }
            var settingsId = await _userHandler.GetSettingsIdByEmailAsync(userEmail);
            if (settingsId == null)
            {
                throw new NotFoundException("Settings not found.");
            }
            var theme = await _userHandler.GetSettingsFontById(settingsId);
            if (theme == null)
            {
                throw new NotFoundException("Font not found.");
            }
            var settings = await _settings.GetSettingsByFontAsync(theme);
            return Ok(settings);
        }

        [HttpGet("Settings/GetAllThemes")]
        public async Task<IActionResult> GetAllThemes() {
            var themes = await _settings.GetAllThemesAsync();
            return Ok(themes);
        }

        [HttpGet("Settings/GetAllFonts")]
        public async Task<IActionResult> GetAllFonts() {
            var fonts = await _settings.GetAllFontsAsync();
            return Ok(fonts);
        }

        [HttpGet("User/GetUserPageData")]
        public async Task<IActionResult> GetUserPageData(string username) {
            var email = await _userHandler.GetEmailByNameAsync(username);
            if (email == null) {
                throw new NotFoundException("User not found.");
            }
            var user = await _userHandler.GetUserByEmailAsync(email);
            byte[] defaultProfilePic = await Utility.Utility.getDefaultProfilePic();
            if (user == null) {
                throw new NotFoundException("User not found.");
            }

            var profilePic = await _userHandler.GetUserProfilePicByEmailAsync(email);
            var history = await _userHandler.GetTaskHistoryByEmail(email);

            if (profilePic == null || profilePic.Length == 0) {
                profilePic = defaultProfilePic;
            }

            return Ok(new { 
                Name = user.Name, 
                JoinedAt = user.JoinedAt, 
                ProfilePic = profilePic,
                History = history
                 });   
        }

        [HttpGet("Settings/GetThemeSettingsByTheme")]
        public async Task<IActionResult> GetThemeSettingsByTheme(string theme) {
            var settings = await _settings.GetSettingsByThemeAsync(theme);
            return Ok(settings);
        }

        [HttpGet("Settings/GetFontSettingsByFont")]
        public async Task<IActionResult> GetFontSettingsByTheme(string font) {
            var settings = await _settings.GetSettingsByFontAsync(font);
            return Ok(settings);
        }

        [Authorize]
        [HttpPost("Settings/UpdateTheme")]
        public async Task<IActionResult> UpdateSelectedTheme(string theme) {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                throw new UnauthorizedException("Invalid token.");
            }
            var settingsId = await _userHandler.GetSettingsIdByEmailAsync(userEmail);
            if (settingsId == null) {
                throw new NotFoundException("Settings not found for update.");
            }
            await _settings.UpdateSelectedTheme(settingsId, theme);
            return Ok("Theme updated successfully.");
        }

        [Authorize]
        [HttpPost("Settings/UpdateFont")]
        public async Task<IActionResult> UpdateSelectedFont(string font) {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail)) {
                throw new UnauthorizedException("Invalid token.");
            }
            var settingsId = await _userHandler.GetSettingsIdByEmailAsync(userEmail);
            if (settingsId == null) {
                throw new NotFoundException("Settings not found for update.");
            }
            await _settings.UpdateSelectedFont(settingsId, font);
            return Ok("Font updated successfully.");
        }
    }
    public record Name
    {
        public string? Value { get; init; }
    }
}