using FluentValidation;
using RouteManagement.API.DTOs;

namespace RouteManagement.API.Validators;

public class CreateRouteRequestValidator : AbstractValidator<CreateRouteRequest>
{
    public CreateRouteRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");
        
        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required");
    }
}

public class ChangeRouteStatusRequestValidator : AbstractValidator<ChangeRouteStatusRequest>
{
    public ChangeRouteStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .Must(x => x == "Pendiente" || x == "Liquidado")
            .WithMessage("Status must be 'Pendiente' or 'Liquidado'");
    }
}
