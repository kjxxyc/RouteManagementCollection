using Dapper;
using RouteManagement.API.Data;
using RouteEntity = RouteManagement.API.Models.Route;

namespace RouteManagement.API.Repositories;

public interface IRouteRepository
{
    Task<RouteEntity?> GetByIdAsync(int id);
    Task<IEnumerable<RouteEntity>> GetAllAsync(DateTime? startDate = null, DateTime? endDate = null, string? status = null, int page = 1, int pageSize = 10);
    Task<int> GetCountAsync(DateTime? startDate = null, DateTime? endDate = null, string? status = null);
    Task<int> CreateAsync(RouteEntity route);
    Task UpdateAsync(RouteEntity route);
    Task DeleteAsync(int id);
    Task PublishAsync(int id);
    Task ChangeStatusAsync(int id, string status);
}

public class RouteRepository : IRouteRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public RouteRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<RouteEntity?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<RouteEntity>(
            "SELECT * FROM Routes WHERE Id = @Id", new { Id = id });
    }

    public async Task<IEnumerable<RouteEntity>> GetAllAsync(DateTime? startDate = null, DateTime? endDate = null, string? status = null, int page = 1, int pageSize = 10)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "SELECT * FROM Routes WHERE 1=1";
        var parameters = new DynamicParameters();

        if (startDate.HasValue)
        {
            sql += " AND Date >= @StartDate";
            parameters.Add("StartDate", startDate.Value);
        }

        if (endDate.HasValue)
        {
            sql += " AND Date <= @EndDate";
            parameters.Add("EndDate", endDate.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND Status = @Status";
            parameters.Add("Status", status);
        }

        sql += " ORDER BY Date DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        parameters.Add("Offset", (page - 1) * pageSize);
        parameters.Add("PageSize", pageSize);

        return await connection.QueryAsync<RouteEntity>(sql, parameters);
    }

    public async Task<int> GetCountAsync(DateTime? startDate = null, DateTime? endDate = null, string? status = null)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "SELECT COUNT(*) FROM Routes WHERE 1=1";
        var parameters = new DynamicParameters();

        if (startDate.HasValue)
        {
            sql += " AND Date >= @StartDate";
            parameters.Add("StartDate", startDate.Value);
        }

        if (endDate.HasValue)
        {
            sql += " AND Date <= @EndDate";
            parameters.Add("EndDate", endDate.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND Status = @Status";
            parameters.Add("Status", status);
        }

        return await connection.ExecuteScalarAsync<int>(sql, parameters);
    }

    public async Task<int> CreateAsync(RouteEntity route)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Routes (Name, Description, Date, Status, CreatedBy, CreatedAt, IsPublished)
            VALUES (@Name, @Description, @Date, @Status, @CreatedBy, @CreatedAt, @IsPublished);
            SELECT CAST(SCOPE_IDENTITY() as int);";
        
        return await connection.ExecuteScalarAsync<int>(sql, route);
    }

    public async Task UpdateAsync(RouteEntity route)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Routes 
            SET Name = @Name, Description = @Description, Date = @Date
            WHERE Id = @Id";
        
        await connection.ExecuteAsync(sql, route);
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync("DELETE FROM Routes WHERE Id = @Id", new { Id = id });
    }

    public async Task PublishAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Routes 
            SET IsPublished = 1, PublishedAt = GETUTCDATE()
            WHERE Id = @Id";
        
        await connection.ExecuteAsync(sql, new { Id = id });
    }

    public async Task ChangeStatusAsync(int id, string status)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "UPDATE Routes SET Status = @Status WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id, Status = status });
    }
}
