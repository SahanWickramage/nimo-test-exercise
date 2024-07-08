import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const client = new LambdaClient();

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

export const lambdaHandler = async (event, context) => {
  
  const params = {
        FunctionName: 'arn:aws:lambda:ap-southeast-2:211125780252:function:nimo-test-exercise-CryptocurrencyPriceFunction-Fgpj5YBI7vdK',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ name: 'John Doe' })
    };
    
    const lambdaResponse = await client.send(new InvokeCommand(params));
    console.log(lambdaResponse);
  
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'this is search history service!',
        responseFromLambda: lambdaResponse
      })
    };

    return response;
  };
  