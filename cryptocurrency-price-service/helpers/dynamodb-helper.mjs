import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

class DynamodbHelper {

    constructor() {
        this.dynamodbTableName = process.env.DYNAMODB_TABLE;
        this.dynamodbClient = new DynamoDBClient();
        this.dynamodbDocClient = DynamoDBDocumentClient.from(dynamodbClient);
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

    #getScanParams() {
        return {
            TableName: dynamodbTableName
        };
    }

    getHistory() {
        try {
            const fetchedItems = this.#getAllItems();
            const queryHistoryMap = this.#groupItems(fetchedItems);
            console.log("Fetching history succeed!");
            return queryHistoryMap;
        } catch (err) {
            throw new Error(`Fetching history failed! ${err.message}`);
        }    
    }

    async #getAllItems() {
        try {
            const scanParams = this.#getScanParams();

            const scanResponse = await this.dynamodbDocClient.send(new ScanCommand(scanParams));

            const fetchedItems = [...scanResponse.Items];
            while (scanResponse.LastEvaluatedKey) {
                scanParams.ExclusiveStartkey = scanResponse.LastEvaluatedKey;
                scanResponse = await this.dynamodbDocClient.send(new ScanCommand(scanParams));
                fetchedItems.push(...scanResponse.Items);
            }

            console.log("Fetching items succeed!");

            return fetchedItems;
        } catch (err) {
            throw new Error(`Fetching items failed! ${err.message}`);
        }
    }

    #groupItems(fetchedItems) {
        return fetchedItems.reduce((acc, obj) => {
            const coinId = obj.coinId;
            if (!acc[coinId]) {
              acc[coinId] = [];
            }
            acc[coinId].push(obj.timeStamp);
            return acc;
          }, {});
    }

}

export default DynamodbHelper;