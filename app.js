const express = require('express');
const app = express();
const port = 3000;
app.get('/hello', (req, res) => res.send('Hello World!'));

const schemaName = "inventory";
const tableName = "items";
function isObjectEmpty(obj) {
    // See https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object#32108184
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

const mysql = require('mysql');
const inventoryConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'inventory',
    password: '123',
    database: schemaName,
    supportBigNumbers: true     // Database uses DECIMAL for the amount
});

app.get('/inventory', (req, res, next) => {
    if (isObjectEmpty(req.query) === false) {
        return next();
    }
    // If nothing else is asked, query all inventory here
    const query = `SELECT * FROM \`${tableName}\``;
    inventoryConnection.query(query, function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            console.log(error.sqlMessage);
            res.sendStatus(500);    // Represents a server-based error
            return;
        }
        res.status(200).send(results);
    });
}, (req, res) => {
    // Prepare specific query
    let whereClause = '';
    let values = [];
    if (req.query.id != "") {
        if (whereClause !== '') whereClause = whereClause.concat(' AND ');
        whereClause = whereClause.concat('id = ?');
        values[values.length] = req.query.id;
    }

    if (req.query.name != "") {
        if (whereClause !== '') whereClause = whereClause.concat(' AND ');
        whereClause = whereClause.concat('name LIKE ?');
        values[values.length] = `%${req.query.name}%`;
    }

    if (req.query.quantity != "") {
        if (whereClause !== '') whereClause = whereClause.concat(' AND ');
        whereClause = whereClause.concat(`qty = ?`);
        values[values.length] = req.query.quantity;
    }
    else {
        if (req.query.quantityLt != "") {
            if (whereClause !== '') whereClause = whereClause.concat(' AND ');
            whereClause = whereClause.concat('qty < ?');
            values[values.length] = req.query.quantityLt;
        }
        if (req.query.quantityGt != "") {
            if (whereClause !== '') whereClause = whereClause.concat(' AND ');
            whereClause = whereClause.concat('qty > ?');
            values[values.length] = req.query.quantityGt;
        }
    }

    if (req.query.amount != "") {
        if (whereClause !== '') whereClause = whereClause.concat(' AND ');
        whereClause = whereClause.concat('amount = ?');
        values[values.length] = req.query.amount;
    }
    else {
        if (req.query.amountLt != "") {
            if (whereClause !== '') whereClause = whereClause.concat(' AND ');
            whereClause = whereClause.concat('amount < ?');
            values[values.length] = req.query.amountLt;
        }
        if (req.query.amountGt != "") {
            if (whereClause !== '') whereClause = whereClause.concat(' AND ');
            whereClause = whereClause.concat('amount > ?');
            values[values.length] = req.query.amountGt;
        }
    }

    const query = `SELECT * FROM \`${tableName}\` WHERE ${whereClause}`;
    inventoryConnection.query(query, values, function (error, results, fields) {
        if (error) {
            console.log(error.sqlMessage);
            res.sendStatus(500);
            return;
        }
        res.status(200).send(results);
    });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
