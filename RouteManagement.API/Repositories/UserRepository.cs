using Dapper;
using RouteManagement.API.Data;
using RouteManagement.API.Models;

namespace RouteManagement.API.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<int> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task<IEnumerable<User>> GetAllAsync();
}

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Id = @Id", new { Id = id });
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @Username", new { Username = username });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Email = @Email", new { Email = email });
    }

    public async Task<int> CreateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Users (Username, PasswordHash, Email, Role, CreatedAt, IsActive)
            VALUES (@Username, @PasswordHash, @Email, @Role, @CreatedAt, @IsActive);
            SELECT CAST(SCOPE_IDENTITY() as int);";
        
        return await connection.ExecuteScalarAsync<int>(sql, user);
    }

    public async Task UpdateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Users 
            SET Username = @Username, Email = @Email, Role = @Role, IsActive = @IsActive
            WHERE Id = @Id";
        
        await connection.ExecuteAsync(sql, user);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<User>("SELECT * FROM Users");
    }
}
