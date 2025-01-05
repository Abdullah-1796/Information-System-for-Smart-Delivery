import express from "express";
import pg from "pg";
import cors from "cors";
import bodyParser from "body-parser";
import fs from 'fs';
import path from "path";
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
  app.get('/api/parcel/:id', (req, res) => {
    const parcelId = req.params.id;
    
    // Find the parcel by ID
    const parcel = parcels.find(p => p.id === parcelId);
  
    if (parcel) {
      res.status(200).json(parcel);
    } else {
      res.status(404).json({ message: "Parcel not found" });
    }
  });
app.post('/postUpdates', async (req, res) => {
    const data = req.body;
    const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, dimensionID, receiverTrackingID, riderTrackingID) values
    ${data.map((d, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`)}
    `;

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