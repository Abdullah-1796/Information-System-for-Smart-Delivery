import express from "express";
import pg from "pg";
import cors from "cors";
import bodyParser from "body-parser";
import fs from 'fs';
import path from "path";
import twilio from "twilio";
import axios from "axios";


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

async function sendSMS(message, to) {

    await client.messages
        .create({
            body: message,
            from: phone,
            to: to,
        })
        .then((message) => res.status(200).send({ message: `Message sent with SID: ${message.sid}` }))
        .catch((error) => res.status(500).send({ message: `Failed to send SMS: ${error.message}` }));
}


app.post('/postUpdates', async (req, res) => {
    const data = req.body;
    const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, address, city, province, dimensionID, receiverTrackingID, riderTrackingID) values
    ${data.map((d, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`)}`;



    const values = [];
    await Promise.all(data.flatMap(async (d) => {

        //setting dimension
        let dimension = "1";
        if (d.weight > 3000 && d.weight < 10001) {
            dimension = "2";
        }
        else if (d.weight > 10000 && d.weight < 20000) {
            dimension = "3";
        }

        //generating tracking ids
        let receiverTrackingID = d.rphone + d.sphone + 1;
        let riderTrackingID = d.rphone + d.sphone + 2;

        const message = "Hi, Kindly select your delivery box for your item "+ d.itemName +" with your tracking id " + receiverTrackingID;

        //sending message

        await client.messages
            .create({
                body: message,
                from: phone,
                to: d.rphone,
            })
            // .then((message) => res.status(200).send({ message: `Message sent with SID: ${message.sid}` }))
            // .catch((error) => res.status(500).send({ message: `Failed to send SMS: ${error.message}` }));

        values.push(
            d.itemName,
            d.sname,
            d.sphone,
            d.semail,
            d.rname,
            d.rphone,
            d.remail,
            d.address,
            d.city,
            d.province,
            dimension,
            receiverTrackingID,
            riderTrackingID
        )
    }));

    console.log(values);
    try {
        const result = await db.query(query, values);
        console.log(result.rowCount);
        res.status(200).send({ message: 'Rows Successfully inserted: ' + result.rowCount });
    } catch (error) {
        console.error("Error while insertion: " + error.message);
        res.status(500).send({ message: "Error while insertion: " + error.message });
    }
});

app.get('/getUpdates', async (req, res) => {
    const query = "select * from parcelForDelivery";

    try {
        const result = await db.query(query);
        console.log({ rowCount: result.rowCount, rows: result.rows });
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

app.get('/availableLockers', async (req, res) => {
    const trackingID = req.query.trackingID;
    const query = "select address, city, dimensionID from parcelForDelivery where receiverTrackingID='" + trackingID + "'";
    let address, city, dimensionID;
    try {
        const result = await db.query(query);
        address = result.rows[0].address;
        city = result.rows[0].city;
        dimensionID = result.rows[0].dimensionid;
    }
    catch (error) {
        res.status(500).send({message: "Error1 while fetching available Lockers: " + error.message});
    }
    
    console.log(address, city, dimensionID);
    const query1 = "select d.lockerID, d.address, d.city, compCategoryID from deliveryBox d inner join compartment c on d.lockerID=c.lockerID where d.address='" + address + "' and d.city='" + city +"' and c.compCategoryID=" + dimensionID + " and c.compStateID=1 group by d.lockerID, compCategoryID";

    try {
        const result = await db.query(query1);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(500).send({message: "Error2 while fetching available Lockers: " + error.message});
    }
});

app.post('/reserveLocker', async (req, res) => {
    const lockerID = req.body.lockerID;
    const compCategoryID = req.body.compCategoryID;
    console.log(compCategoryID);

    const q = "select compID from compartment where lockerid='" + lockerID + "' and compcategoryid=" + compCategoryID + " order by compid";
    try {
        const result = await db.query(q);
        console.log(result.rows);
        const compid = result.rows[0].compid;

        const values = {
            lockerid: lockerID,
            compid: compid,
            compstateid: 2
        }

        await axios.put('http://localhost:4002/Locker/Compartment/compstateid', values)
        .then(response => {
            console.log(response.data);
            res.status(200).send({message: "Locker reserved"});
        })
        .catch(err => {
            throw(err);
        });
        
    } catch (error) {
        res.status(500).send({message: "Error while reserving available Lockers: " + error.message});
    }

})

//---------------------------------------------------------------------------------------------------
app.get('/api/delivery-boxes', (req, res) => {
    const filePath = path.join('./src/compartments.json'); // Use import.meta.url for ES modules
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ error: 'Failed to load data' });
        }
        const deliveryBoxes = JSON.parse(data);
        res.json(deliveryBoxes);
    });
});
const parcels = [
    {
        id: "1",
        size: "medium",
        weight: "2kg",
        location: {
            address: "Location A",
            latitude: 37.78825,
            longitude: -122.4324
        },
        receiver: {
            name: "John Doe",
            contact: "123-456-7890",
            email: "johndoe@example.com"
        },
        status: "Pending",
        deliveryDate: "2025-01-10"
    },
    {
        id: "2",
        size: "large",
        weight: "5kg",
        location: {
            address: "Location B",
            latitude: 37.78925,
            longitude: -122.4354
        },
        receiver: {
            name: "Jane Smith",
            contact: "987-654-3210",
            email: "janesmith@example.com"
        },
        status: "Shipped",
        deliveryDate: "2025-01-12"
    }
];

// Endpoint to get parcel details by parcel ID
app.get('/api/parcel/:id', async (req, res) => {
    const parcelId = req.params.id; // Get the parcel ID from the request parameters

    try {
        // Query the database for the parcel with the given ID
        const query = "SELECT * FROM parcelForDelivery WHERE parcelid = $1";
        const result = await db.query(query, [parcelId]);

        // Check if a parcel was found
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]); // Return the first (and only) matching parcel
        } else {
            res.status(404).json({ message: "Parcel not found" }); // Parcel not found
        }
    } catch (error) {
        console.error("Error while fetching parcel:", error.message);
        res.status(500).json({ message: "Error while fetching parcel: " + error.message }); // Internal server error
    }
});