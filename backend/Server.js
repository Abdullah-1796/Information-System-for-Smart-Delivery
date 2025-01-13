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



app.post("/L", (req, res) => {
  const data = req.body;
  const str = `INSERT INTO deliveryBox ("address", "city", "province") VALUES ($1, $2, $3) RETURNING "lockerid"`;

  db.query(str, [data.address, data.city, data.province], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }
    const insertedId = result.rows[0].lockerid;
    addcompartment(insertedId, data.small, data.medium, data.large)

    return res.status(201).json({ message: "Data inserted successfully", result });
  });
});
app.delete("/L", (req, res) => {
  const lockerId = req.query.lockerid;

  if (!lockerId || isNaN(lockerId)) {
    return res.status(400).json({ error: "Invalid locker ID" });
  }

  const query = "DELETE FROM deliveryBox WHERE lockerid = $1";
  db.query(query, [lockerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "An error occurred while deleting the locker" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Locker not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  });
});

app.put("/L", (req, res) => {
  const data = req.body;
  const str = `UPDATE deliveryBox SET address = $1, city = $2, province = $3 WHERE lockerid = $4`;

  db.query(str, [data.address, data.city, data.province, data.lockerid], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }
    return res.status(200).json({ message: "Data updated successfully", result });
  });

});

app.post("/compartment", (req, res) => {
  const { selectedType, id, noOfCompartments } = req.body;
  console.log(selectedType)
  if (selectedType === "small") {
    addcompartment(id, noOfCompartments, 0, 0)
  }
  else if (selectedType === "medium") {
    addcompartment(id, 0, noOfCompartments, 0)
  }
  else {
    addcompartment(id, 0, 0, noOfCompartments)
  }
  res.json({message:"Added Successfully"})
})

app.delete("/compartment", (req, res) => {
  const lockerId = req.query.lockerid;

  if (!lockerId || isNaN(lockerId)) {
    return res.status(400).json({ error: "Invalid locker ID" });
  }

  const query = "DELETE FROM compartment WHERE compid = $1";
  db.query(query, [lockerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "An error occurred while deleting the locker" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Locker not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  });
});

function addcompartment(lockerid, noofSmall, noofMedium, noofLarge) {
  // Define the base query for inserting a new compartment
  const query = `
    INSERT INTO compartment ("lockerid", "compstateid", "compcategoryid", "islocked", "otp")
    VALUES ($1, $2, $3, $4, $5) 
  `;

  if (noofSmall != 0) {
    for (let i = 0; i < noofSmall; i++) {
      db.query(query, [lockerid, 1, 1, true, 0], (err, result) => {
        if (err) {
          console.error("Error inserting small compartment:", err);
        } else {
          console.log("Inserted small compartment with lockerid:");
        }
      });
    }
  }

  if (noofMedium != 0) {
    for (let i = 0; i < noofMedium; i++) {
      db.query(query, [lockerid, 1, 2, true, 0], (err, result) => {
        if (err) {
          console.error("Error inserting medium compartment:", err);
        } else {
          console.log("Inserted medium compartment with lockerid:");
        }
      });
    }
  }

  if (noofLarge != 0) {
    for (let i = 0; i < noofLarge; i++) {
      db.query(query, [lockerid, 1, 3, true, 0], (err, result) => {
        if (err) {
          console.error("Error inserting large compartment:", err);
        } else {
          console.log("Inserted large compartment with lockerid:");
        }
      });
    }
  }
}
