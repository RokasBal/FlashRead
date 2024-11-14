using System;
using Xunit;
using server;

namespace server.Tests {
    public class ConnectionStringBuilderTests {
        public string configPath = "./secrets/config.json";
        public ConnectionStringBuilderTests() {
        }
        [Fact]
        public void BuildConnectionString_ShouldReturnValidConnectionString_WhenConfigIsValid() {
            // Arrange
            Environment.SetEnvironmentVariable("DB_PASSWORD", "testpassword");
            var configJson = @"
            {
                ""DB_HOST"": ""localhost"",
                ""DB_PORT"": ""5432"",
                ""DB_NAME"": ""testdb"",
                ""DB_USER"": ""testuser""
            }";
            File.WriteAllText("./secrets/config.json", configJson);

            // Act
            var result = ConnectionStringBuilder.BuildConnectionString(configPath);

            // Assert
            Assert.Equal("Host=localhost;Port=5432;Database=testdb;Username=testuser;Password=testpassword;", result);

            // Cleanup
            File.Delete("./secrets/config.json");
            Environment.SetEnvironmentVariable("DB_PASSWORD", null);
        }

        [Fact]
        public void BuildConnectionString_ShouldThrowFileNotFoundException_WhenConfigFileDoesNotExist() {
            // Arrange
            Environment.SetEnvironmentVariable("DB_PASSWORD", "testpassword");

            // Ensure the config file does not exist
            if (File.Exists("./secrets/config.json")) {
                File.Delete("./secrets/config.json");
            }

            // Act & Assert
            Assert.Throws<FileNotFoundException>(() => ConnectionStringBuilder.BuildConnectionString(""));
        }

        [Fact]
        public void BuildConnectionString_ShouldThrowInvalidOperationException_WhenPasswordIsNotSet() {
            // Arrange
            Environment.SetEnvironmentVariable("DB_PASSWORD", null);

            // Act & Assert
            Assert.Throws<InvalidOperationException>(() => ConnectionStringBuilder.BuildConnectionString(configPath));
        }

        [Fact]
        public void BuildConnectionString_ShouldThrowInvalidOperationException_WhenConfigIsIncomplete() {
            // Arrange
            Environment.SetEnvironmentVariable("DB_PASSWORD", "testpassword");
            var configJson = @"
            {
                ""DB_HOST"": ""localhost"",
                ""DB_PORT"": ""5432"",
                ""DB_NAME"": """",
                ""DB_USER"": ""testuser""
            }";
            File.WriteAllText("./secrets/config.json", configJson);

            // Act & Assert
            Assert.Throws<InvalidOperationException>(() => ConnectionStringBuilder.BuildConnectionString(configPath));

            // Cleanup
            File.Delete("./secrets/config.json");
            Environment.SetEnvironmentVariable("DB_PASSWORD", null);
        }
    }
}