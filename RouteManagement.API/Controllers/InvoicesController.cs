using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteManagement.API.DTOs;
using RouteManagement.API.Models;
using RouteManagement.API.Repositories;

namespace RouteManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IAuditRepository _auditRepository;

    public InvoicesController(IInvoiceRepository invoiceRepository, IAuditRepository auditRepository)
    {
        _invoiceRepository = invoiceRepository;
        _auditRepository = auditRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? routeId = null,
        [FromQuery] bool? isOutOfRoute = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var invoices = await _invoiceRepository.GetAllAsync(routeId, isOutOfRoute, page, pageSize);
        var totalCount = await _invoiceRepository.GetCountAsync(routeId, isOutOfRoute);

        var result = new PagedResult<InvoiceDto>
        {
            Items = invoices.Select(i => new InvoiceDto
            {
                Id = i.Id,
                RouteId = i.RouteId,
                InvoiceNumber = i.InvoiceNumber,
                Amount = i.Amount,
                CustomerName = i.CustomerName,
                CustomerAddress = i.CustomerAddress,
                IsOutOfRoute = i.IsOutOfRoute,
                CreatedAt = i.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
        {
            return NotFound(new { message = "Invoice not found" });
        }

        var dto = new InvoiceDto
        {
            Id = invoice.Id,
            RouteId = invoice.RouteId,
            InvoiceNumber = invoice.InvoiceNumber,
            Amount = invoice.Amount,
            CustomerName = invoice.CustomerName,
            CustomerAddress = invoice.CustomerAddress,
            IsOutOfRoute = invoice.IsOutOfRoute,
            CreatedAt = invoice.CreatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var invoice = new Invoice
        {
            RouteId = request.RouteId,
            InvoiceNumber = request.InvoiceNumber,
            Amount = request.Amount,
            CustomerName = request.CustomerName,
            CustomerAddress = request.CustomerAddress,
            IsOutOfRoute = request.IsOutOfRoute,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        var id = await _invoiceRepository.CreateAsync(invoice);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Invoice",
            EntityId = id,
            Action = "Create",
            NewValue = System.Text.Json.JsonSerializer.Serialize(invoice),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
        {
            return NotFound(new { message = "Invoice not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        await _invoiceRepository.DeleteAsync(id);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Invoice",
            EntityId = id,
            Action = "Delete",
            OldValue = System.Text.Json.JsonSerializer.Serialize(invoice),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return NoContent();
    }
}
