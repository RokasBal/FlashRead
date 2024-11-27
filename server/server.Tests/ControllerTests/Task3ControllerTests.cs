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
using server.src.Task3;
namespace server.Tests {
    public class Task3ControllerTests : IDisposable {
        private readonly Task3Controller _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public Task3ControllerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabasebbb")
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
            _controller = new Task3Controller(_context, _userHandler);
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
        public void PostGetTask_ReturnsDoorCodeTaskResponse()
        {
            Task3DoorCodeRequest requestData = new Task3DoorCodeRequest(){Code = "123"};
            var request = new Task3EndpointHandler<Task3DoorCodeRequest>() { Data = requestData, TaskVersion = 1 };
            var response = _controller.PostGetTask(request);

            Assert.Equal(response.Data.IsCorrect, false);
        }
        [Fact]
        public void PostGetTask_ReturnsBookHintTaskResponse()
        {
            Task3BookHintRequest requestData = new Task3BookHintRequest(){Count = 2};
            var request = new Task3EndpointHandler<Task3BookHintRequest>() { Data = requestData, TaskVersion = 1 };
            var response = _controller.PostGetTask(request);

            Assert.Equal(response.Data.Hints.Length, 2);
        }
        [Fact]
        public async Task PostSaveTask3TimeTaken_UserNotFound()
        {
            // Arrange
            SetUserEmail(null);

            var ans = _controller.PostSaveTask3TimeTaken(50);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(ans.Result);
            Assert.Equal("failure", notFoundResult.Value);
        }
        [Fact]
        public async Task PostSaveTask3TimeTaken_SavesScore()
        {
            // Arrange
            SetUserEmail("test@example.com");

            var ans = _controller.PostSaveTask3TimeTaken(50);
            var OkResult = Assert.IsType<OkObjectResult>(ans.Result);
            Assert.Equal("success", OkResult.Value);
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