using System;
using Xunit;
using server.UserNamespace;

namespace server.Tests {
    public class DbUserMethodTest {
        public DbUserMethodTest() {
        }
        [Fact]
        public void ExplicitOperator_ConvertsDbUserToUser() {
            // Arrange
            var dbUser = new DbUser {
                Email = "test@example.com",
                Password = "password123",
                Name = "Test User"
            };

            // Act
            User user = (User)dbUser;

            // Assert
            Assert.Equal(dbUser.Email, user.Email);
            Assert.Equal(dbUser.Password, user.Password);
            Assert.Equal(dbUser.Name, user.Name);
        }
    }
}