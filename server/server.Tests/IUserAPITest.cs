using System;
using Xunit;
using server.UserNamespace;

namespace server.Tests {
    public class IUserAPITest {
        public IUserAPITest() {
        }
        [Fact]
        public void ConvertUserFromAPI_ShouldReturnUserWithCorrectProperties() {
            // Arrange
            var userFromAPI = new UserFromAPI("test@example.com", "password123", "testuser");

            // Act
            var user = IUserApi.convertUserFromAPI(userFromAPI);

            // Assert
            Assert.Equal("test@example.com", user.Email);
            Assert.Equal("password123", user.Password);
            Assert.Equal("testuser", user.Name);
        }
    }
}