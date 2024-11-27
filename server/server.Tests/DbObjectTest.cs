using System;
using Xunit;
using server.UserNamespace;

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
    }
}