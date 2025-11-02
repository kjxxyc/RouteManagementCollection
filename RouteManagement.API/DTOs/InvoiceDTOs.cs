namespace RouteManagement.API.DTOs;

public class InvoiceDto
{
    public int Id { get; set; }
    public int? RouteId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public bool IsOutOfRoute { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateInvoiceRequest
{
    public int? RouteId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public bool IsOutOfRoute { get; set; }
}
