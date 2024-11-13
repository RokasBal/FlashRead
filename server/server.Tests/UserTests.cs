using System;
using Xunit;
using server.UserNamespace;

namespace server.Tests {
    public class UserTests {
        public UserTests() {
        }
        [Fact]
        public void UserInitializationTest()
        {
            // Arrange
            var email = "test@example.com";
            var password = "password123";
            var name = "Test User";
            var score = 10;

            // Act
            var user = new User(email, password, name, score);

            // Assert
            Assert.Equal(email, user.Email);
            Assert.Equal(password, user.Password);
            Assert.Equal(name, user.Name);
            Assert.Equal(score, user.Score);
        }

        [Fact]
        public void UserComparisonTest()
        {
            // Arrange
            var user1 = new User("user1@example.com", "password1", "User One", 10);
            var user2 = new User("user2@example.com", "password2", "User Two", 20);

            // Act
            var comparisonResult = user1.CompareTo(user2);

            // Assert
            Assert.True(comparisonResult < 0);
        }
        [Fact]
        public void UserToDbUserConversionTest()
        {
            // Arrange
            var user = new User("test@example.com", "password123", "Test User", 10);

            // Act
            DbUser dbUser = (DbUser)user;

            // Assert
            Assert.Equal(user.Email, dbUser.Email);
            Assert.Equal(user.Password, dbUser.Password);
            Assert.Equal(user.Name, dbUser.Name);
        }
    }
}