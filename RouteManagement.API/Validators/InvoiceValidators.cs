using FluentValidation;
using RouteManagement.API.DTOs;

namespace RouteManagement.API.Validators;

public class CreateInvoiceRequestValidator : AbstractValidator<CreateInvoiceRequest>
{
    public CreateInvoiceRequestValidator()
    {
        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required")
            .MaximumLength(50).WithMessage("Invoice number must not exceed 50 characters");
        
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0");
        
        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("Customer name is required")
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters");
        
        RuleFor(x => x.CustomerAddress)
            .NotEmpty().WithMessage("Customer address is required")
            .MaximumLength(500).WithMessage("Customer address must not exceed 500 characters");
    }
}
