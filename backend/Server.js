import express from "express";
import pg from "pg";
import cors from "cors";
import bodyParser from "body-parser";

const port = 4001;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
    user: "postgres",
    host: "smartlocker.cdecc64m04m6.eu-north-1.rds.amazonaws.com",
    database: "smartLocker",
    password: "amazonwebservice123",
    port: 5432,
    ssl: { rejectUnauthorized: false },
    keepAlive: true
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to postgres database: ', err);
        return;
    }
    console.log('Connected to postgres database');
});

app.listen(port, () => {
    console.log(`Server is listening from port ${port}.`);
});

app.post('/postUpdates', async (req, res) => {
    const data = req.body;
    /*
    // console.log(data[0].itemName);
    for(let i = 0; i < data.length; i++)
    {
        let receiverTrackingID = "123456";
        let riderTrackingID = "123456";
        let dimension = "small";

        const query = "insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, dimensionID, receiverTrackingID, riderTrackingID) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
        const values = [data[i].itemName, data[i].sname, data[i].sphone, data[i].semail, data[i].rname, data[i].rphone, data[i].remail, dimension, receiverTrackingID, riderTrackingID];
        
        try {
            const result = await db.query(query, values);

            console.log(result.rowCount);
        }
        catch(err) {
            console.error("Error while writing data: ", err.message);
            res.status(500).send({message: "Error in insertion: " + err.message});
            break;
        }
    }
    res.status(200).send({message: "Data inserted successfully"});
    */
    const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, dimensionID, receiverTrackingID, riderTrackingID) values
    ${data.map((d, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`)}
    `;

    //console.log(query1);
    let receiverTrackingID = "123456";
    let riderTrackingID = "123456";
    let dimension = "small";

    const values = data.flatMap((d) => [
        d.itemName,
        d.sname,
        d.sphone,
        d.semail,
        d.rname,
        d.rphone,
        d.remail,
        dimension,
        receiverTrackingID,
        riderTrackingID
    ]);

    try {
        const result = await db.query(query, values);
        console.log(result.rowCount);
        res.status(200).send({message: 'Rows Successfully inserted: ' + result.rowCount});
    } catch (error) {
        console.error("Error while insertion: " + error.message);
        res.status(500).send({message: "Error while insertion: " + error.message});
    }
});

app.get('/getUpdates', async (req, res) => {
    const query = "select * from parcelForDelivery";

    try {
        const result = await db.query(query);
        console.log({rowCount: result.rowCount, rows: result.rows});
        res.status(200).send({
            message: "Data fetched successfully",
            rowCount: result.rowCount,
            rows: result.rows
        });
    } catch (error) {
        console.error("Error while fetching: " + error.message);
        res.status(500).send("Error while fetching: " + error.message);
    }
});