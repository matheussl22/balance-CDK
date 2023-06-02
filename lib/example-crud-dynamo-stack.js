const { Stack, RemovalPolicy } = require('aws-cdk-lib');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { Table, AttributeType } = require('aws-cdk-lib/aws-dynamodb');

class ExampleCrudDynamoStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const transactionsTable = new Table(this, 'Transactions', {
      partitionKey: {
        name: 'transactionId',
        type: AttributeType.STRING,
      },
      tableName: 'Transactions',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const putTransactionFn = new Function(this, 'PutTransaction', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'putTransaction.handler',
      environment: {
        TABLE_NAME: transactionsTable.tableName,
      },
    });

    const getBalanceFn = new Function(this, 'GetBalance', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'getBalance.handler',
      environment: {
        TABLE_NAME: transactionsTable.tableName,
      },
    });

    transactionsTable.grantReadWriteData(putTransactionFn);
    transactionsTable.grantReadData(getBalanceFn);

    const api = new RestApi(this, 'TransactionsApi', {
      restApiName: 'TransactionServiceApi',
    });

    const transactions = api.root.addResource('transactions');
    transactions.addMethod('POST', new LambdaIntegration(putTransactionFn));

    const balance = api.root.addResource('balance');
    balance.addMethod('GET', new LambdaIntegration(getBalanceFn));

  }

}

module.exports = { ExampleCrudDynamoStack }
