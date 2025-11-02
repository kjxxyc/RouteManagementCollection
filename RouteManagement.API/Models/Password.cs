namespace RouteManagement.API.Models;

public class Password
{
    public int Id { get; set; }
    public int RouteId { get; set; }
    public string PasswordValue { get; set; } = string.Empty;
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
    public int CapturedBy { get; set; }
}
