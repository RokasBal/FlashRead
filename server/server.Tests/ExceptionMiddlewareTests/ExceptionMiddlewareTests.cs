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
using server.Exceptions;
using Microsoft.Extensions.Logging;

namespace server.Tests {
    public class ExceptionMiddlewareTests : IDisposable {
        private readonly UserDataController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;
        private readonly ExceptionMiddleware _middleware;
        private readonly Mock<ILogger<ExceptionMiddleware>> _logger = new Mock<ILogger<ExceptionMiddleware>>();
        public ExceptionMiddlewareTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabaseExceptionMiddleware")
                .Options;
            _context = new FlashDbContext(options);

            var serviceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .AddDbContext<FlashDbContext>(options => options.UseInMemoryDatabase("TestDatabaseExceptionMiddleware"))
                .BuildServiceProvider();

            var serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
            _dbContextFactory = new DbContextFactory(serviceScopeFactory);

            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
            _tokenProvider = new TokenProvider(configuration);
            _historyManager = new HistoryManager(_context);
            _sessionManager = new SessionManager(_dbContextFactory);
            _userHandler = new UserHandler(_context, _tokenProvider, _historyManager, _sessionManager);
            _controller = new UserDataController(_userHandler);
            _middleware = new ExceptionMiddleware((innerHttpContext) => Task.CompletedTask, _logger.Object, _dbContextFactory);
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
        public void Constructor_ShouldInitializeProperties()
        {
            Assert.NotNull(_middleware);
        }

        [Fact]
        public async Task InvokeAsync_ShouldHandleExceptionAndLogError()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var middleware = new ExceptionMiddleware((innerHttpContext) => throw new Exception("Test exception"), _logger.Object, _dbContextFactory);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            _logger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("An unhandled exception has occurred.")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
            Times.Once);
        }
        [Fact]
        public async Task InvokeAsync_ShouldHandleNotFoundExceptionAndLogError()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var middleware = new ExceptionMiddleware((innerHttpContext) => throw new NotFoundException("Test exception"), _logger.Object, _dbContextFactory);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            _logger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("An unhandled exception has occurred.")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
            Times.Once);
        }
        [Fact]
        public async Task InvokeAsync_ShouldHandleUnauthorizedExceptionAndLogError()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var middleware = new ExceptionMiddleware((innerHttpContext) => throw new UnauthorizedException("Test exception"), _logger.Object, _dbContextFactory);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            _logger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("An unhandled exception has occurred.")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
            Times.Once);
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