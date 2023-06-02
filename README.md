# AWS CDK Financial Transactions Service

This project provides a financial transactions service using the AWS Cloud Development Kit (AWS CDK), AWS Lambda, and Amazon DynamoDB.

## Overview

The service allows for adding financial transactions and retrieving the current balance. A transaction can either be a deposit (positive amount) or a withdrawal (negative amount). The balance is the sum of all transactions.

## Architecture

The architecture consists of two AWS Lambda functions and one DynamoDB table:

1. `putTransaction` - a Lambda function to add a new transaction.
2. `getBalance` - a Lambda function to calculate and return the current balance.
3. `Transactions` - a DynamoDB table to store the transactions.

The Lambda functions are exposed via an API Gateway to provide a RESTful API.

## Usage

### Add a Transaction

To add a transaction, make a `POST` request to the `/transactions` endpoint with the following JSON payload:

```json
{
    "transactionId": "UUID",
    "amount": amount,
    "timestamp": "YYYY-MM-DDTHH:MM:SSZ"
}
```
Replace UUID with a unique identifier for the transaction, amount with the transaction amount (use a negative number for withdrawals), and the timestamp with the transaction timestamp.

### Get Balance
To get the current balance, make a GET request to the /balance endpoint.

### Setup
To deploy the service, you will need to have the AWS CDK installed. Then, you can use the following commands:

# Install dependencies
```bash npm install ```

# Deploy the service
```bash npm run deploy ```

This will create the necessary resources in your AWS account and output the API Gateway URL.

# Cleanup
To delete the resources, you can use the following command:
```bash npm run destroy ```