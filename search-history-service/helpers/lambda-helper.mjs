import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

class LambdaHelper {
    constructor() {
        this.lambdaClient = new LambdaClient();
        this.priceFunctionName = process.env.LAMBDA_FUNCTION_NAME;
    }

    #getLambdaParams() {
        return {
            FunctionName: `arn:aws:lambda:ap-southeast-2:211125780252:function:${functionName}`,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({isLambdaRequest: true})
        };
    }

    #extractLambdaPayload(lambdaResponse) {
        try {
            const payloadJsonString = new TextDecoder().decode(lambdaResponse.Payload);
            const payloadJsonObj = JSON.parse(payloadJsonString);
            return payloadJsonObj;
        } catch (err) {
            throw new Error(`Fetching lambda payload failed! ${err.message}`);
        }
    }

    async invokeLambda() {
        try {
            const lambdaParams = this.#getLambdaParams();
            const lambdaResponse = await this.lambdaClient.send(new InvokeCommand(lambdaParams));
            return this.#extractLambdaPayload(lambdaResponse);
        } catch (err) {
            throw new Error(`Lambda invoke failed! ${err.message}`);
        }
    }
}

export default LambdaHelper;