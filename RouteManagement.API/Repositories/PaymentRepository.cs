using Dapper;
using RouteManagement.API.Data;
using RouteManagement.API.Models;

namespace RouteManagement.API.Repositories;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(int id);
    Task<IEnumerable<Payment>> GetByInvoiceIdAsync(int invoiceId);
    Task<IEnumerable<Payment>> GetAllAsync(int page = 1, int pageSize = 10);
    Task<int> GetCountAsync();
    Task<int> CreateAsync(Payment payment);
}

public class PaymentRepository : IPaymentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PaymentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Payment>(
            "SELECT * FROM Payments WHERE Id = @Id", new { Id = id });
    }

    public async Task<IEnumerable<Payment>> GetByInvoiceIdAsync(int invoiceId)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<Payment>(
            "SELECT * FROM Payments WHERE InvoiceId = @InvoiceId ORDER BY PaymentDate DESC", 
            new { InvoiceId = invoiceId });
    }

    public async Task<IEnumerable<Payment>> GetAllAsync(int page = 1, int pageSize = 10)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT * FROM Payments 
            ORDER BY PaymentDate DESC 
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        
        return await connection.QueryAsync<Payment>(sql, new { Offset = (page - 1) * pageSize, PageSize = pageSize });
    }

    public async Task<int> GetCountAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Payments");
    }

    public async Task<int> CreateAsync(Payment payment)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Payments (InvoiceId, Amount, PaymentMethod, PaymentDate, RegisteredBy, Reference)
            VALUES (@InvoiceId, @Amount, @PaymentMethod, @PaymentDate, @RegisteredBy, @Reference);
            SELECT CAST(SCOPE_IDENTITY() as int);";
        
        return await connection.ExecuteScalarAsync<int>(sql, payment);
    }
}
