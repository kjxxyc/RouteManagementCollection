namespace RouteManagement.API.DTOs;

public class RouteDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRouteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class UpdateRouteRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime? Date { get; set; }
}

public class ChangeRouteStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
