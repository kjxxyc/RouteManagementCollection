namespace RouteManagement.API.Models;

public class Route
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = "Pendiente"; // Pendiente, Liquidado
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public bool IsPublished { get; set; } = false;
}
