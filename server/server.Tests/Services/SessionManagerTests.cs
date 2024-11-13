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
    public class SessionManagerTests : IDisposable {
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

        public SessionManagerTests() {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "SessionManagerTests")
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
        public async Task CreateSessionsTable_UserDoesNotExist_DoesNotCreateSession() {
            // Arrange
            var email = "nonexistentuser@example.com";

            // Act
            await _sessionManager.CreateSessionsTable(email);

            // Assert
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            Assert.Null(user);
            var session = user != null ? await _context.UserSessions.FirstOrDefaultAsync(s => s.Id == user.SessionsId) : null;
            Assert.Null(session);
        }

        [Fact]
        public async Task CreateSessionsTable_UserExists_CreatesSession() {
            // Arrange
            var user = new DbUser {
                Name = "user.Name",
                Email = "user.Email",
                Password = "user.Password",
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            _mockSessionManager.Setup(sm => sm.CreateSessionsTable(It.IsAny<string>())).Returns(Task.CompletedTask);

            // Act
            await _sessionManager.CreateSessionsTable(user.Email);
            await _context.SaveChangesAsync();
            
            // Assert
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        }

        [Fact]
        public async Task SaveUserSession_UserDoesNotExist_DoesNotSaveSession() {
            // Arrange
            var email = "nonexistentuser@example.com";
            var session = new SessionManager.UserSession { SessionStart = DateTime.UtcNow, LatestTimeAlive = DateTime.UtcNow };

            // Act
            await _sessionManager.SaveUserSession(email, session);

            // Assert
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            Assert.Null(dbUser);
        }

        [Fact]
        public async Task SaveUserSession_UserExists_SavesSession() {
            // Arrange
            var user = new DbUser {
                Name = "user.Name2",
                Email = "user.Email2",
                Password = "user.Password2",
                SessionsId = Guid.NewGuid().ToString(), // Set to a valid value
                SettingsId = Guid.NewGuid().ToString(),  // Set to a valid value
                JoinedAt = DateTime.UtcNow
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var session = new SessionManager.UserSession { SessionStart = DateTime.UtcNow, LatestTimeAlive = DateTime.UtcNow };

            // Act
            await _sessionManager.CreateSessionsTable(user.Email);
            await _sessionManager.SaveUserSession(user.Email, session);

            // Assert
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            Assert.NotNull(dbUser);
        }

        public class FailingFlashDbContext : FlashDbContext {
            public FailingFlashDbContext(DbContextOptions<FlashDbContext> options)
                : base(options) {
            }

            public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) {
                throw new Exception("Database error");
            }
        }
    }
}