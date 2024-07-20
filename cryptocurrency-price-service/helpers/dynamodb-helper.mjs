import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

class DynamodbHelper {

    constructor() {
        this.dynamodbTableName = process.env.DYNAMODB_TABLE;
        this.dynamodbClient = new DynamoDBClient();
    }

    #getPutItemParams(cryptocurrencyId, cryptocurrencyPrice, requestedBy) {
        const timeStamp = new Date().toISOString();
        const id = Date.now().toString();

        return {
            TableName: dynamodbTableName,
            Item: {
              "id": { S: id },
              "coinId": { S: cryptocurrencyId },
              "price": { N: cryptocurrencyPrice.toString() },
              "timeStamp": { S:  timeStamp},
              "requestedBy": { S: requestedBy }
            }
          };
    }

    async putItem(cryptocurrencyId, cryptocurrencyPrice, requestedBy) {
        try {
            const putItemParams = this.#getPutItemParams(cryptocurrencyId, cryptocurrencyPrice, requestedBy);
            const putItemCommand = new PutItemCommand(putItemParams);
            await this.dynamodbClient.send(putItemCommand);
            console.log(`Search query saved successfully. Id ${id}`);
        } catch (err) {
            throw new Error(`Search query saving failed. ${err.message}`);
        }
    }

}

export default DynamodbHelper;