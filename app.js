const express = require('express');
const app = express();
const PORT = 3000;
const ROOT_DIRECTORY = './';
app.get('/hello', (req, res) => res.send('Hello World!'));

const SCHEMA_NAME = "inventory";
const TABLE_NAME = "items";
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
    database: SCHEMA_NAME,
    supportBigNumbers: true     // Database uses DECIMAL for the amount
});

// Static pages
app.use('/static',express.static('resources'))
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: ROOT_DIRECTORY});
});
app.get('/mvp', (req, res) => {
    res.sendFile('mvp.html', {root: ROOT_DIRECTORY});
});

// API
const ejs = require('ejs');
app.get('/inventory', (req, res, next) => {
    if (isObjectEmpty(req.query) === false) {
        return next();
    }
    // If nothing else is asked, query all inventory here
    const query = `SELECT * FROM \`${TABLE_NAME}\``;
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
    if (req.query.id != null && req.query.id != "") {
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
        if (req.query.quantityCompare != "") switch (req.query.quantityCompare) {
            case 'exact':
            default: {
                whereClause = whereClause.concat(`qty = ?`);
                break;
            }
            case 'less': {
                whereClause = whereClause.concat(`qty < ?`);
                break;
            }
            case 'greater': {
                whereClause = whereClause.concat(`qty > ?`);
                break;
            }
        }
        values[values.length] = req.query.quantity;
    }

    if (req.query.amount != "") {
        if (whereClause !== '') whereClause = whereClause.concat(' AND ');
        if (req.query.amountCompare != "") switch (req.query.amountCompare) {
            case 'exact':
            default: {
                whereClause = whereClause.concat('amount = ?');
                break;
            }
            case 'less': {
                whereClause = whereClause.concat('amount < ?');
                break;
            }
            case 'greater': {
                whereClause = whereClause.concat('amount > ?');
                break;
            }
        }
        values[values.length] = req.query.amount;
    }

    const query = `SELECT * FROM \`${TABLE_NAME}\` WHERE ${whereClause}`;
    inventoryConnection.query(query, values, function (error, results, fields) {
        if (error) {
            console.log(error.sqlMessage);
            res.sendStatus(500);
            return;
        }
        res.status(200).send(results);
    });
});

app.use(express.urlencoded({extended: false}));
app.post('/inventory', (req, res) => {
    if (isObjectEmpty(req.body)) {
        res.sendStatus(501);    // "Not implemented"
    }
    else if (req.body.name == '' || req.body.quantity == '' || req.body.amount == '') {
        res.sendStatus(400);    // Not enough information was provided
    }
    const command = `INSERT INTO ${TABLE_NAME} (\`name\`, \`qty\`, \`amount\`)`
        +' VALUES (?, ?, ?)';
    const values = [req.body.name, req.body.quantity, req.body.amount];
    inventoryConnection.query(command, values, function (error, results, fields) {
        if (error) {
            console.log(error.sqlMessage);
            res.sendStatus(500);    // Represents a server-based error
            return;
        }
        if (req.body.makeMvpElement === "true") {
            const insertedId = results.insertId;
            inventoryConnection.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, insertedId, (error, results, fields) => {
                if (error) {
                    console.log(error.sqlMessage);
                    return;
                }
                ejs.renderFile('./resources/itemsTableRow.ejs', {
                    results: results,
                    tableHeader: {
                        name: "Name",
                        quantity: "Quantity",
                        amount: "Amount"
                    },
                    emptyMessage: "No results found.",
                    successMessage: "Item successfully inserted!"
                }).then((compiledString) => {
                    res.status(201).send(compiledString);
                }).catch((errorReason) => {
                    console.log(errorReason);
                    res.status(201).send(new String().concat('<table>',
                    '<thead><tr><th>Column inserted!</th></tr></thead>', '<tr>',
                    '<td>The column was successfully inserted, but the server could not reproduce your input.</td>',
                    '</tr>', '</table>'));
                });
            });
        }
        else res.sendStatus(201)    // "Created"
    });
});

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));
