using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Reflection;
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

namespace server.Tests {
    public class UserHandlerTests : IDisposable {
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;
        private readonly Settings _settings;
        private readonly Mock<TokenProvider> _mockTokenProvider;
        private readonly Mock<HistoryManager> _mockHistoryManager;
        private readonly Mock<SessionManager> _mockSessionManager;
        private readonly UserHandler _mockUserHandler;

        public UserHandlerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "UserHandlerDatabase")
                .Options;
            _context = new FlashDbContext(options);

            var serviceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .AddDbContext<FlashDbContext>(options => options.UseInMemoryDatabase("TestDatabaseAuthentication"))
                .BuildServiceProvider();

            var serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
            _dbContextFactory = new DbContextFactory(serviceScopeFactory);

            Environment.SetEnvironmentVariable("JWT_SECRET", "your_secret_key_your_secret_key_your_secret_key");
            var configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();
            _tokenProvider = new TokenProvider(configuration);
            _historyManager = new HistoryManager(_context);
            _sessionManager = new SessionManager(_dbContextFactory);
            _userHandler = new UserHandler(_context, _tokenProvider, _historyManager, _sessionManager);
           
            _mockTokenProvider = new Mock<TokenProvider>(MockBehavior.Strict, new ConfigurationBuilder().Build());
            _mockHistoryManager = new Mock<HistoryManager>(_context);
            _mockSessionManager = new Mock<SessionManager>(_dbContextFactory);
            _mockUserHandler = new UserHandler(_context, _mockTokenProvider.Object, _mockHistoryManager.Object, _mockSessionManager.Object);
        
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
        [Fact]
        public async Task RegisterUserAsync_ShouldThrow_WhenUsernameAlreadyExists()
        {
            // Arrange
            var user = new User { Email = "test@example.com", Password = "password123", Name = "Test User"};
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = _userHandler.HashPassword(user.Password),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            user.Name = dbUser.Name;
            user.Email = "Different";
            // Act & Assert
            await Assert.ThrowsAsync<UserAlreadyExistsException>(() => _userHandler.RegisterUserAsync(user));
        }
        
        [Fact]
        public async Task RegisterUserAsync_ShouldThrow_WhenEmailAlreadyExists()
        {
            // Arrange
            var user = new User { Email = "test@example.com", Password = "password123", Name = "Test User"};
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = _userHandler.HashPassword(user.Password),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            user.Email = dbUser.Email;
            user.Name = "Different";
            // Act & Assert
            await Assert.ThrowsAsync<UserAlreadyExistsException>(() => _userHandler.RegisterUserAsync(user));
        }

        [Fact]
        public async Task RegisterUserAsync_ShouldReturnTrue_WhenUserDoesNotExist()
        {
            // Arrange
            var user = new User { Email = "test@example.com", Password = "password123", Name = "Test User"};
            
            // Act
            var result = await _userHandler.RegisterUserAsync(user);

            // Assert
            Assert.True(result);
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            Assert.NotNull(dbUser);
            Assert.Equal(user.Email, dbUser.Email);
        }

        [Fact]
        public async Task LoginUserAsync_ShouldReturnToken_WhenCredentialsAreValid()
        {
            // Arrange
            var user = new User { Email = "test@example.com", Password = "password123" };
            var dbUser = new DbUser
            {
                Name = "John Doe",
                Email = user.Email,
                Password = _userHandler.HashPassword(user.Password),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            
            _mockTokenProvider.Setup(tp => tp.Create(It.IsAny<User>())).Returns("token");
            _mockSessionManager.Setup(sm => sm.AddSessionToDictionary(user.Email)).Returns(Task.CompletedTask);
            _mockSessionManager.Setup(sm => sm.GetConnectedUsers()).Returns(new List<string> { user.Email });

            // Act
            var token = await _userHandler.LoginUserAsync(user);

            // Assert
            var session = _mockSessionManager.Object.GetConnectedUsers().FirstOrDefault(email => email == dbUser.Email);
            Assert.NotNull(session);
            Assert.Equal(dbUser.Email, session);
        }

        [Fact]
        public async Task LoginUserAsync_ShouldThrowException_WhenUserNotFound()
        {
            // Arrange
            var user = new User { Email = "nonexistent@example.com", Password = "password123" };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _userHandler.LoginUserAsync(user));
            Assert.Equal("User not found", exception.Message);
        }

