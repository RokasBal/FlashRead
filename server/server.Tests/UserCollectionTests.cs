using System;
using Xunit;
using server.UserNamespace;

namespace server.Tests {
    public class UserCollectionTests {
        public UserCollectionTests() {
        }

        [Fact]
        public void AddUser_ShouldAddUserToCollection() {
            // Arrange
            var userCollection = new UserCollection();
            var user = new User("john.doe@example.com", "password123", "John Doe");

            // Act
            userCollection.Add(user);

            // Assert
            Assert.Contains(user, userCollection);
        }

        [Fact]
        public void Indexer_ShouldReturnUserAtIndex() {
            // Arrange
            var userCollection = new UserCollection();
            var user = new User("john.doe@example.com", "password123", "John Doe");
            userCollection.Add(user);

            // Act
            var result = userCollection[0];

            // Assert
            Assert.Equal(user, result);
        }

        [Fact]
        public void Indexer_ShouldThrowExceptionForInvalidIndex() {
            // Arrange
            var userCollection = new UserCollection();

            // Act & Assert
            Assert.Throws<IndexOutOfRangeException>(() => userCollection[0]);
        }

        [Fact]
        public void Sort_ShouldSortUsers() {
            // Arrange
            var userCollection = new UserCollection();
            var user1 = new User("jane.doe@example.com", "password123", "Jane Doe", 2);
            var user2 = new User("john.doe@example.com", "password123", "John Doe", 1);
            userCollection.Add(user1);
            userCollection.Add(user2);

            // Act
            userCollection.Sort();

            // Assert
            Assert.Equal(user2, userCollection[0]);
            Assert.Equal(user1, userCollection[1]);
        }
    }
}