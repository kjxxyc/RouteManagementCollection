using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteManagement.API.DTOs;
using RouteManagement.API.Repositories;

namespace RouteManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditRepository _auditRepository;
    private readonly IUserRepository _userRepository;

    public AuditController(IAuditRepository auditRepository, IUserRepository userRepository)
    {
        _auditRepository = auditRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? entityType = null,
        [FromQuery] int? entityId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var auditLogs = await _auditRepository.GetAllAsync(entityType, entityId, page, pageSize);
        var totalCount = await _auditRepository.GetCountAsync(entityType, entityId);

        var users = await _userRepository.GetAllAsync();
        var userDict = users.ToDictionary(u => u.Id, u => u.Username);

        var result = new PagedResult<AuditLogDto>
        {
            Items = auditLogs.Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Action = a.Action,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                Username = userDict.GetValueOrDefault(a.UserId, "Unknown"),
                CreatedAt = a.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize
        };

        return Ok(result);
    }
}
