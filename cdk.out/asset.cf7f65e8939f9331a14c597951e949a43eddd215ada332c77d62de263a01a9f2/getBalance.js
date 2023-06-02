const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async () => {
    const params = {
        TableName: process.env.TABLE_NAME,
        Select: "ALL_ATTRIBUTES"
    };

    try {
        const data = await dynamo.scan(params).promise();
        const balance = data.Items.reduce((acc, transaction) => acc + transaction.amount, 0);
        return { statusCode: 200, body: JSON.stringify({ balance }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Não foi possível buscar o saldo' }) };
    }
};
