const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

exports.handler = async (event) => {
    const { Records } = event;
    if (!Records) {
        return { statusCode: 400, body: 'Bad request' };
    }

    for (const record of Records) {
        const { body } = record;
        console.log(JSON.parse(body));
        const { transactionId, balance } = JSON.parse(body);

        const params = {
            TableName: process.env.BALANCE_TABLE_NAME,
            Item: { transactionId, balance: balance }
        };

        try {
            await dynamo.put(params).promise();

            await sqs.deleteMessage({
                QueueUrl: process.env.QUEUE_URL,
                ReceiptHandle: record.receiptHandle
            }).promise();
        } catch (error) {
            console.error(error);
            return { statusCode: 500, body: JSON.stringify({ error: 'Não foi possível atualizar o saldo' }) };
        }
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Saldo atualizado com sucesso' }) };
};
