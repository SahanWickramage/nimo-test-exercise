import EmailHelper from "./helpers/email-helper.mjs";
import CoingeckoHelper from "./helpers/coingecko-helper.mjs";
import DynamodbHelper from "./helpers/dynamodb-helper.mjs";

const coingeckoHelper = new CoingeckoHelper();
const emailHelper = new EmailHelper();
const dynamodbHelper = new DynamodbHelper();

export const lambdaHandler = async (event, context) => {
  
  try {

    if (event.isLambdaRequest) {
      console.log('Lambda request!');

      const queryHistory = await dynamodbHelper.getHistory();

      return {
        statusCode: 200,
        body: JSON.stringify({
          "message": "History successfully fetched!",
          "payload": queryHistory 
        })
        };

    } else {
      console.log('API Gateway request!');

      if (!event.queryStringParameters) {
        throw new Error('Missing query parameters!');
      }

      const email = event.queryStringParameters.email;
      const coinId = event.queryStringParameters.coinId;

      const cryptocurrencyPrice = await coingeckoHelper.getCryptocurrencyPrice(coinId);
      
      await dynamodbHelper.putItem(coinId, cryptocurrencyPrice, email);
      
      await emailHelper.sendEmail(email, coinId, cryptocurrencyPrice);

      return {
        statusCode: 200,
        body: JSON.stringify({
          "message": "Email successfully sent!",
          "payload": {
            "cryptocurrencyId": coinId,
            "cryptocurrencyPrice": cryptocurrencyPrice,
            "requestedBy": email
          }})
        };
      }

  } catch (err) {
    console.error(err.message);
    const message = event.isLambdaRequest ? "History fetching failed!" : "Price query failed!";

    return {
      statusCode: 500,
      body: JSON.stringify({
        "message": message,
        "payload": null
      })
    };
  } 
  
  };
  