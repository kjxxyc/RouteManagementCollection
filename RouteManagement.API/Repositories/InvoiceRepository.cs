using Dapper;
using RouteManagement.API.Data;
using RouteManagement.API.Models;

namespace RouteManagement.API.Repositories;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(int id);
    Task<IEnumerable<Invoice>> GetByRouteIdAsync(int routeId);
    Task<IEnumerable<Invoice>> GetAllAsync(int? routeId = null, bool? isOutOfRoute = null, int page = 1, int pageSize = 10);
    Task<int> GetCountAsync(int? routeId = null, bool? isOutOfRoute = null);
    Task<int> CreateAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
    Task DeleteAsync(int id);
}

public class InvoiceRepository : IInvoiceRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public InvoiceRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Invoice?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Invoice>(
            "SELECT * FROM Invoices WHERE Id = @Id", new { Id = id });
    }

    public async Task<IEnumerable<Invoice>> GetByRouteIdAsync(int routeId)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Invoice>(
            "SELECT * FROM Invoices WHERE RouteId = @RouteId", new { RouteId = routeId });
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync(int? routeId = null, bool? isOutOfRoute = null, int page = 1, int pageSize = 10)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "SELECT * FROM Invoices WHERE 1=1";
        var parameters = new DynamicParameters();

        if (routeId.HasValue)
        {
            sql += " AND RouteId = @RouteId";
            parameters.Add("RouteId", routeId.Value);
        }

        if (isOutOfRoute.HasValue)
        {
            sql += " AND IsOutOfRoute = @IsOutOfRoute";
            parameters.Add("IsOutOfRoute", isOutOfRoute.Value);
        }

        sql += " ORDER BY CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        parameters.Add("Offset", (page - 1) * pageSize);
        parameters.Add("PageSize", pageSize);

        return await connection.QueryAsync<Invoice>(sql, parameters);
    }

    public async Task<int> GetCountAsync(int? routeId = null, bool? isOutOfRoute = null)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "SELECT COUNT(*) FROM Invoices WHERE 1=1";
        var parameters = new DynamicParameters();

        if (routeId.HasValue)
        {
            sql += " AND RouteId = @RouteId";
            parameters.Add("RouteId", routeId.Value);
        }

        if (isOutOfRoute.HasValue)
        {
            sql += " AND IsOutOfRoute = @IsOutOfRoute";
            parameters.Add("IsOutOfRoute", isOutOfRoute.Value);
        }

        return await connection.ExecuteScalarAsync<int>(sql, parameters);
    }

    public async Task<int> CreateAsync(Invoice invoice)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Invoices (RouteId, InvoiceNumber, Amount, CustomerName, CustomerAddress, IsOutOfRoute, CreatedAt, CreatedBy)
            VALUES (@RouteId, @InvoiceNumber, @Amount, @CustomerName, @CustomerAddress, @IsOutOfRoute, @CreatedAt, @CreatedBy);
            SELECT CAST(SCOPE_IDENTITY() as int);";
        
        return await connection.ExecuteScalarAsync<int>(sql, invoice);
    }

    public async Task UpdateAsync(Invoice invoice)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Invoices 
            SET RouteId = @RouteId, InvoiceNumber = @InvoiceNumber, Amount = @Amount, 
                CustomerName = @CustomerName, CustomerAddress = @CustomerAddress, IsOutOfRoute = @IsOutOfRoute
            WHERE Id = @Id";
        
        await connection.ExecuteAsync(sql, invoice);
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync("DELETE FROM Invoices WHERE Id = @Id", new { Id = id });
    }
}
