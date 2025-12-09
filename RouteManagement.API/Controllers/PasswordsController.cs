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
public class PasswordsController : ControllerBase
{
    private readonly IPasswordRepository _passwordRepository;
    private readonly IRouteRepository _routeRepository;
    private readonly IAuditRepository _auditRepository;

    public PasswordsController(
        IPasswordRepository passwordRepository,
        IRouteRepository routeRepository,
        IAuditRepository auditRepository)
    {
        _passwordRepository = passwordRepository;
        _routeRepository = routeRepository;
        _auditRepository = auditRepository;
    }

    [HttpGet("route/{routeId}")]
    public async Task<IActionResult> GetByRouteId(int routeId)
    {
        var password = await _passwordRepository.GetByRouteIdAsync(routeId);
        if (password == null)
        {
            return NotFound(new { message = "No password found for this route" });
        }

        var dto = new PasswordDto
        {
            Id = password.Id,
            RouteId = password.RouteId,
            CapturedAt = password.CapturedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Capture([FromBody] CapturePasswordRequest request)
    {
        var route = await _routeRepository.GetByIdAsync(request.RouteId);
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var password = new Password
        {
            RouteId = request.RouteId,
            PasswordValue = request.PasswordValue,
            CapturedAt = DateTime.UtcNow,
            CapturedBy = userId
        };

        var id = await _passwordRepository.CreateAsync(password);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Password",
            EntityId = id,
            Action = "Capture",
            NewValue = $"Password captured for route {request.RouteId}",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return Ok(new { id, message = "Password captured successfully" });
    }
}
