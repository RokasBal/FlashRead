using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using server.src;
using server.Controller;
using server.UserNamespace;
using server.Services;
using server.src.Settings;
using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using server.Exceptions;

namespace server.Tests {
    public class AccountSettingsControllerTests : IDisposable {
        private readonly AccountSettingsController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;
        private readonly Settings _settings;
        private readonly ILogger<Settings> _logger;

        public AccountSettingsControllerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "TestSettingsDatabase")
                .Options;
            _context = new FlashDbContext(options);

            var serviceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            var serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
            _dbContextFactory = new DbContextFactory(serviceScopeFactory);

            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
            _tokenProvider = new TokenProvider(configuration);
            _historyManager = new HistoryManager(_context);
            _sessionManager = new SessionManager(_dbContextFactory);
            _userHandler = new UserHandler(_context, _tokenProvider, _historyManager, _sessionManager);
            _logger = new Mock<ILogger<Settings>>().Object;
            _settings = new Settings(_context, _logger);
            _controller = new AccountSettingsController(_userHandler, _settings);
        }

        private void SetUserEmail(string? email) {
            var claims = new List<Claim>();
            if (email != null) {
                claims.Add(new Claim(ClaimTypes.Email, email));
            }
            var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "mock"));
            _controller.ControllerContext = new ControllerContext {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }
        [Fact]
        public async Task GetCurrentUserName_ReturnsOkResult_WithUserName()
        {
            // Arrange
            var user = new User("john.doe@example.com", "password123", "John Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString()  // Set to a valid value
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            // Act
            var result = await _controller.GetCurrentUserName();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<Name>(okResult.Value);
            Assert.Equal("John Doe", returnValue.Value);
        }
        [Fact]
        public async Task GetCurrentUserName_ReturnsNotFound_WhenUserNotFound()
        {
            // Arrange
            var testEmail = "nonexistent@example.com";
            SetUserEmail(testEmail);

            // Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetCurrentUserName());
            Assert.Equal("User not found.", exception.Message);
        }
        [Fact]
        public async Task GetCurrentUserName_ReturnsUnauthorized_WhenEmailClaimIsMissing()
        {
            // Arrange
            SetUserEmail(null);

            // Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(async () => await _controller.GetCurrentUserName());
            Assert.Equal("Invalid token.", exception.Message);
        }
        [Fact]
        public async Task GetUserInfo_ReturnsOkResult_WithUserInfo()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.Now
            };
            
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            // Act
            var result = await _controller.GetUserInfo();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<UserInfo>(okResult.Value);
            Assert.Equal("Jane Doe", returnValue.Name);
            Assert.Equal(dbUser.JoinedAt, returnValue.JoinedAt);
        }
        [Fact]
        public async Task GetUserInfo_ReturnsNotFound_WhenUserNotFound()
        {
            // Arrange
            var userEmail = "nonexistent@example.com";
            SetUserEmail(userEmail);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetUserInfo());
            Assert.Equal("User not found.", exception.Message);
        }
        [Fact]
        public async Task GetUserInfo_ReturnsUnauthorized_WhenEmailClaimIsMissing()
        {
            // Arrange
            SetUserEmail(null);

            // Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(async () => await _controller.GetUserInfo());
            Assert.Equal("Invalid token.", exception.Message);
        }
        [Fact]
        public async Task GetThemeSettings_ReturnsOkResult_WithThemeSettings()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email); 

            var themeSettings = new DbSettingsTheme { Theme = "dark" };
            themeSettings.MainBackground = "#000000";
            themeSettings.SecondaryBackground = "#111111";
            themeSettings.PrimaryColor = "#222222";
            themeSettings.AccentColor = "#333333";
            themeSettings.TextColor = "#444444";
            themeSettings.BorderColor = "#555555";
            _context.SettingsThemes.Add(themeSettings);
            await _context.SaveChangesAsync();

            var userSettings = new DbUserSettings { Id = dbUser.SettingsId, Theme = "dark", Font = "Arial" };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetThemeSettings();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<DbSettingsTheme>(okResult.Value);
            Assert.Equal("dark", returnValue.Theme);
        }
        [Fact]
        public async Task GetThemeSettings_ReturnsNotFoundException_SettingsIdIsNull()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email); 

            var themeSettings = new DbSettingsTheme { Theme = "dark" };
            themeSettings.MainBackground = "#000000";
            themeSettings.SecondaryBackground = "#111111";
            themeSettings.PrimaryColor = "#222222";
            themeSettings.AccentColor = "#333333";
            themeSettings.TextColor = "#444444";
            themeSettings.BorderColor = "#555555";
            _context.SettingsThemes.Add(themeSettings);
            await _context.SaveChangesAsync();

            var userSettings = new DbUserSettings { Id = dbUser.SettingsId, Theme = "dark", Font = "Arial" };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            await _context.Users.Where(u => u.Email == user.Email).ForEachAsync(u => u.SettingsId = null);

            // Assert & Act
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetThemeSettings());
            Assert.Equal("Settings not found.", exception.Message);
        }

        [Fact]
        public async Task GetThemeSettings_ReturnsNotFound_WhenSettingsNotFound()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
            Name = user.Name,
            Email = user.Email,
            Password = user.Password,
            SessionsId = Guid.NewGuid().ToString(),
            SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            var themeSettings = new DbSettingsTheme { Theme = "Dark" };
            themeSettings.MainBackground = "#000000";
            themeSettings.SecondaryBackground = "#111111";
            themeSettings.PrimaryColor = "#222222";
            themeSettings.AccentColor = "#333333";
            themeSettings.TextColor = "#444444";
            themeSettings.BorderColor = "#555555";
            _context.SettingsThemes.Add(themeSettings);
            await _context.SaveChangesAsync();

            // Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetThemeSettings());
            Assert.Equal("Theme not found.", exception.Message);
        }
        [Fact]
        public async Task GetThemeSettings_ReturnsUnauthorized_WhenEmailClaimIsMissing()
        {
            // Arrange
            SetUserEmail(null);

            // Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(async () => await _controller.GetThemeSettings());
            Assert.Equal("Invalid token.", exception.Message);
        }

        [Fact]
        public async Task GetFontSettings_ReturnsNotFound_WhenSettingsNotFound()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            var fontSettings = new DbSettingsFont { Font = "Arial", FontFamily = "Arial, sans-serif" };
            _context.SettingsFonts.Add(fontSettings);
            await _context.SaveChangesAsync();
            
            // Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetFontSettings());
            Assert.Equal("Font not found.", exception.Message);
        }
        [Fact]
        public async Task GetFontSettings_ReturnsOkResult_WithFontSettings()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            var fontSettings = new DbSettingsFont { Font = "Arial", FontFamily = "Arial, sans-serif" };
            _context.SettingsFonts.Add(fontSettings);
            await _context.SaveChangesAsync();

            var userSettings = new DbUserSettings { Id = dbUser.SettingsId, Theme = "Dark", Font = "Arial" };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetFontSettings();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<DbSettingsFont>(okResult.Value);
            Assert.Equal("Arial", returnValue.Font);
        }
        [Fact]
        public async Task GetFontSettings_ReturnsNotFoundException_WhenSettingsIdIsNull()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            var fontSettings = new DbSettingsFont { Font = "Arial", FontFamily = "Arial, sans-serif" };
            _context.SettingsFonts.Add(fontSettings);
            await _context.SaveChangesAsync();

            var userSettings = new DbUserSettings { Id = dbUser.SettingsId, Theme = "Dark", Font = "Arial" };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            await _context.Users.Where(u => u.Email == user.Email).ForEachAsync(u => u.SettingsId = null);

            // Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetFontSettings());
            Assert.Equal("Settings not found.", exception.Message);
        }
        [Fact]
        public async Task GetFontSettings_ReturnsUnauthorized_WhenEmailClaimIsMissing()
        {
            // Arrange
            SetUserEmail(null);

            // Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(async () => await _controller.GetFontSettings());
            Assert.Equal("Invalid token.", exception.Message);
            
        }
        [Fact]
        public async Task GetAllThemes_ReturnsOkResult_WithThemes()
        {
            // Arrange
            var themes = new List<DbSettingsTheme>
            {
                new DbSettingsTheme { Theme = "Dark", MainBackground = "#000000", SecondaryBackground = "#111111", PrimaryColor = "#222222", AccentColor = "#333333", TextColor = "#444444", BorderColor = "#555555" },
                new DbSettingsTheme { Theme = "Light", MainBackground = "#ffffff", SecondaryBackground = "#eeeeee", PrimaryColor = "#dddddd", AccentColor = "#cccccc", TextColor = "#bbbbbb", BorderColor = "#aaaaaa" }
            };
            _context.SettingsThemes.AddRange(themes);
            await _context.SaveChangesAsync();
            SetUserEmail("jane.doe@example.com");

            // Act
            var result = await _controller.GetAllThemes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<string[]>(okResult.Value);
            Assert.Equal(new[] { "Dark", "Light" }, returnValue);
        }

        [Fact]
        public async Task GetAllFonts_ReturnsOkResult_WithFonts()
        {
            // Arrange
            var fonts = new List<DbSettingsFont>
            {
                new DbSettingsFont { Font = "Arial", FontFamily = "Arial, sans-serif" },
                new DbSettingsFont { Font = "Times New Roman", FontFamily = "Times New Roman, serif" }
            };
            _context.SettingsFonts.AddRange(fonts);
            await _context.SaveChangesAsync();
            SetUserEmail("jane.doe@example.com");

            // Act
            var result = await _controller.GetAllFonts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<string[]>(okResult.Value);
            Assert.Equal(new[] { "Arial", "Times New Roman" }, returnValue);
        }

        [Fact]
        public async Task GetThemeSettingsByTheme_ReturnsOkResult_WithThemeSettings()
        {
            // Arrange
            var theme = "dark";
            var themeSettings = new DbSettingsTheme { Theme = theme, MainBackground = "#000000", SecondaryBackground = "#111111", PrimaryColor = "#222222", AccentColor = "#333333", TextColor = "#444444", BorderColor = "#555555" };
            _context.SettingsThemes.Add(themeSettings);
            await _context.SaveChangesAsync();
            SetUserEmail("jane.doe@example.com");

            // Act
            var result = await _controller.GetThemeSettingsByTheme(theme);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<DbSettingsTheme>(okResult.Value);
            Assert.Equal(theme, returnValue.Theme);
        }

        [Fact]
        public async Task GetFontSettingsByTheme_ReturnsOkResult_WithFontSettings()
        {
            // Arrange
            var font = "Arial";
            var fontSettings = new DbSettingsFont { Font = font, FontFamily = "Arial, sans-serif" };
            _context.SettingsFonts.Add(fontSettings);
            await _context.SaveChangesAsync();
            SetUserEmail("jane.doe@example.com");

            // Act
            var result = await _controller.GetFontSettingsByTheme(font);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<DbSettingsFont>(okResult.Value);
            Assert.Equal(font, returnValue.Font);
        }

        [Fact]
        public async Task UpdateSelectedTheme_ReturnsOkResult_WhenThemeUpdated()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            var userSettings = new DbUserSettings { Id = dbUser.SettingsId, Theme = "Light", Font = "Arial" };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.UpdateSelectedTheme("Dark");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Theme updated successfully.", okResult.Value);
        }

        [Fact]
        public async Task UpdateSelectedTheme_ReturnsNotFound_WhenSettingsNotFound()
        {
            // Arrange
            SetUserEmail("nonexistent@example.com");

            // Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.UpdateSelectedTheme("Dark"));
            Assert.Equal("Settings not found for update.", exception.Message);
        }

        [Fact]
        public async Task UpdateSelectedTheme_ReturnsUnauthorized_WhenEmailClaimIsMissing()
        {
            // Arrange
            SetUserEmail(null);

            // Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(async () => await _controller.UpdateSelectedTheme("Dark"));
            Assert.Equal("Invalid token.", exception.Message);
        }

        [Fact]
        public async Task UpdateSelectedFont_ReturnsOkResult_WhenFontUpdated()
        {
            // Arrange
            var user = new User("jane.doe@example.com", "password123", "Jane Doe");
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            SetUserEmail(user.Email);

            var userSettings = new DbUserSettings { Id = dbUser.SettingsId, Theme = "Dark", Font = "Times New Roman" };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.UpdateSelectedFont("Arial");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Font updated successfully.", okResult.Value);
        }

        [Fact]
        public async Task GetUserPageData_ReturnsNotFound_WhenEmailNotFound()
        {
            // Arrange
            var username = "john.doe";
            var email = "john.doe@example.com";
            
            
            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetUserPageData(username));
            Assert.Equal("User not found.", exception.Message);
        }
        // [Fact]
        // public async Task GetUserPageData_ReturnsOkResult_WithUserData()
        // {
        //     // Arrange
        //     var user = new User("jane.doe@example.com", "password123", "Jane Doe");
        //     user.Password = _userHandler.HashPassword(user.Password);
        //     var dbUser = new DbUser
        //     {
        //         Name = user.Name,
        //         Email = user.Email,
        //         Password = user.Password,
        //         SessionsId = Guid.NewGuid().ToString(),
        //         SettingsId = Guid.NewGuid().ToString(),
        //         JoinedAt = DateTime.Now,
        //         HistoryIds = new string[0],
        //         ProfilePic = new byte[0]
        //     };
        //     _context.Users.Add(dbUser);
        //     await _context.SaveChangesAsync();
        //     SetUserEmail(user.Email);

        //     // Act
        //     var result = await _controller.GetUserPageData("Jane Doe");
        //     var okResult = Assert.IsType<OkObjectResult>(result);
        //     var returnValue = Assert.IsType<UserPageData>(okResult.Value);
        // }
        [Fact]
        public async Task UpdateSelectedFont_ReturnsNotFound_WhenSettingsNotFound()
        {
            // Arrange
            SetUserEmail("nonexistent@example.com");

            // Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(async () => await _controller.UpdateSelectedFont("Arial"));
            Assert.Equal("Settings not found for update.", exception.Message);
        }

        [Fact]
        public async Task UpdateSelectedFont_ReturnsUnauthorized_WhenEmailClaimIsMissing()
        {
            // Arrange
            SetUserEmail(null);

            // Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(async () => await _controller.UpdateSelectedFont("Arial"));
            Assert.Equal("Invalid token.", exception.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
        public class FailingFlashDbContext : FlashDbContext
        {
            public FailingFlashDbContext(DbContextOptions<FlashDbContext> options)
                : base(options)
            {
            }
        
            public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            {
                throw new Exception("Database error");
            }
        }
        
    }
}