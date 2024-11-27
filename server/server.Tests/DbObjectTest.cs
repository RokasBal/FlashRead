using System;
using Xunit;
using server.UserNamespace;
using server.Exceptions;
namespace server.Tests
{
    public class DbObjectTest
    {
        [Fact]
        public void DbTask1Contribution_ShouldInitializeProperties()
        {
            // Arrange
            var dbTask1Contribution = new DbTask1Contribution();

            // Act
            dbTask1Contribution.Id = "testId";
            dbTask1Contribution.QuestionsId = 1;

            // Assert
            Assert.Equal("testId", dbTask1Contribution.Id);
            Assert.Equal(1, dbTask1Contribution.QuestionsId);
            Assert.Equal(DateTime.UtcNow.Date, dbTask1Contribution.TimeContributed.Date);
        }
        [Fact]
        public void DbLogs_ShouldInitializeProperties()
        {
            // Arrange
            var dbLogs = new DbLogs();

            // Act
            dbLogs.Id = "logId";
            dbLogs.LogMessage = "This is a log message";

            // Assert
            Assert.Equal("logId", dbLogs.Id);
            Assert.Equal("This is a log message", dbLogs.LogMessage);
            Assert.Equal(DateTime.UtcNow.Date, dbLogs.LogTime.Date);
        }
    }
}
