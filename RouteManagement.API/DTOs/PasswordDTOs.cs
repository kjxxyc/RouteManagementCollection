namespace RouteManagement.API.DTOs;

public class PasswordDto
{
    public int Id { get; set; }
    public int RouteId { get; set; }
    public DateTime CapturedAt { get; set; }
}

public class CapturePasswordRequest
{
    public int RouteId { get; set; }
    public string PasswordValue { get; set; } = string.Empty;
}
