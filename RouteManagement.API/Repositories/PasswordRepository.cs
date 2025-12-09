using Dapper;
using RouteManagement.API.Data;
using RouteManagement.API.Models;

namespace RouteManagement.API.Repositories;

public interface IPasswordRepository
{
    Task<Password?> GetByIdAsync(int id);
    Task<Password?> GetByRouteIdAsync(int routeId);
    Task<int> CreateAsync(Password password);
}

public class PasswordRepository : IPasswordRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PasswordRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Password?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Password>(
            "SELECT * FROM Passwords WHERE Id = @Id", new { Id = id });
    }

    public async Task<Password?> GetByRouteIdAsync(int routeId)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Password>(
            "SELECT * FROM Passwords WHERE RouteId = @RouteId ORDER BY CapturedAt DESC", 
            new { RouteId = routeId });
    }

    public async Task<int> CreateAsync(Password password)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Passwords (RouteId, PasswordValue, CapturedAt, CapturedBy)
            VALUES (@RouteId, @PasswordValue, @CapturedAt, @CapturedBy);
            SELECT CAST(SCOPE_IDENTITY() as int);";
        
        return await connection.ExecuteScalarAsync<int>(sql, password);
    }
}
