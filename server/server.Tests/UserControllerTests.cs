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

        private void SetUserEmail(string email) {
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