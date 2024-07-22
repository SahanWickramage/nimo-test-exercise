import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

class EmailHelper {
    constructor() {
        this.sesClient = new SESClient();
        this.fromEmail = process.env.SOURCE_EMAIL;
    }

    #getEmailParams(toEmail, cryptocurrencyId, cryptocurrencyPrice) {
        return {
            Source: this.fromEmail,
            Destination: {
              ToAddresses: [toEmail],
            },
            Message: {
              Subject: {
                Data: `Nimo Test Exercise Cryptocurrency Price`,
              },
              Body: {
                Text: {
                  Data: `Price of ${cryptocurrencyId} is ${cryptocurrencyPrice}!`,
                },
              },
            },
          };
    }

    async sendEmail(toEmail, cryptocurrencyId, cryptocurrencyPrice) {
        try {
            const emailParams = this.#getEmailParams(toEmail, cryptocurrencyId, cryptocurrencyPrice);
            const sendEmailCommand = new SendEmailCommand(emailParams);
            await this.sesClient.send(sendEmailCommand);
            console.log(`Email sent to ${toEmail} successfully!`);
        } catch (err) {
            throw new Error(`Email sending to ${toEmail} failed! ${err.message}`);
        }
    }
}

export default EmailHelper;