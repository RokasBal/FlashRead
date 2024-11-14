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

namespace server.Tests {
    public class AuthControllerTests : IDisposable {
        private readonly AuthController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public AuthControllerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabaseAuthentication")
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
            _controller = new AuthController(_userHandler);
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
        public async Task PostLogin_ValidUser_ReturnsOkResult()
        {
            // Arrange
            var userAPI = new UserFromAPI("test@example.com", "Password123", null);
            var user = IUserApi.convertUserFromAPI(userAPI);
            user.Password = _userHandler.HashPassword(user.Password);
            var dbUser = new DbUser
            {
                Name = "John Doe",
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            SetUserEmail(user.Email);
            // Act
            var result = await _controller.PostLogin(userAPI);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
        }
        [Fact]
        public async Task PostLogin_InvalidUser_ReturnsUnauthorizedResult()
        {
            // Arrange
            var userAPI = new UserFromAPI("test@example.com", "Password123", null);
            var user = IUserApi.convertUserFromAPI(userAPI);
            user.Password = _userHandler.HashPassword("WrongPassword");
            var dbUser = new DbUser
            {
                Name = "John Doe",
                Email = user.Email,
                Password = user.Password,
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString()  // Set to a valid value
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            SetUserEmail(user.Email);

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(async () => await _controller.PostLogin(userAPI));
            Assert.Equal("Invalid password", exception.Message);
        }
        [Fact]
        public async Task PostLogin_InvalidModel_ReturnsBadRequestResult()
        {
            // Arrange
            var userAPI = new UserFromAPI(null, null, null);
            _controller.ModelState.AddModelError("Email", "Required");
            _controller.ModelState.AddModelError("Password", "Required");

            // Act
            var result = await _controller.PostLogin(userAPI);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        }
        [Fact]
        public async Task PostUser_ValidUser_ReturnsOkResult()
        {
            // Arrange
            var userAPI = new UserFromAPI("test2@example.com", "Password123", "John Doe");

            // Act
            var result = await _controller.PostUser(userAPI);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
        }
        [Fact]
        public async Task PostUser_InvalidModel_ReturnsBadRequestResult()
        {
            // Arrange
            var userAPI = new UserFromAPI(null, null, null);
            _controller.ModelState.AddModelError("Email", "Required");
            _controller.ModelState.AddModelError("Password", "Required");
            _controller.ModelState.AddModelError("Name", "Required");

            // Act
            var result = await _controller.PostUser(userAPI);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        }
        [Fact]
        public async Task PostUser_UserExists_ReturnsStatusCode()
        {
            // Arrange
            var userAPI = new UserFromAPI("test2@example.com", "Password123", "John Doe");

            // Act
            var result = await _controller.PostUser(userAPI);
            var result2 = await _controller.PostUser(userAPI);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(result2);
            Assert.Equal(500, statusCodeResult.StatusCode);
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