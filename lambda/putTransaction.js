const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

exports.handler = async (event) => {
    const { transactionId, amount, timestamp } = JSON.parse(event.body);

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: { transactionId, amount, timestamp }
    };

    const sqsParams = {
        MessageBody: JSON.stringify({ transactionId, amount }),
        QueueUrl: process.env.QUEUE_URL
    };

    try {
        await dynamo.put(params).promise();

        // Buscar todas as transações e calcular o saldo
        const scanParams = {
            TableName: process.env.TABLE_NAME,
            Select: "ALL_ATTRIBUTES"
        };

        const data = await dynamo.scan(scanParams).promise();
        const balance = data.Items.reduce((acc, transaction) => acc + transaction.amount, 0);
        console.log(`Saldo atual: ${balance}`);

        // Enviar o saldo atualizado para o SQS
        sqsParams.MessageBody = JSON.stringify({ transactionId, balance });

        await sqs.sendMessage(sqsParams).promise();

        return { statusCode: 200, body: JSON.stringify({ message: 'Transação inserida com sucesso' }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Não foi possível inserir a transação' }) };
    }
};
