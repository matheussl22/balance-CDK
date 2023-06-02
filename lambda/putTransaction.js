const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { transactionId, amount, timestamp } = JSON.parse(event.body);

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: { transactionId, amount, timestamp }
    };

    try {
        await dynamo.put(params).promise();
        return { statusCode: 200, body: JSON.stringify({ message: 'Transação inserida com sucesso' }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Não foi possível inserir a transação' }) };
    }
};
