using FluentValidation;
using RouteManagement.API.DTOs;

namespace RouteManagement.API.Validators;

public class CapturePasswordRequestValidator : AbstractValidator<CapturePasswordRequest>
{
    public CapturePasswordRequestValidator()
    {
        RuleFor(x => x.RouteId)
            .GreaterThan(0).WithMessage("Route ID is required");
        
        RuleFor(x => x.PasswordValue)
            .NotEmpty().WithMessage("Password value is required")
            .MinimumLength(4).WithMessage("Password must be at least 4 characters");
    }
}
