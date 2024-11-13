using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using server.src;
using server.UserNamespace;
using server.Services;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace server.Tests {
    public class HistoryManagerTests : IDisposable {
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;
        private readonly Mock<TokenProvider> _mockTokenProvider;
        private readonly Mock<HistoryManager> _mockHistoryManager;
        private readonly Mock<SessionManager> _mockSessionManager;
        private readonly Mock<DbContextFactory> _mockDbContextFactory;
        private readonly UserHandler _mockUserHandler;

        public HistoryManagerTests() {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "History Manager Tests")
                .Options;
            _context = new FlashDbContext(options);

            var serviceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .AddDbContext<FlashDbContext>(options => options.UseInMemoryDatabase("TestDatabaseAuthentication"))
                .BuildServiceProvider();

            var serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
            _dbContextFactory = new DbContextFactory(serviceScopeFactory);

            var mockServiceScopeFactory = new Mock<IServiceScopeFactory>(MockBehavior.Strict);
            _mockDbContextFactory = new Mock<DbContextFactory>(MockBehavior.Strict, mockServiceScopeFactory.Object);
            
            Environment.SetEnvironmentVariable("JWT_SECRET", "your_secret_key_your_secret_key_your_secret_key");
            var configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();
            _tokenProvider = new TokenProvider(configuration);
            _historyManager = new HistoryManager(_context);
            _sessionManager = new SessionManager(_dbContextFactory);
            _userHandler = new UserHandler(_context, _tokenProvider, _historyManager, _sessionManager);
           
            _mockTokenProvider = new Mock<TokenProvider>(MockBehavior.Strict, new ConfigurationBuilder().Build());
            _mockHistoryManager = new Mock<HistoryManager>(_context);
            _mockSessionManager = new Mock<SessionManager>(_mockDbContextFactory.Object);
            _mockUserHandler = new UserHandler(_context, _mockTokenProvider.Object, _mockHistoryManager.Object, _mockSessionManager.Object);
        }

        public void Dispose() {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task SaveTaskResult_UserDoesNotExist_DoesNotSaveTaskResult() {
            // Arrange
            var email = "nonexistentuser@example.com";
            uint sessionId = 1;
            int taskId = 1;
            int score = 100;
            int[] selectedVariants = { 1, 2, 3 };

            // Act
            await _historyManager.SaveTaskResult(email, sessionId, taskId, score, selectedVariants);

            // Assert
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            Assert.Null(dbUser);
            var taskHistory = await _context.UserTaskHistories.FirstOrDefaultAsync(th => th.TaskId == taskId);
            Assert.Null(taskHistory);
        }

        [Fact]
        public async Task SaveTaskResult_UserExists_SavesTaskResult() {
            // Arrange
            var user = new DbUser {
                Name = "user.Name3",
                Email = "user.Email3",
                Password = "user.Password3",
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            uint sessionId = 1;
            int taskId = 1;
            int score = 100;
            int[] selectedVariants = { 1, 2, 3 };

            // Act
            await _historyManager.SaveTaskResult(user.Email, sessionId, taskId, score, selectedVariants);

            // Assert
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            Assert.NotNull(dbUser);
            var taskHistory = await _context.UserTaskHistories.FirstOrDefaultAsync(th => th.TaskId == taskId);
            Assert.NotNull(taskHistory);
            Assert.Equal(score, taskHistory.Score);
            Assert.Equal(selectedVariants, taskHistory.Answers);
        }
    }
}