using Dapper;

namespace RouteManagement.API.Data;

public class DatabaseInitializer
{
    private readonly IDbConnectionFactory _connectionFactory;

    public DatabaseInitializer(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task InitializeAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        
        // Create Users table
        await connection.ExecuteAsync(@"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                Id INT PRIMARY KEY IDENTITY(1,1),
                Username NVARCHAR(100) NOT NULL UNIQUE,
                PasswordHash NVARCHAR(255) NOT NULL,
                Email NVARCHAR(200) NOT NULL,
                Role NVARCHAR(50) NOT NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                IsActive BIT NOT NULL DEFAULT 1
            )");

        // Create Routes table
        await connection.ExecuteAsync(@"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Routes' AND xtype='U')
            CREATE TABLE Routes (
                Id INT PRIMARY KEY IDENTITY(1,1),
                Name NVARCHAR(100) NOT NULL,
                Description NVARCHAR(500),
                Date DATETIME2 NOT NULL,
                Status NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
                CreatedBy INT NOT NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                PublishedAt DATETIME2 NULL,
                IsPublished BIT NOT NULL DEFAULT 0,
                FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
            )");

        // Create Invoices table
        await connection.ExecuteAsync(@"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Invoices' AND xtype='U')
            CREATE TABLE Invoices (
                Id INT PRIMARY KEY IDENTITY(1,1),
                RouteId INT NULL,
                InvoiceNumber NVARCHAR(50) NOT NULL,
                Amount DECIMAL(18,2) NOT NULL,
                CustomerName NVARCHAR(200) NOT NULL,
                CustomerAddress NVARCHAR(500) NOT NULL,
                IsOutOfRoute BIT NOT NULL DEFAULT 0,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CreatedBy INT NOT NULL,
                FOREIGN KEY (RouteId) REFERENCES Routes(Id),
                FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
            )");

        // Create Passwords table
        await connection.ExecuteAsync(@"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Passwords' AND xtype='U')
            CREATE TABLE Passwords (
                Id INT PRIMARY KEY IDENTITY(1,1),
                RouteId INT NOT NULL,
                PasswordValue NVARCHAR(255) NOT NULL,
                CapturedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CapturedBy INT NOT NULL,
                FOREIGN KEY (RouteId) REFERENCES Routes(Id),
                FOREIGN KEY (CapturedBy) REFERENCES Users(Id)
            )");

        // Create Payments table
        await connection.ExecuteAsync(@"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payments' AND xtype='U')
            CREATE TABLE Payments (
                Id INT PRIMARY KEY IDENTITY(1,1),
                InvoiceId INT NOT NULL,
                Amount DECIMAL(18,2) NOT NULL,
                PaymentMethod NVARCHAR(50) NOT NULL,
                PaymentDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                RegisteredBy INT NOT NULL,
                Reference NVARCHAR(100) NULL,
                FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id),
                FOREIGN KEY (RegisteredBy) REFERENCES Users(Id)
            )");

        // Create AuditLogs table
        await connection.ExecuteAsync(@"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
            CREATE TABLE AuditLogs (
                Id INT PRIMARY KEY IDENTITY(1,1),
                EntityType NVARCHAR(50) NOT NULL,
                EntityId INT NOT NULL,
                Action NVARCHAR(50) NOT NULL,
                OldValue NVARCHAR(MAX) NULL,
                NewValue NVARCHAR(MAX) NULL,
                UserId INT NOT NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                FOREIGN KEY (UserId) REFERENCES Users(Id)
            )");
    }
}
