using System;
using Xunit;
using server.UserNamespace;

namespace server.Tests {
    public class StringExtensionTest {
        public StringExtensionTest() {
        }
        
        [Fact]
        public void ToEnum_ReturnsDefaultValue_WhenStringIsNull() {
            // Arrange
            string? input = null;
            var defaultValue = DayOfWeek.Monday;

            // Act
            var result = input.ToEnum(defaultValue);

            // Assert
            Assert.Equal(defaultValue, result);
        }

    }
}