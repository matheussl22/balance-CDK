const { Stack, RemovalPolicy, Duration} = require('aws-cdk-lib');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { Table, AttributeType } = require('aws-cdk-lib/aws-dynamodb');
const { Queue } = require('aws-cdk-lib/aws-sqs');
const {SqsEventSource} = require("aws-cdk-lib/aws-lambda-event-sources");

class Balance extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const transactionsQueue = new Queue(this, 'TransactionsQueue', {
      visibilityTimeout: Duration.seconds(30)  // customize as needed
    });

    const balanceTable = new Table(this, 'Balance', {
      partitionKey: {
        name: 'transactionId',
        type: AttributeType.STRING,
      },
      tableName: 'Balance',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const updateBalanceFn = new Function(this, 'UpdateBalance', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'updateBalance.handler',
      environment: {
        BALANCE_TABLE_NAME: balanceTable.tableName,
        QUEUE_URL: transactionsQueue.queueUrl,
      },
    });

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
        QUEUE_URL: transactionsQueue.queueUrl,
      },
    });

    const getBalanceFn = new Function(this, 'GetBalance', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'getBalance.handler',
      environment: {
        BALANCE_TABLE_NAME: balanceTable.tableName,
      },
    });

    transactionsTable.grantReadWriteData(putTransactionFn);
    transactionsTable.grantReadData(getBalanceFn);
    balanceTable.grantReadWriteData(getBalanceFn);
    balanceTable.grantReadWriteData(updateBalanceFn);
    transactionsQueue.grantConsumeMessages(updateBalanceFn);
    transactionsQueue.grantSendMessages(putTransactionFn);
    updateBalanceFn.addEventSource(new SqsEventSource(transactionsQueue));

    const api = new RestApi(this, 'TransactionsApi', {
      restApiName: 'TransactionServiceApi',
    });

    const transactions = api.root.addResource('transactions');
    transactions.addMethod('POST', new LambdaIntegration(putTransactionFn));

    const balance = api.root.addResource('balance');
    balance.addMethod('GET', new LambdaIntegration(getBalanceFn));

  }

}

module.exports = { Balance: Balance }
