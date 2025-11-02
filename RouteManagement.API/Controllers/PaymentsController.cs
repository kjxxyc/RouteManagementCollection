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
public class PaymentsController : ControllerBase
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IAuditRepository _auditRepository;

    public PaymentsController(
        IPaymentRepository paymentRepository,
        IInvoiceRepository invoiceRepository,
        IAuditRepository auditRepository)
    {
        _paymentRepository = paymentRepository;
        _invoiceRepository = invoiceRepository;
        _auditRepository = auditRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var payments = await _paymentRepository.GetAllAsync(page, pageSize);
        var totalCount = await _paymentRepository.GetCountAsync();

        var result = new PagedResult<PaymentDto>
        {
            Items = payments.Select(p => new PaymentDto
            {
                Id = p.Id,
                InvoiceId = p.InvoiceId,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod,
                PaymentDate = p.PaymentDate,
                Reference = p.Reference
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("invoice/{invoiceId}")]
    public async Task<IActionResult> GetByInvoiceId(int invoiceId)
    {
        var payments = await _paymentRepository.GetByInvoiceIdAsync(invoiceId);
        var dtos = payments.Select(p => new PaymentDto
        {
            Id = p.Id,
            InvoiceId = p.InvoiceId,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentDate = p.PaymentDate,
            Reference = p.Reference
        });

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterPaymentRequest request)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId);
        if (invoice == null)
        {
            return NotFound(new { message = "Invoice not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var payment = new Payment
        {
            InvoiceId = request.InvoiceId,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            PaymentDate = DateTime.UtcNow,
            RegisteredBy = userId,
            Reference = request.Reference
        };

        var id = await _paymentRepository.CreateAsync(payment);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Payment",
            EntityId = id,
            Action = "Register",
            NewValue = System.Text.Json.JsonSerializer.Serialize(payment),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return Ok(new { id, message = "Payment registered successfully" });
    }
}
