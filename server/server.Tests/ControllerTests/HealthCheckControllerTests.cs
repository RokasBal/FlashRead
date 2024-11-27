using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
    public class HealthCheckControllerTests : IDisposable {
        private readonly HealthCheckController _controller;
        private readonly FlashDbContext _context;
        private readonly Mock<SessionManager> _mockSessionManager;
        private readonly UserHandler _userHandler;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public HealthCheckControllerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabaseHealthCheck")
                .Options;
            _context = new FlashDbContext(options);

            var serviceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .AddDbContext<FlashDbContext>(options => options.UseInMemoryDatabase("TestDatabaseHealthCheck"))
                .BuildServiceProvider();

            var serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
            _dbContextFactory = new DbContextFactory(serviceScopeFactory);

            Environment.SetEnvironmentVariable("JWT_SECRET", "your_secret_key_your_secret_key_your_secret_key");
            var configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();
            _tokenProvider = new TokenProvider(configuration);
            _historyManager = new HistoryManager(_context);
            _mockSessionManager = new Mock<SessionManager>(_dbContextFactory);
            _userHandler = new UserHandler(_context, _tokenProvider, _historyManager, _mockSessionManager.Object);
            _controller = new HealthCheckController(_mockSessionManager.Object);
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
        public async Task StartHealthCheck_WithValidEmail_ReturnsOk() {
            // Arrange
            var email = "test@example.com";
            SetUserEmail(email);
            _mockSessionManager.Setup(sm => sm.UpdateSession(email)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.StartHealthCheck();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Health check passed", okResult.Value);
        }

        [Fact]
        public async Task StartHealthCheck_WithInvalidEmail_ReturnsUnauthorized() {
            // Arrange
            SetUserEmail(null);

            // Act
            var result = await _controller.StartHealthCheck();

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
        }

        [Fact] 
        public async Task StartHealthCheck_WithException_ReturnsInternalServerError() {
            // Arrange
            var email = "test@example.com";
            SetUserEmail(email);
            _mockSessionManager.Setup(sm => sm.UpdateSession(email)).Returns(Task.FromException(new Exception("Database error")));

            // Act
            var result = await _controller.StartHealthCheck();

            // Assert
            var internalServerErrorResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, internalServerErrorResult.StatusCode);
        }

        [Fact]
        public void GetConnectedUsers_ReturnsOkResult() {
            // Arrange
            var connectedUsers = new List<string> { "user1", "user2" };
            _mockSessionManager.Setup(sm => sm.GetConnectedUsers()).Returns(connectedUsers);

            // Act
            var result = _controller.Get();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(connectedUsers, okResult.Value);
        }

        [Fact]
        public async Task GetConnectedUsernames_ReturnsOkResult() {
            // Arrange
            var connectedUsernames = new List<string> { "username1", "username2" };
            _mockSessionManager.Setup(sm => sm.GetConnectedUsernames()).ReturnsAsync(connectedUsernames);

            // Act
            var result = await _controller.GetConnectedUsernames();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(connectedUsernames, okResult.Value);
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