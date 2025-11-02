using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteManagement.API.DTOs;
using RouteEntity = RouteManagement.API.Models.Route;
using RouteManagement.API.Repositories;

namespace RouteManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly IRouteRepository _routeRepository;
    private readonly IAuditRepository _auditRepository;

    public RoutesController(IRouteRepository routeRepository, IAuditRepository auditRepository)
    {
        _routeRepository = routeRepository;
        _auditRepository = auditRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var routes = await _routeRepository.GetAllAsync(startDate, endDate, status, page, pageSize);
        var totalCount = await _routeRepository.GetCountAsync(startDate, endDate, status);

        var result = new PagedResult<RouteDto>
        {
            Items = routes.Select(r => new RouteDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Date = r.Date,
                Status = r.Status,
                IsPublished = r.IsPublished,
                PublishedAt = r.PublishedAt,
                CreatedAt = r.CreatedAt
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
        var route = await _routeRepository.GetByIdAsync(id);
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        var dto = new RouteDto
        {
            Id = route.Id,
            Name = route.Name,
            Description = route.Description,
            Date = route.Date,
            Status = route.Status,
            IsPublished = route.IsPublished,
            PublishedAt = route.PublishedAt,
            CreatedAt = route.CreatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRouteRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var route = new RouteEntity
        {
            Name = request.Name,
            Description = request.Description,
            Date = request.Date,
            Status = "Pendiente",
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsPublished = false
        };

        var id = await _routeRepository.CreateAsync(route);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Route",
            EntityId = id,
            Action = "Create",
            NewValue = System.Text.Json.JsonSerializer.Serialize(route),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRouteRequest request)
    {
        var route = await _routeRepository.GetByIdAsync(id);
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var oldValue = System.Text.Json.JsonSerializer.Serialize(route);

        if (!string.IsNullOrEmpty(request.Name))
            route.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description))
            route.Description = request.Description;
        if (request.Date.HasValue)
            route.Date = request.Date.Value;

        await _routeRepository.UpdateAsync(route);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Route",
            EntityId = id,
            Action = "Update",
            OldValue = oldValue,
            NewValue = System.Text.Json.JsonSerializer.Serialize(route),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var route = await _routeRepository.GetByIdAsync(id);
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        await _routeRepository.DeleteAsync(id);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Route",
            EntityId = id,
            Action = "Delete",
            OldValue = System.Text.Json.JsonSerializer.Serialize(route),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return NoContent();
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> Publish(int id)
    {
        var route = await _routeRepository.GetByIdAsync(id);
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        if (route.IsPublished)
        {
            return BadRequest(new { message = "Route is already published" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        await _routeRepository.PublishAsync(id);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Route",
            EntityId = id,
            Action = "Publish",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return Ok(new { message = "Route published successfully" });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeRouteStatusRequest request)
    {
        var route = await _routeRepository.GetByIdAsync(id);
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var oldStatus = route.Status;

        await _routeRepository.ChangeStatusAsync(id, request.Status);

        await _auditRepository.CreateAsync(new Models.AuditLog
        {
            EntityType = "Route",
            EntityId = id,
            Action = "ChangeStatus",
            OldValue = oldStatus,
            NewValue = request.Status,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        return Ok(new { message = "Status updated successfully" });
    }
}
