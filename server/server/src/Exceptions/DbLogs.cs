namespace server.Exceptions;

public class DbLogs {
    public string Id { get; set; } = null!;
    public string LogMessage { get; set; } = null!;
    public DateTime LogTime { get; set; } = DateTime.UtcNow;
}