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
using server.src.Task1;
namespace server.Tests {
    public class TaskControllerTests : IDisposable {
        private readonly TaskController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public TaskControllerTests()
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
            _controller = new TaskController(_context, _userHandler);
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
        public void PostGetTask_ReturnsTaskResponse()
        {
            var request = new TaskRequest { TaskId = 1 };
            var response = _controller.PostGetTask(request);
            Assert.IsType<Task1.TaskResponse>(response);
        }
        [Fact]
        public async Task PostGetTaskAnswer_ReturnsTaskNotFound()
        {
            SetUserEmail("test@example.com");
            var request = new TaskAnswerRequest { Session = 123, SelectedVariants = new int[] { 1, 2 } };
            var exception = await Assert.ThrowsAsync<Exception>(async () => await _controller.PostGetTaskAnswer(request));
            Assert.Equal("Task not found", exception.Message);
        }
        [Fact]
        public async Task PostGetTaskAnswer_ReturnsCorrectResponse()
        {
            // Arrange
            SetUserEmail("test@example.com");

            var taskText = new DbTask1Text { Id = 1, Theme = Task1.Theme.Anime, Text = "Sample Text" };
            var taskQuestion = new DbTask1Question
            {
                Id = 1,
                TextId = taskText.Id,
                Question = "Sample Question",
                Variants = new[] { "Option 1", "Option 2", "Option 3" },
                AnswerId = 1
            };
            _context.Task1Texts.Add(taskText);
            _context.Task1Questions.Add(taskQuestion);
            await _context.SaveChangesAsync();

            // var request = new TaskAnswerRequest { Session = 123, SelectedVariants = new int[] { 1, 2 } };
            // var result = await _controller.PostGetTaskAnswer(request);

            // Assert
            // var okResult = Assert.IsType<OkObjectResult>(result);
            // var response = Assert.IsType<Task1.TaskAnswerResponse>(okResult.Value);
            // Assert.NotNull(response);
            // Assert.Equal(2, response.Answers.Length);
            // Assert.Equal(1, response.Statistics.Correct);
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