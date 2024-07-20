import LambdaHelper from "./helpers/lambda-helper.mjs";

const lambdaHelper = new LambdaHelper();

export const lambdaHandler = async (event, context) => {
  
  try {
    const lambdaResponsePayload = lambdaHelper.invokeLambda();
    return {
      statusCode: 200,
      body: JSON.stringify({
        "message": "History fetching succeed!",
        "payload": lambdaResponsePayload
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        "message": "History fetching failed!",
        "payload": null
      })
    };
  }
};
  