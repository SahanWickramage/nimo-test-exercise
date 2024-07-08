import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const lambdaHandler = async (event, context) => {
    const params = {
      TableName: 'nimo-exercise-cryptocurrency-prices',
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

    return {
      statusCode: 200,
      // body: JSON.stringify({
      //   message: 'hello world',
      // })
      body: JSON.stringify(result)
    };
  };
  