# Nimo Test Exercise

## Business Requirement

Create two serverless microservices:

1. The first one fetches the current price of a specified cryptocurrency and sends an email.
2. The second one retrieves search history from the first microservice.

## Solution

![img](architecture-diagram.png)

- AWS cloud + Region - To host cloud resources
- VPC + Subnet + Security group - To isolate the lambda functions
- Internet gateway + Routing table - To provide internet access to lambda functions
- API gateway - To hide lambda functions from outside and invoke relevant lambda function based on incoming requests
- DynamoDB - To store previous cryptocurrency price queries
- Simple email service - To send cryptocurrency price query results
- Cognito user pool - To provide authentication
- Coingecko API - To fetch cryptocurrency prices

Notes - For this solution AWS free tier and Coingecko demo API was used! 

## API Documentation

1. Get cryptocurrency current price
2. Get search history

## Improvements

Following improvements are planned.

1. Put Lambdas to a VPC from default VPC
2. Implement CICD
3. Put Lambdas in a private subnet and open to internet via NAT gateway
4. Promote more minimum priviledge in IAM Roles
5. Refactor SAM templates and source code (structure, variable names, readability, add more logs, etc)
6. Add missing outputs to SAM template
7. Add unit tests and automated tests
8. Improve source code (introduce pagination, improve request response, etc)