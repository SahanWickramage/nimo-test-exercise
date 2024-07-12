import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);
const sesClient = new SESClient();

const baseUrl = process.env.COINGECKO_URL;
const apiKey = process.env.COINGECKO_API_KEY;
const dynamodbTableName = process.env.DYNAMODB_TABLE;
const sourceEmail = process.env.SOURCE_EMAIL;

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

        const headers = {
          'accept': 'application/json',
          'x-cg-pro-api-key': 'CG-Puzd4QbkcqBh2aZkmSEoZe7J'
        };
        console.log(`x-cg-pro-api-key: ${apiKey}`);
      
        const requestOptions = {
          method: 'GET',
          headers: headers
        };

        const url = `${baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`;
        console.log(url);
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
    
        const data = await response.json();
        
        const jsonStr = JSON.stringify(data);
        const jsonMap = new Map(Object.entries(JSON.parse(jsonStr)));
        const usdObj = jsonMap.get("ethereum");
        const cryptocurrencyPrice = usdObj.usd;
        
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
        
        const emailParams = {
          Source: sourceEmail,
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Subject: {
              Data: `Cryptocurrency price`,
            },
            Body: {
              Text: {
                Data: `Price of ${coinId} is ${cryptocurrencyPrice}!`,
              },
            },
          },
        };
        
        const sendEmailCommand = new SendEmailCommand(emailParams);
        
        const sesResponse = await sesClient.send(sendEmailCommand);
        console.log('Email sent:', sesResponse);

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
  