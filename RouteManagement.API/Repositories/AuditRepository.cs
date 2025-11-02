using Dapper;
using RouteManagement.API.Data;
using RouteManagement.API.Models;

namespace RouteManagement.API.Repositories;

public interface IAuditRepository
{
    Task<IEnumerable<AuditLog>> GetAllAsync(string? entityType = null, int? entityId = null, int page = 1, int pageSize = 10);
    Task<int> GetCountAsync(string? entityType = null, int? entityId = null);
    Task<int> CreateAsync(AuditLog auditLog);
}

public class AuditRepository : IAuditRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync(string? entityType = null, int? entityId = null, int page = 1, int pageSize = 10)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "SELECT * FROM AuditLogs WHERE 1=1";
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(entityType))
        {
            sql += " AND EntityType = @EntityType";
            parameters.Add("EntityType", entityType);
        }

        if (entityId.HasValue)
        {
            sql += " AND EntityId = @EntityId";
            parameters.Add("EntityId", entityId.Value);
        }

        sql += " ORDER BY CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        parameters.Add("Offset", (page - 1) * pageSize);
        parameters.Add("PageSize", pageSize);

        return await connection.QueryAsync<AuditLog>(sql, parameters);
    }

    public async Task<int> GetCountAsync(string? entityType = null, int? entityId = null)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "SELECT COUNT(*) FROM AuditLogs WHERE 1=1";
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(entityType))
        {
            sql += " AND EntityType = @EntityType";
            parameters.Add("EntityType", entityType);
        }

        if (entityId.HasValue)
        {
            sql += " AND EntityId = @EntityId";
            parameters.Add("EntityId", entityId.Value);
        }

        return await connection.ExecuteScalarAsync<int>(sql, parameters);
    }

    public async Task<int> CreateAsync(AuditLog auditLog)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO AuditLogs (EntityType, EntityId, Action, OldValue, NewValue, UserId, CreatedAt)
            VALUES (@EntityType, @EntityId, @Action, @OldValue, @NewValue, @UserId, @CreatedAt);
            SELECT CAST(SCOPE_IDENTITY() as int);";
        
        return await connection.ExecuteScalarAsync<int>(sql, auditLog);
    }
}
