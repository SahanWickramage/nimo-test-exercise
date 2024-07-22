import EmailHelper from "./helpers/email-helper.mjs";

const emailHelper = new EmailHelper();

export const lambdaHandler = async (event) => {

  console.log(JSON.stringify(event));
  
  try {
    for (let record of event.Records) {
      if (record.eventName === "INSERT") {
        const coinId = record.dynamodb.NewImage.coinId.S;
        const cryptocurrencyPrice = record.dynamodb.NewImage.price.N;
        const email = record.dynamodb.NewImage.requestedBy.S;
        await emailHelper.sendEmail(email, coinId, cryptocurrencyPrice);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify('Emails sent successfully!')
    };
  } catch (err) {
    console.log(err.message);
    return {
      statusCode: 500,
      body: JSON.stringify('Emails sending failed!')
    };
  }

};
