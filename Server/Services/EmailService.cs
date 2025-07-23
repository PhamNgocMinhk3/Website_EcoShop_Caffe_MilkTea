// Services/EmailService.cs
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlContent);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var mailSettings = _config.GetSection("MailSettings");
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(mailSettings["Email"]));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;
        email.Body = new TextPart(TextFormat.Html) { Text = htmlContent };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(mailSettings["Host"], int.Parse(mailSettings["Port"]!), SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(mailSettings["Email"], mailSettings["Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
