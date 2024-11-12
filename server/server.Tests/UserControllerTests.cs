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
using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace server.Tests {
    public class UserControllerTests : IDisposable {
        private readonly UserDataController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public UserControllerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
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
            _controller = new UserDataController(_userHandler);
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
        public async Task GetAllUsers_ValidRequest_ReturnsUsersWithoutPasswords()
        {
            // Arrange
            var users = new List<User>
            {
                new User("john.doe@example.com", "password123", "John Doe"),
                new User("jane.doe@example.com", "password123", "Jane Doe")
            };

            var hashedUsers = users.Select(user => {
                user.Password = _userHandler.HashPassword(user.Password);
                return user;
            }).ToList();

            foreach (var user in hashedUsers)
            {
                var dbUser = new DbUser
                {
                    Name = user.Name,
                    Email = user.Email,
                    Password = user.Password,
                    SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                    SettingsId = Guid.NewGuid().ToString()  // Set to a valid value
                };
                _context.Users.Add(dbUser);
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedUsers = Assert.IsAssignableFrom<IEnumerable<UserDTO>>(okResult.Value);
            Assert.Equal(users.Count, returnedUsers.Count());
            foreach (var returnedUser in returnedUsers)
            {
                Assert.NotNull(returnedUser.Name);
                Assert.NotNull(returnedUser.Email);
            }
        }

        [Fact]
        public async Task GetAllUsers_EmptyDatabase_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedUsers = Assert.IsAssignableFrom<IEnumerable<UserDTO>>(okResult.Value);
            Assert.Empty(returnedUsers);
        }
        [Fact]
        public async Task GetUser_ValidToken_ReturnsUser()
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
            var result = await _controller.GetUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedUser = Assert.IsType<UserDTO>(okResult.Value);
            Assert.Equal(user.Email, returnedUser.Email);
            Assert.Equal(user.Name, returnedUser.Name);
        }

        [Fact]
        public async Task GetUser_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            // Act
            var result = await _controller.GetUser();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task GetUser_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            SetUserEmail("nonexistent@example.com");

            // Act
            var result = await _controller.GetUser();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found.", notFoundResult.Value);
        }
        [Fact]
        public async Task GetUserDetails_ValidEmail_ReturnsUserDetails()
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
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserDetails(user.Email);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedUser = Assert.IsType<UserDetailsDTO>(okResult.Value);
            Assert.Equal(user.Email, returnedUser.Email);
            Assert.Equal(user.Name, returnedUser.Name);
            Assert.NotNull(returnedUser.JoinedAt);
        }

        [Fact]
        public async Task GetUserDetails_InvalidEmail_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetUserDetails("nonexistent@example.com");

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found.", notFoundResult.Value);
        }
        [Fact]
        public async Task GetProfilePicture_ValidToken_ReturnsProfilePicture()
        {
            // Arrange
            var dbUser = new DbUser
            {
                Name = "John Doe",
                Email = "johndoe@example.com",
                Password = _userHandler.HashPassword("password123"),
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                ProfilePic = new byte[] { 1, 2, 3, 4 }
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            SetUserEmail(dbUser.Email);

            // Act
            var result = await _controller.GetProfilePicture();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("image/jpeg", fileResult.ContentType);
            Assert.Equal("profile.jpg", fileResult.FileDownloadName);
            Assert.Equal(dbUser.ProfilePic, fileResult.FileContents);
        }
        [Fact]
        public async Task GetProfilePicture_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            // Act
            var result = await _controller.GetProfilePicture();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task GetProfilePicture_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            SetUserEmail("nonexistent@example.com");

            // Act
            var result = await _controller.GetProfilePicture();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found.", notFoundResult.Value);
        }
        [Fact]
        public async Task GetProfilePicture_NoProfilePic_ReturnsDefaultPicture()
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
            var result = await _controller.GetProfilePicture();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("image/jpeg", fileResult.ContentType);
            Assert.Equal("defaultPicture.jpg", fileResult.FileDownloadName);
        }
        [Fact]
        public async Task UpdateProfilePicture_ValidToken_UpdatesProfilePicture()
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

            var profilePicture = new FormFile(new MemoryStream(new byte[] { 1, 2, 3, 4 }), 0, 4, "profilePicture", "profile.jpg");

            // Act
            var result = await _controller.UpdateProfilePicture(profilePicture);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Profile picture updated successfully.", okResult.Value);

            var updatedUser = await _context.Users.FindAsync(user.Email);
            Assert.NotNull(updatedUser);
            Assert.Equal(new byte[] { 1, 2, 3, 4 }, updatedUser.ProfilePic);
        }
        [Fact]
        public async Task UpdateProfilePicture_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            // Act
            var result = await _controller.UpdateProfilePicture(null);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task UpdateProfilePicture_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            SetUserEmail("nonexistent@example.com");

            // Act
            var result = await _controller.UpdateProfilePicture(null);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        }
        [Fact]
        public async Task GetUserHistory_ValidToken_ReturnsUserHistory()
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

            var history = new List<DbTaskHistory>
            {
                new DbTaskHistory(),
                new DbTaskHistory(),
                new DbTaskHistory()
            };
            foreach (var task in history)
            {
                task.Id = Guid.NewGuid().ToString();
                task.SessionId = 1; // Set to a valid value
                task.TaskId = 1; // Set to a valid value
                task.Answers = new int[] { 1, 2, 3 }; // Set to a valid value
                task.Score = 100; // Set to a valid value
                task.TimePlayed = DateTime.UtcNow;
            }
            foreach (var task in history)
            {
                _context.UserTaskHistories.Add(task);
                _context.Users.Find(dbUser.Email)!.HistoryIds = _context.Users.Find(dbUser.Email)!.HistoryIds.Append(task.Id).ToArray();
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserHistory();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedHistory = Assert.IsAssignableFrom<IEnumerable<DbTaskHistory>>(okResult.Value);
            Assert.Equal(history.Count, returnedHistory.Count());
        }
        [Fact]
        public async Task GetUserHistory_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            // Act
            var result = await _controller.GetUserHistory();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task GetUserHistory_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            SetUserEmail("nonexistent@example.com");

            // Act
            var result = await _controller.GetUserHistory();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found.", notFoundResult.Value);
        }
        [Fact]
        public async Task ChangeUserPassword_ValidToken_ChangesPassword()
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

            var request = new ChangePasswordRequest { OldPassword = "password123", NewPassword = "newpassword123" };

            // Act
            var result = await _controller.ChangeUserPassword(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Password changed.", okResult.Value);

            var updatedUser = await _context.Users.FindAsync(user.Email);
            Assert.NotNull(updatedUser);
            Assert.True(_userHandler.VerifyPassword("newpassword123", updatedUser.Password));
        }
        [Fact]
        public async Task ChangeUserPassword_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            var request = new ChangePasswordRequest { OldPassword = "password123", NewPassword = "newpassword123" };

            // Act
            var result = await _controller.ChangeUserPassword(request);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task ChangeUserPassword_InvalidOldPassword_ReturnsUnauthorized()
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

            var request = new ChangePasswordRequest { OldPassword = "wrongpassword", NewPassword = "newpassword123" };

            // Act
            var result = await _controller.ChangeUserPassword(request);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid password.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task ChangeUserPassword_EmptyNewPassword_ReturnsBadRequest()
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

            var request = new ChangePasswordRequest { OldPassword = "password123", NewPassword = "" };

            // Act
            var result = await _controller.ChangeUserPassword(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("New password cannot be null or empty.", badRequestResult.Value);
        }
        [Fact]
        public async Task ChangeUserName_ValidToken_ChangesUserName()
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

            var request = new ChangeUserNameRequest { NewName = "Johnathan Doe" };

            // Act
            var result = await _controller.ChangeUserName(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Name changed.", okResult.Value);

            var updatedUser = await _context.Users.FindAsync(user.Email);
            Assert.NotNull(updatedUser);
            Assert.Equal("Johnathan Doe", updatedUser.Name);
        }
        [Fact]
        public async Task ChangeUserName_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            var request = new ChangeUserNameRequest { NewName = "Johnathan Doe" };

            // Act
            var result = await _controller.ChangeUserName(request);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task ChangeUserName_EmptyNewName_ReturnsBadRequest()
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

            var request = new ChangeUserNameRequest { NewName = "" };

            // Act
            var result = await _controller.ChangeUserName(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("New name cannot be null or empty.", badRequestResult.Value);
        }
        [Fact]
        public async Task DeleteUser_ValidToken_DeletesUser()
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
            var result = await _controller.DeleteUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("User deleted.", okResult.Value);

            var deletedUser = await _context.Users.FindAsync(user.Email);
            Assert.Null(deletedUser);
        }
        [Fact]
        public async Task DeleteUser_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            SetUserEmail(null);

            // Act
            var result = await _controller.DeleteUser();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }
        [Fact]
        public async Task GetTotalScoreLeaderBoard_ValidRequest_ReturnsLeaderboard()
        {
            // Arrange
            var users = new List<User>
            {
                new User("john.doe@example.com", "password123", "John Doe"),
                new User("jane.doe@example.com", "password123", "Jane Doe")
            };

            foreach (var user in users)
            {
                var dbUser = new DbUser
                {
                    Name = _userHandler.HashPassword(user.Password),
                    Email = user.Email,
                    Password = user.Password,
                    SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                    SettingsId = Guid.NewGuid().ToString()  // Set to a valid value
                };
                _context.Users.Add(dbUser);
            }
            await _context.SaveChangesAsync();

            foreach (var user in users)
            {
                var history = new List<DbTaskHistory>
                {
                    new DbTaskHistory { Id = Guid.NewGuid().ToString(), SessionId = 1, TaskId = 1, Answers = new int[] { 1, 2, 3 }, Score = 100, TimePlayed = DateTime.UtcNow },
                    new DbTaskHistory { Id = Guid.NewGuid().ToString(), SessionId = 1, TaskId = 1, Answers = new int[] { 1, 2, 3 }, Score = 200, TimePlayed = DateTime.UtcNow }
                };
                foreach (var task in history)
                {
                    _context.UserTaskHistories.Add(task);
                    _context.Users.Find(user.Email)!.HistoryIds = _context.Users.Find(user.Email)!.HistoryIds.Append(task.Id).ToArray();
                }
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetTotalScoreLeaderBoard(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<UserScore>>(okResult.Value);
            Assert.Equal(2, returnedLeaderboard.Count());
            Assert.Equal(300, returnedLeaderboard.First().Score);
        }
        [Fact]
        public async Task GetTotalScoreLeaderBoard_EmptyDatabase_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.GetTotalScoreLeaderBoard(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<UserScore>>(okResult.Value);
            Assert.Empty(returnedLeaderboard);
        }
        [Fact]
        public async Task GetTotalScoreLeaderBoard_InvalidPage_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.GetTotalScoreLeaderBoard(0);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid page number.", badRequestResult.Value);
        }

        [Fact]
        public async Task GetHighScoreLeaderBoard_ValidRequest_ReturnsLeaderboard()
        {
            // Arrange
            var users = new List<User>
            {
                new User("john.doe@example.com", "password123", "John Doe"),
                new User("jane.doe@example.com", "password123", "Jane Doe")
            };

            foreach (var user in users)
            {
                var dbUser = new DbUser
                {
                    Name = _userHandler.HashPassword(user.Password),
                    Email = user.Email,
                    Password = user.Password,
                    SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                    SettingsId = Guid.NewGuid().ToString()  // Set to a valid value
                };
                _context.Users.Add(dbUser);
            }
            await _context.SaveChangesAsync();

            foreach (var user in users)
            {
                var history = new List<DbTaskHistory>
                {
                    new DbTaskHistory { Id = Guid.NewGuid().ToString(), SessionId = 1, TaskId = 1, Answers = new int[] { 1, 2, 3 }, Score = 100, TimePlayed = DateTime.UtcNow },
                    new DbTaskHistory { Id = Guid.NewGuid().ToString(), SessionId = 1, TaskId = 1, Answers = new int[] { 1, 2, 3 }, Score = 200, TimePlayed = DateTime.UtcNow }
                };
                foreach (var task in history)
                {
                    _context.UserTaskHistories.Add(task);
                    _context.Users.Find(user.Email)!.HistoryIds = _context.Users.Find(user.Email)!.HistoryIds.Append(task.Id).ToArray();
                }
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetHighScoreLeaderBoard(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<UserScore>>(okResult.Value);
            Assert.Equal(2, returnedLeaderboard.Count());
            Assert.Equal(200, returnedLeaderboard.First().Score);
        }
        [Fact]
        public async Task GetHighScoreLeaderBoard_EmptyDatabase_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.GetHighScoreLeaderBoard(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<UserScore>>(okResult.Value);
            Assert.Empty(returnedLeaderboard);
        }
        [Fact]
        public async Task GetHighScoreLeaderBoard_InvalidPage_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.GetHighScoreLeaderBoard(0);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid page number.", badRequestResult.Value);
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