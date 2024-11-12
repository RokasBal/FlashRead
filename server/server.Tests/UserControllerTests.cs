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
    public class UserControllerTests {
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
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Email, email)
            }, "mock"));
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
                    SessionsId = Guid.NewGuid().ToString(),
                    SettingsId = Guid.NewGuid().ToString()
                };
                _context.Users.Add(dbUser);
            }
            await _context.SaveChangesAsync();

            SetUserEmail("admin@example.com");

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
// namespace server.Tests
// {
//     public class UserHandlerTests
//     {
//         private readonly FlashDbContext _context;
//         private readonly UserHandler _userHandler;

//         public UserHandlerTests()
//         {
//             var options = new DbContextOptionsBuilder<FlashDbContext>()
//                 .UseInMemoryDatabase(databaseName: "TestDatabase")
//                 .Options;
//             _context = new FlashDbContext(options);
//             _userHandler = new UserHandler(_context);
//         }

//         [Fact]
//         public async Task RegisterUserAsync_ValidUser_ReturnsTrue()
//         {
//             // Arrange
//             var user = new User("john.doe@example.com", "password123", "John Doe");

//             // Act
//             var result = await _userHandler.RegisterUserAsync(user);

//             // Assert
//             Assert.True(result);
//             var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
//             Assert.NotNull(dbUser);
//         }

//         [Fact]
//         public async Task RegisterUserAsync_SaveChangesFails_ReturnsFalse()
//         {
//             // Arrange
//             var user = new User("john.doe@example.com", "password123", "John Doe");

//             // Use a derived context class to simulate failure
//             var options = new DbContextOptionsBuilder<FlashDbContext>()
//                 .UseInMemoryDatabase(databaseName: "TestDatabase")
//                 .Options;
//             var failingContext = new FailingFlashDbContext(options);
//             var userHandlerWithFailingContext = new UserHandler(failingContext);

//             // Act
//             var result = await userHandlerWithFailingContext.RegisterUserAsync(user);

//             // Assert
//             Assert.False(result);
//         }

//         [Fact]
//         public async Task RegisterUserAsync_UserAlreadyExists_ReturnsFalse()
//         {
//             // Arrange
//             var user = new User("john.doe.repeating@example.com", "password123", "John Doe Repeating");
//             user.Password = _userHandler.HashPassword(user.Password);
//             var dbUser = new DbUser
//             {
//                 Name = user.Name,
//                 Email = user.Email,
//                 Password = user.Password
//             };
//             _context.Users.Add(dbUser);
//             await _context.SaveChangesAsync();

//             // Act
//             var result = await _userHandler.RegisterUserAsync(user);

//             // Assert
//             Assert.False(result);
//         }

//         [Fact]
//         public void HashPassword_ValidPassword_ReturnsHashedPassword()
//         {
//             // Arrange
//             var password = "password123";

//             // Act
//             var hashedPassword = _userHandler.HashPassword(password);

//             // Assert
//             Assert.NotNull(hashedPassword);
//             Assert.NotEqual(password, hashedPassword);
//         }

//         [Fact]
//         public void VerifyPassword_ValidPassword_ReturnsTrue()
//         {
//             // Arrange
//             var password = "password123";
//             var hashedPassword = _userHandler.HashPassword(password);

//             // Act
//             var result = _userHandler.VerifyPassword(password, hashedPassword);

//             // Assert
//             Assert.True(result);
//         }

//         [Fact]
//         public void VerifyPassword_InvalidPassword_ReturnsFalse()
//         {
//             // Arrange
//             var password = "password123";
//             var hashedPassword = _userHandler.HashPassword(password);

//             // Act
//             var result = _userHandler.VerifyPassword("wrongpassword", hashedPassword);

//             // Assert
//             Assert.False(result);
//         }
//         [Fact]
//         public async Task LoginUserAsync_UserDoesNotExist_ReturnsFalse()
//         {
//             // Arrange
//             var user = new User("john.doe.doesnt_exist@example.com", "password123");

//             // Act
//             var result = await _userHandler.LoginUserAsync(user);

//             // Assert
//             Assert.False(result);
//         }
//         [Fact]
//         public async Task LoginUserAsync_UserExists_CorrectPassword_ReturnsTrue()
//         {
           
//             // Arrange
//             var user = new User("john.doe.login.true@example.com", "password123", "John Doe Login");
            
//             user.Password = _userHandler.HashPassword(user.Password);
//             var dbUser = new DbUser
//             {
//                 Name = user.Name,
//                 Email = user.Email,
//                 Password = user.Password
//             };
//             _context.Users.Add(dbUser);
//             await _context.SaveChangesAsync();

//             user = new User("john.doe.login.true@example.com", "password123");

//             // Act
//             var result = await _userHandler.LoginUserAsync(user);

//             // Assert
//             Assert.True(result);
//         }
//         [Fact]
//         public async Task LoginUserAsync_UserExists_IncorrectPassword_ReturnsFalse()
//         {
           
//             // Arrange
//             var user = new User("john.doe.login.false@example.com", "password123", "John Doe Login");
            
//             user.Password = _userHandler.HashPassword(user.Password);
//             var dbUser = new DbUser
//             {
//                 Name = user.Name,
//                 Email = user.Email,
//                 Password = user.Password
//             };
//             _context.Users.Add(dbUser);
//             await _context.SaveChangesAsync();

//             user = new User("john.doe.login.false@example.com", "password1234");

//             // Act

//             var result = await _userHandler.LoginUserAsync(user);

//             // Assert

//             Assert.False(result);
//         }
//         [Fact]
//         public async Task DeleteUserAsync_UserDoesNotExist_ReturnsFalse()
//         {
//             // Arrange
//             var user = new User("nonexist@example.com", "password123");

//             // Act
//             var result = await _userHandler.DeleteUserAsync(user);

//             // Assert
//             Assert.False(result);
//         }
//         [Fact]
//         public async Task DeleteUserAsync_UserExists_ReturnsTrue()
//         {
//             // Arrange
//             var user = new User("exist@example.com", "password123", "John Doe");
//             user.Password = _userHandler.HashPassword(user.Password);
//             var dbUser = new DbUser
//             {
//                 Name = user.Name,
//                 Email = user.Email,
//                 Password = user.Password
//             };
//             _context.Users.Add(dbUser);
//             await _context.SaveChangesAsync();

//             // Act
//             var result = await _userHandler.DeleteUserAsync(user);

//             // Assert
//             Assert.True(result);
//         }

//     }
    
//     // Derived context class to simulate failure
//     public class FailingFlashDbContext : FlashDbContext
//     {
//         public FailingFlashDbContext(DbContextOptions<FlashDbContext> options)
//             : base(options)
//         {
//         }
    
//         public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
//         {
//             throw new Exception("Database error");
//         }
//     }
// }