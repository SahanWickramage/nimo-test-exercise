import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient } from "@aws-sdk/client-ses";
import { GetEmailIdentityCommand } from "@aws-sdk/client-ses/commands";

const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);
const client = new SESClient();

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
          'x-cg-pro-api-key': apiKey
        };
      
        const requestOptions = {
          method: 'GET',
          headers: headers
        };

        const response = await fetch(`${baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
    
        const data = await response.json();
        const cryptocurrencyPrice = data.coinId.usd;
        const timeStamp = new Date().toISOString();

        const putItemParams = {
          TableName: dynamodbTableName,
          Item: {
            // The key-value pairs representing the item to be added
            "id": { S: Date.now().toString() }, // Partition key
            "coinId": { S: coinId },
            "price": { N: cryptocurrencyPrice },
            "timeStamp": { S:  timeStamp},
            "requestedBy": { S: email }
          }
        };
        
        const command = new PutItemCommand(putItemParams);

        const dynamodbResponse = await ddbClient.send(command);
        console.log("Item added successfully:", dynamodbResponse);

        // check email identity is verified or not
        const emailIdentityCommand = new GetEmailIdentityCommand({ EmailAddress: email });
        const emailIdentityResponse = await client.send(emailIdentityCommand);
        console.log('Email identity response:', emailIdentityResponse);

      }
      }

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing your request.',
      }),
    };
  } 
  
  };
  