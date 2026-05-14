using FluentValidation;
using BikeHaus.Application.DTOs;
using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.Validators;

/// <summary>
/// Ödeme oluşturma isteği için validation
/// XSS, SQLi, input manipulation koruması
/// </summary>
public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.OnlineSaleId)
            .NotEmpty()
            .WithMessage("Satış ID gerekli");

        RuleFor(x => x.Method)
            .IsInEnum()
            .WithMessage("Geçersiz ödeme yöntemi");

        RuleFor(x => x.CustomerEmail)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail))
            .WithMessage("Geçersiz e-posta adresi");

        RuleFor(x => x.CustomerName)
            .MaximumLength(100)
            .Matches(@"^[a-zA-Z0-9\s\-\.äöüÄÖÜß]*$")
            .When(x => !string.IsNullOrEmpty(x.CustomerName))
            .WithMessage("Müşteri adı geçersiz karakterler içeriyor");
    }
}

/// <summary>
/// İade isteği validasyonu
/// </summary>
public class RefundRequestValidator : AbstractValidator<RefundRequest>
{
    public RefundRequestValidator()
    {
        RuleFor(x => x.PaymentId)
            .NotEmpty()
            .WithMessage("Ödeme ID gerekli");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .LessThanOrEqualTo(50000) // Max €50.000
            .When(x => x.Amount.HasValue)
            .WithMessage("İade tutarı 0 ile €50.000 arasında olmalı");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .MaximumLength(500)
            .Matches(@"^[a-zA-Z0-9\s\-\.äöüÄÖÜß,;:()!?]*$")
            .WithMessage("İade nedeni geçersiz");
    }
}

/// <summary>
/// Ödeme durumu sorgulaması
/// </summary>
public class PaymentStatusRequestValidator : AbstractValidator<PaymentStatusRequest>
{
    public PaymentStatusRequestValidator()
    {
        RuleFor(x => x.PaymentId)
            .NotEmpty()
            .WithMessage("Ödeme ID gerekli");
    }
}
