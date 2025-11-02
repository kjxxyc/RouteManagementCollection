namespace RouteManagement.API.Models;

public class Invoice
{
    public int Id { get; set; }
    public int? RouteId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public bool IsOutOfRoute { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CreatedBy { get; set; }
}
