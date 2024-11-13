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
    public class ChatControllerTests : IDisposable {
        private readonly ChatController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public ChatControllerTests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabaseChatController")
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
            _controller = new ChatController(_context, _userHandler);
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
        public async Task GetGlobalChats_ReturnsLast100Chats()
        {
            // Arrange
            for (int i = 0; i < 150; i++)
            {
            _context.GlobalChats.Add(new DbGlobalChat
            {
                ChatIndex = i + 1,
                ChatText = $"Chat {i + 1}",
                Author = "test@example.com",
                WrittenAt = DateTime.UtcNow
            });
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetGlobalChats();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var chats = Assert.IsType<List<Chat>>(okResult.Value);
            Assert.Equal(100, chats.Count);
            Assert.Equal("Chat 150", chats.First().ChatText);
        }

        [Fact]
        public async Task SendGlobalChat_ValidUser_ReturnsOkResult()
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
                SessionsId = Guid.NewGuid().ToString(),
                SettingsId = Guid.NewGuid().ToString()
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();

            SetUserEmail(user.Email);

            var chat = new incomingChat("Hello, world!");

            // Act
            var result = await _controller.SendGlobalChat(chat);

            // Assert
            var okResult = Assert.IsType<OkResult>(result);
            var savedChat = await _context.GlobalChats.FirstOrDefaultAsync(c => c.ChatText == "Hello, world!");
            Assert.NotNull(savedChat);
            Assert.Equal(user.Email, savedChat.Author);
        }

        [Fact]
        public async Task SendGlobalChat_InvalidUser_ReturnsUnauthorizedResult()
        {
            // Arrange
            var chat = new incomingChat("Hello, world!");

            // Act
            var result = await _controller.SendGlobalChat(chat);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid token.", unauthorizedResult.Value);
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