        [Fact]
        public async Task LoginUserAsync_ShouldThrowException_WhenPasswordIsInvalid()
        {
            // Arrange
            var user = new User { Email = "test@example.com", Password = "wrongpassword" };
            var dbUser = new DbUser
            {
                Name = "John Doe",
                Email = user.Email,
                Password = _userHandler.HashPassword("user.Password"),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _userHandler.LoginUserAsync(user));
            Assert.Equal("Invalid password", exception.Message);
        }
        [Fact]
        public async Task DeleteUserAsync_ShouldReturnFalse_WhenUserDoesNotExist()
        {
            // Arrange
            var user = new User { Email = "nonexistent@example.com" };

            // Act
            var result = await _userHandler.DeleteUserAsync(user);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task DeleteUserAsync_ShouldReturnTrue_WhenUserExists()
        {
            // Arrange
            var user = new User { Email = "test1q@example.com", Password = "password123", Name = "Test User" };
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = _userHandler.HashPassword(user.Password),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.DeleteUserAsync(user);

            // Assert
            Assert.True(result);
            var deletedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            Assert.Null(deletedUser);
        }
        [Fact]
        public async Task GetUserAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var user = new User { Email = "test@example.com", Password = "password123", Name = "Test User" };
            var dbUser = new DbUser
            {
                Name = user.Name,
                Email = user.Email,
                Password = _userHandler.HashPassword(user.Password),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetUserAsync(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Email, result?.GetEmail());
            Assert.Equal(user.Name, result?.GetName());
        }

        [Fact]
        public async Task GetUserAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var user = new User { Email = "nonexistent@example.com", Password = "password123", Name = "Nonexistent User" };

            // Act
            var result = await _userHandler.GetUserAsync(user);

            // Assert
            Assert.Null(result);
        }
        [Fact]
        public async Task GetUserByEmailAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetUserByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result?.Email);
            Assert.Equal(dbUser.Name, result?.Name);
        }

        [Fact]
        public async Task GetUserByEmailAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";

            // Act
            var result = await _userHandler.GetUserByEmailAsync(email);

            // Assert
            Assert.Null(result);
        }
        [Fact]
        public void HashPassword_ShouldReturnHashedPassword()
        {
            // Arrange
            var password = "password123";

            // Act
            var hashedPassword = _userHandler.HashPassword(password);

            // Assert
            Assert.NotNull(hashedPassword);
            Assert.NotEqual(password, hashedPassword);
            Assert.True(BCrypt.Net.BCrypt.Verify(password, hashedPassword));
        }

        [Fact]
        public void VerifyPassword_ShouldReturnTrue_WhenPasswordIsCorrect()
        {
            // Arrange
            var password = "password123";
            var hashedPassword = _userHandler.HashPassword(password);

            // Act
            var result = _userHandler.VerifyPassword(password, hashedPassword);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnFalse_WhenPasswordIsIncorrect()
        {
            // Arrange
            var password = "password123";
            var hashedPassword = _userHandler.HashPassword(password);
            var wrongPassword = "wrongpassword";

            // Act
            var result = _userHandler.VerifyPassword(wrongPassword, hashedPassword);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ConvertUserToDbUser_ShouldReturnDbUser()
        {
            // Arrange
            var userHandlerTests = new UserHandlerTests();
            var user = new User { Email = "test@example.com", Password = "password123", Name = "Test User" };

            // Use reflection to access the private method
            var methodInfo = typeof(UserHandler).GetMethod("convertUserToDbUser", BindingFlags.NonPublic | BindingFlags.Instance);
            Assert.NotNull(methodInfo);

            // Act
            var dbUser = methodInfo.Invoke(userHandlerTests._userHandler, new object[] { user }) as DbUser;

            // Assert
            Assert.NotNull(dbUser);
            Assert.Equal(user.Email, dbUser.Email);
            Assert.Equal(user.Name, dbUser.Name);
            Assert.Equal(user.Password, dbUser.Password);
        }
        [Fact]
        public async Task GetSettingsIdByEmailAsync_ShouldReturnSettingsId_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetSettingsIdByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(dbUser.SettingsId, result);
        }

        [Fact]
        public async Task GetSettingsIdByEmailAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";

            // Act
            var result = await _userHandler.GetSettingsIdByEmailAsync(email);

            // Assert
            Assert.Null(result);
        }
        
        [Fact]
        public async Task CreateSettingsId_ShouldCreateSettingsIdForDbUser()
        {
            // Arrange
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = "test@example.com",
                Password = "password123",
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = "",
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Use reflection to access the private method
            var methodInfo = typeof(UserHandler).GetMethod("createSettingsId", BindingFlags.NonPublic | BindingFlags.Instance);
            Assert.NotNull(methodInfo);

            // Act
            await (Task)methodInfo.Invoke(_userHandler, new object[] { dbUser });

            // Assert
            var updatedDbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dbUser.Email);
            Assert.NotNull(updatedDbUser);
            Assert.NotNull(updatedDbUser.SettingsId);
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.Id == updatedDbUser.SettingsId);
            Assert.NotNull(userSettings);
            Assert.Equal("default_theme", userSettings.Theme);
            Assert.Equal("default_font", userSettings.Font);
        }
        [Fact]
        public async Task CreateSessionsId_ShouldCreateSessionsIdForDbUser()
        {
            // Arrange
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = "test@example.com",
                Password = "password123",
                SessionsId = "",
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Use reflection to access the private method
            var methodInfo = typeof(UserHandler).GetMethod("createSessionsId", BindingFlags.NonPublic | BindingFlags.Instance);
            Assert.NotNull(methodInfo);

            // Act
            await (Task)methodInfo.Invoke(_userHandler, new object[] { dbUser });

            // Assert
            var updatedDbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dbUser.Email);
            Assert.NotNull(updatedDbUser);
            Assert.NotNull(updatedDbUser.SessionsId);
            var userSessions = await _context.UserSessions.FirstOrDefaultAsync(us => us.Id == updatedDbUser.SessionsId);
            Assert.NotNull(userSessions);
        }
        [Fact]
        public async Task GetSettingsThemeById_ShouldReturnTheme_WhenSettingsExist()
        {
            // Arrange
            var settingsId = Guid.NewGuid().ToString();
            var userSettings = new DbUserSettings
            {
                Id = settingsId,
                Theme = "dark_theme",
                Font = "default_font"
            };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetSettingsThemeById(settingsId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("dark_theme", result);
        }

        [Fact]
        public async Task GetSettingsThemeById_ShouldReturnNull_WhenSettingsDoNotExist()
        {
            // Arrange
            var settingsId = Guid.NewGuid().ToString();

            // Act
            var result = await _userHandler.GetSettingsThemeById(settingsId);

            // Assert
            Assert.Null(result);
        }
        [Fact]
        public async Task SaveTaskResult_ShouldCallSaveTaskResult() {
            // Arrange
            var email = "test@example.com";
            var sessionId = 1u;
            var taskId = 1;
            var score = 100;
            var selectedVariants = new[] { 1, 2, 3 };

            _mockHistoryManager.Setup(hm => hm.SaveTaskResult(email, sessionId, taskId, score, selectedVariants))
                .Returns(Task.CompletedTask)
                .Verifiable();

            // Act
            await _mockUserHandler.SaveTaskResult(email, sessionId, taskId, score, selectedVariants);

            // Assert
            _mockHistoryManager.Verify();
        }
        [Fact]
        public async Task GetTaskHistoryByEmail_ShouldReturnTaskHistories_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow,
                HistoryIds = new string[] { "history1", "history2" }
            };
            var taskHistories = new List<DbTaskHistory>
            {
                new DbTaskHistory { Id = "history1", TaskId = 1, Score = 100 },
                new DbTaskHistory { Id = "history2", TaskId = 2, Score = 90 }
            };
            _context.Users.Add(dbUser);
            _context.UserTaskHistories.AddRange(taskHistories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetTaskHistoryByEmail(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, th => th.Id == "history1");
            Assert.Contains(result, th => th.Id == "history2");
        }

        [Fact]
        public async Task GetTaskHistoryByEmail_ShouldReturnEmptyList_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";

            // Act
            var result = await _userHandler.GetTaskHistoryByEmail(email);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
        [Fact]
        public async Task GetSettingsFontById_ShouldReturnFont_WhenSettingsExist()
        {
            // Arrange
            var settingsId = Guid.NewGuid().ToString();
            var userSettings = new DbUserSettings
            {
                Id = settingsId,
                Theme = "default_theme",
                Font = "custom_font"
            };
            _context.UserSettings.Add(userSettings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetSettingsFontById(settingsId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("custom_font", result);
        }

        [Fact]
        public async Task GetSettingsFontById_ShouldReturnNull_WhenSettingsDoNotExist()
        {
            // Arrange
            var settingsId = Guid.NewGuid().ToString();

            // Act
            var result = await _userHandler.GetSettingsFontById(settingsId);

            // Assert
            Assert.Null(result);
        }
        [Fact]
        public async Task ChangeUserPasswordAsync_ShouldChangePassword_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var newPassword = "newpassword123";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("oldpassword123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            await _userHandler.ChangeUserPasswordAsync(email, newPassword);

            // Assert
            var updatedDbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            Assert.NotNull(updatedDbUser);
            Assert.True(_userHandler.VerifyPassword(newPassword, updatedDbUser.Password));
        }

        [Fact]
        public async Task ChangeUserPasswordAsync_ShouldThrowException_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";
            var newPassword = "newpassword123";

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _userHandler.ChangeUserPasswordAsync(email, newPassword));
            Assert.Equal("User not found", exception.Message);
        }
        [Fact]
        public async Task ChangeUserNameAsync_ShouldChangeUserName_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var newUsername = "New Test User";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            await _userHandler.ChangeUserNameAsync(email, newUsername);

            // Assert
            var updatedDbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            Assert.NotNull(updatedDbUser);
            Assert.Equal(newUsername, updatedDbUser.Name);
        }

        [Fact]
        public async Task ChangeUserNameAsync_ShouldThrowException_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";
            var newUsername = "New Test User";

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _userHandler.ChangeUserNameAsync(email, newUsername));
            Assert.Equal("User not found", exception.Message);
        }

        [Fact]
        public async Task GetAllUsersAsync_ShouldReturnAllUsers()
        {
            // Arrange
            var users = new List<DbUser>
            {
                new DbUser
                {
                    Name = "User1",
                    Email = "user1@example.com",
                    Password = _userHandler.HashPassword("password1"),
                    SessionsId = Guid.NewGuid().ToString(),
                    SettingsId = Guid.NewGuid().ToString(),
                    JoinedAt = DateTime.UtcNow
                },
                new DbUser
                {
                    Name = "User2",
                    Email = "user2@example.com",
                    Password = _userHandler.HashPassword("password2"),
                    SessionsId = Guid.NewGuid().ToString(),
                    SettingsId = Guid.NewGuid().ToString(),
                    JoinedAt = DateTime.UtcNow
                }
            };
            _context.Users.AddRange(users);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetAllUsersAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, u => u.Email == "user1@example.com");
            Assert.Contains(result, u => u.Email == "user2@example.com");
        }
        [Fact]
        public async Task DeleteUserByEmailAsync_ShouldDeleteUserAndRelatedData_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow,
                HistoryIds = new string[] { "history1", "history2" }
            };
            var userSessions = new DbUserSessions
            {
                Id = dbUser.SessionsId,
                SessionIds = new string[] { "session1", "session2" }
            };
            var userSettings = new DbUserSettings
            {
                Id = dbUser.SettingsId,
                Theme = "default_theme",
                Font = "default_font"
            };
            var taskHistories = new List<DbTaskHistory>
            {
                new DbTaskHistory { Id = "history1", TaskId = 1, Score = 100 },
                new DbTaskHistory { Id = "history2", TaskId = 2, Score = 90 }
            };
            var singleSessions = new List<DbUserSingleSession>
            {
                new DbUserSingleSession { Id = "session1" },
                new DbUserSingleSession { Id = "session2" }
            };

            _context.Users.Add(dbUser);
            _context.UserSessions.Add(userSessions);
            _context.UserSettings.Add(userSettings);
            _context.UserTaskHistories.AddRange(taskHistories);
            _context.UserSingleSessions.AddRange(singleSessions);
            await _context.SaveChangesAsync();

            // Act
            await _userHandler.DeleteUserByEmailAsync(email);

            // Assert
            var deletedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            Assert.Null(deletedUser);

            var deletedUserSessions = await _context.UserSessions.FirstOrDefaultAsync(s => s.Id == dbUser.SessionsId);
            Assert.Null(deletedUserSessions);

            var deletedUserSettings = await _context.UserSettings.FirstOrDefaultAsync(s => s.Id == dbUser.SettingsId);
            Assert.Null(deletedUserSettings);

            foreach (var historyId in dbUser.HistoryIds)
            {
                var deletedTaskHistory = await _context.UserTaskHistories.FirstOrDefaultAsync(h => h.Id == historyId);
                Assert.Null(deletedTaskHistory);
            }

            foreach (var sessionId in userSessions.SessionIds)
            {
                var deletedSingleSession = await _context.UserSingleSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
                Assert.Null(deletedSingleSession);
            }
        }

        [Fact]
        public async Task UpdateProfilePicAsync_UserDoesNotExist_ReturnsNull()
        {
            // Arrange
            string email = "Nonexistent";
            byte[] profilePic = new byte[] { 1, 2, 3, 4 };

            // Act
            var result = await _userHandler.UpdateProfilePictureAsync(email, profilePic);

            // Assert
            Assert.Null(result);
        }
        [Fact]
        public async Task UpdateProfilePicAsync_UserExists_ReturnsUser()
        {
            // Arrange
            var email = "test@example.com";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow,
                HistoryIds = new string[] { "history1", "history2" }
            };
            byte[] profilePic = new byte[] { 1, 2, 3, 4 };
            
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
            var dbUserReturned = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            // Act
            var result = await _userHandler.UpdateProfilePictureAsync(email, profilePic);

            // Assert
            Assert.Equal(profilePic, result.ProfilePic);
        }

        [Fact]
        public async Task DeleteUserByEmailAsync_ShouldThrowException_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _userHandler.DeleteUserByEmailAsync(email));
            Assert.Equal("User not found", exception.Message);
        }

        [Fact]
        public async Task GetUserProfilePicByEmailAsync_ShouldReturnProfilePic_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var profilePic = new byte[] { 1, 2, 3, 4, 5 };
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow,
                ProfilePic = profilePic
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetUserProfilePicByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(profilePic, result);
        }

        [Fact]
        public async Task GetUserProfilePicByEmailAsync_ShouldReturnEmptyArray_WhenUserExistsButNoProfilePic()
        {
            // Arrange
            var email = "test@example.com";
            var dbUser = new DbUser
            {
                Name = "Test User",
                Email = email,
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString(),
                JoinedAt = DateTime.UtcNow,
                ProfilePic = null
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userHandler.GetUserProfilePicByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetUserProfilePicByEmailAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var email = "nonexistent@example.com";

            // Act
            var result = await _userHandler.GetUserProfilePicByEmailAsync(email);

            // Assert
            Assert.Null(result);
        }

    }
}