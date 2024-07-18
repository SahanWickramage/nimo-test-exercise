import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { EmailHelper } from "./helpers/email-helper.mjs";
import CoingeckoHelper from "./helpers/coingecko-helper.mjs";

const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);
const coingeckoHelper = new CoingeckoHelper();
const emailHelper = new EmailHelper();

const dynamodbTableName = process.env.DYNAMODB_TABLE;

export const lambdaHandler = async (event, context) => {

  console.log('queryStringParametersqueryStringParameters:', event.queryStringParameters);
  
  try {

    if (event.isLambdaRequest) {
      console.log('Lambda request');

      const params = {
        TableName: dynamodbTableName
      };

      const command = new ScanCommand(params);
      const response = await docClient.send(command);
  
      const items = response.Items;   
      // Handle pagination if necessary
      const result = [...items];
      while (response.LastEvaluatedKey) {
        params.ExclusiveStartKey = response.LastEvaluatedKey;
        const nextResponse = await docClient.send(new ScanCommand(params));
        result.push(...nextResponse.Items);
      }
  
      // Process the result
      console.log('DynamoDB result:', result);
      const resultGroupedByCoinId = result.reduce((acc, obj) => {
        const coinId = obj.coinId;
        if (!acc[coinId]) {
          acc[coinId] = [];
        }
        acc[coinId].push(obj.timeStamp);
        return acc;
      }, {});

      return {
        statusCode: 200,
        body: JSON.stringify({recordCount: result.length, searchHistory: resultGroupedByCoinId})
      };

    } else {
      console.log('API Gateway request');

      if (!event.queryStringParameters) {
        throw new Error('Missing queryStringParameters');
      } else {
        const email = event.queryStringParameters.email;
        console.log('email:', email);

        const coinId = event.queryStringParameters.coinId;
        console.log('coinId:', coinId);

        const cryptocurrencyPrice = await coingeckoHelper.getCryptocurrencyPrice(coinId);
        
        console.log(`${cryptocurrencyPrice} type: ${typeof cryptocurrencyPrice}`);
        
        const timeStamp = new Date().toISOString();

        console.log(`id: ${Date.now().toString()} | type: ${typeof Date.now().toString()}`);
        console.log(`coinId: ${coinId} | type: ${typeof coinId}`);
        console.log(`price: ${cryptocurrencyPrice} | type: ${typeof cryptocurrencyPrice}`);
        console.log(`timeStamp: ${timeStamp} | type: ${typeof timeStamp}`);
        console.log(`requestedBy: ${email} | type: ${typeof email}`);

        const putItemParams = {
          TableName: dynamodbTableName,
          Item: {
            // The key-value pairs representing the item to be added
            "id": { S: Date.now().toString() }, // Partition key
            "coinId": { S: coinId },
            "price": { N: cryptocurrencyPrice.toString() },
            "timeStamp": { S:  timeStamp},
            "requestedBy": { S: email }
          }
        };
        
        const command = new PutItemCommand(putItemParams);

        const dynamodbResponse = await ddbClient.send(command);
        console.log("Item added successfully:", dynamodbResponse);
        
        await emailHelper.sendEmail(email, coinId, cryptocurrencyPrice);

        return {
          statusCode: 200,
          body: JSON.stringify({
            "message": "Email successfully sent!",
            "dynamodbResponse": dynamodbResponse})
        };
      }
      }

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  } 
  
  };
  