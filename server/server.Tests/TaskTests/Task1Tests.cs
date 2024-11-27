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
    public class Task1Tests : IDisposable {
        private readonly TaskController _controller;
        private readonly FlashDbContext _context;
        private readonly UserHandler _userHandler;
        private readonly SessionManager _sessionManager;
        private readonly TokenProvider _tokenProvider;
        private readonly HistoryManager _historyManager;
        private readonly DbContextFactory _dbContextFactory;

        public Task1Tests()
        {
            var options = new DbContextOptionsBuilder<FlashDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabaseccc")
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
        public void GetQuestionCountFromDifficulty_ReturnsDefault()
        {
            // Arrange
            int min = 2;
            int max = 10;
            int seed = 150;
            Random gen = new Random(seed);

            // Act
            int result = Task1.GetQuestionCountFromDifficulty(gen, Task1.Difficulty.Any);

            // Assert
            int expected = new Random(seed).Next(min, max + 1);
            Assert.Equal(result, expected);
        }
        [Fact]
        public void GetQuestionCountFromDifficulty_ReturnsEasy()
        {
            // Arrange
            int min = 2;
            int max = 3;
            int seed = 150;
            Random gen = new Random(seed);

            // Act
            int result = Task1.GetQuestionCountFromDifficulty(gen, Task1.Difficulty.Easy);

            // Assert
            int expected = new Random(seed).Next(min, max + 1);
            Assert.Equal(result, expected);
        }
            
        [Fact]
        public void GetQuestionCountFromDifficulty_ReturnsMedium()
        {
            // Arrange
            int min = 4;
            int max = 5;
            int seed = 150;
            Random gen = new Random(seed);

            // Act
            int result = Task1.GetQuestionCountFromDifficulty(gen, Task1.Difficulty.Medium);

            // Assert
            int expected = new Random(seed).Next(min, max + 1);
            Assert.Equal(result, expected);
        }
        [Fact]
        public void GetQuestionCountFromDifficulty_ReturnsHard()
        {
            // Arrange
            int min = 6;
            int max = 7;
            int seed = 150;
            Random gen = new Random(seed);

            // Act
            int result = Task1.GetQuestionCountFromDifficulty(gen, Task1.Difficulty.Hard);

            // Assert
            int expected = new Random(seed).Next(min, max + 1);
            Assert.Equal(result, expected);
        }
            
        [Fact]
        public void GetQuestionCountFromDifficulty_ReturnsExtreme()
        {
            // Arrange
            int min = 8;
            int max = 10;
            int seed = 150;
            Random gen = new Random(seed);

            // Act
            int result = Task1.GetQuestionCountFromDifficulty(gen, Task1.Difficulty.Extreme);

            // Assert
            int expected = new Random(seed).Next(min, max + 1);
            Assert.Equal(result, expected);
        }
        [Fact]
        async public void GenerateData_AnyThemeReturnsText()
        {
            // Arrange
            SetUserEmail("test@example.com");

            var taskText = new DbTask1Text { Id = 1, Theme = "anime", Text = "Sample Text" };
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

            uint session = ITask.GenerateSessionBase(1);

            // Act
            Task1 t1 = new Task1(_context);
            (string text, Task1.TaskQuestion[] questions) = t1.GenerateData(session, Task1.Theme.Any, Task1.Difficulty.Any, true, false);

            // Assert
            Assert.Equal("Sample Text", text);
            Assert.Equal(1, questions.Length);
        }
        async public void GenerateData_AnimeThemeReturnsText()
        {
            // Arrange
            SetUserEmail("test@example.com");

            var taskText = new DbTask1Text { Id = 1, Theme = "anime", Text = "Sample Text" };
            _context.Task1Texts.Add(taskText);
            var taskQuestion = new DbTask1Question
            {
                Id = 1,
                TextId = taskText.Id,
                Question = "Sample Question",
                Variants = new[] { "Option 1", "Option 2", "Option 3" },
                AnswerId = 1
            };
            _context.Task1Questions.Add(taskQuestion);
            taskQuestion = new DbTask1Question
            {
                Id = 2,
                TextId = taskText.Id,
                Question = "Sample Question 2",
                Variants = new[] { "Option 1", "Option 2", "Option 3" },
                AnswerId = 1
            };
            _context.Task1Questions.Add(taskQuestion);
            await _context.SaveChangesAsync();

            uint session = ITask.GenerateSessionBase(1);

            // Act
            Task1 t1 = new Task1(_context);
            (string text, Task1.TaskQuestion[] questions) = t1.GenerateData(session, Task1.Theme.Anime, Task1.Difficulty.Any, true, false);

            // Assert
            Assert.Equal("Sample Text", text);
            Assert.Equal(2, questions.Length);
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