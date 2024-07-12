import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const client = new LambdaClient();

const functionName = process.env.LAMBDA_FUNCTION_NAME;

export const lambdaHandler = async (event, context) => {
  
  const params = {
        FunctionName: `arn:aws:lambda:ap-southeast-2:211125780252:function:${functionName}`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({isLambdaRequest: true})
    };
    
    const lambdaResponse = await client.send(new InvokeCommand(params));
    console.log(lambdaResponse);
    
    const jsonString = new TextDecoder().decode(lambdaResponse.Payload);
    console.log(jsonString);
    
    const jsonObject = JSON.parse(jsonString);
    console.log(jsonObject);
  
    const response = {
      statusCode: 200,
      body: JSON.stringify(jsonObject)
    };

    return response;
  };
  