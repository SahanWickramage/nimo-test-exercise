class CoingeckoHelper {
    constructor() {
        this.baseUrl = process.env.COINGECKO_URL;
        this.apiKey = process.env.COINGECKO_API_KEY;
    }

    #getApiRequestHeaders() {
        return {
            'accept': 'application/json',
            'x-cg-pro-api-key': this.apiKey
        };
    }
    
    #getApiRequestOptions() {
        return {
            method: 'GET',
            headers: this.#getApiRequestHeaders()
        };
    }
    
    #extractCryptocurrencyPrice(payloadObj, cryptocurrencyId) {
        try {
            const payloadMap = new Map(Object.entries(payloadObj));
            const cryptocurrencyPriceObj = payloadMap.get(cryptocurrencyId);
            return cryptocurrencyPriceObj.usd;
        } catch (err) {
            throw new Error(`Cannot extract cryptocurrency price! ${err.message}`);
        }
    };


    async getCryptocurrencyPrice(cryptocurrencyId) {
        const apiRequestUrl = `${this.baseUrl}/simple/price?ids=${cryptocurrencyId}&vs_currencies=usd`;
        const apiResponse = await fetch(apiRequestUrl, this.#getApiRequestOptions());

        if (!apiResponse.ok) {
            throw new Error(`HTTP error. ${apiResponse.status}`);
        }

        const apiResponsePayload = await apiResponse.json();
        const cryptocurrencyPrice = this.#extractCryptocurrencyPrice(apiResponsePayload, cryptocurrencyId);
        console.log(`Cryptocurrency ${cryptocurrencyId} price fetched successfully!`);

        return cryptocurrencyPrice;
    }
}

export default CoingeckoHelper;