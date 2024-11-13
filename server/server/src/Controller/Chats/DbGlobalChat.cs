namespace server.UserNamespace {
    public class DbGlobalChat {
        public int ChatIndex { get; set; } = 1;
        public string ChatText { get; set; } = null!;
        public string Author { get; set; } = null!;
        public DateTime WrittenAt { get; set; } = DateTime.UtcNow;
    }
}