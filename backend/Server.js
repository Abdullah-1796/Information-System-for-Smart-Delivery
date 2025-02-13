import express, { response } from "express";
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
	const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, address, city, province, dimensionID, receiverTrackingID, riderTrackingID, status) values
    ${data.map((d, i) => `($${i * 14 + 1}, $${i * 14 + 2}, $${i * 14 + 3}, $${i * 14 + 4}, $${i * 14 + 5}, $${i * 14 + 6}, $${i * 14 + 7}, $${i * 14 + 8}, $${i * 14 + 9}, $${i * 14 + 10}, $${i * 14 + 11}, $${i * 14 + 12}, $${i * 14 + 13}, $${i * 14 + 14})`)}`;



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
		const id = Date.now() + Math.floor(Math.random() * 1000);
		let receiverTrackingID = id + 1;
		let riderTrackingID = id + 2;
		const status = "selectionPending";

		const message = "Hi, Kindly select your delivery box for your item " + d.itemName + " with your tracking id " + receiverTrackingID;

		//sending message

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
			riderTrackingID,
			status
		)
	}));

	//console.log(values);
	try {
		const result = await db.query(query, values);
		console.log("rows inserted after SP's post api: " + result.rowCount);
		res.status(200).send({ message: 'Rows Successfully inserted: ' + result.rowCount });
	} catch (error) {
		console.error("Error while insertion: " + error.message);
		res.status(500).send({ message: "Error while insertion: " + error.message });
	}
});

app.get('/getUpdates', async (req, res) => {
	const query = "select * from parcelForDelivery where status = 'selectionDone';";

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

app.get('/parcelToDeliver/Details', async (req, res) => {
	const trackingID = req.query.trackingID;

	const str = "select p.lockerid, p.compid, p.itemname, p.sname, p.rname, p.address, p.city, p.province, c.otp from (select lockerid, compid, itemname, sname, rname, address, city, province, status from parcelfordelivery where ridertrackingid = '" + trackingID + "') as p inner join compartment c on p.lockerid=c.lockerid and p.compid=c.compid where p.status = 'selectionDone'";

	try {
		const result = await db.query(str);
		res.status(200).send(result);
	} catch (error) {
		res.status(500).send({ message: "Error while getting parcel details for rider to deliver: " + error });
	}

});

app.get('/availableLockers', async (req, res) => {
	const trackingID = req.query.trackingID;

	//finding and matching lockers with parcel details
	const query1 = "select l.lockerid, l.compcategoryid, l.address, l.city, l.province,p.parcelid, p.itemname, p.sname, p.rname, p.rphone from (select d.lockerid, d.address, d.city, d.province, c.compcategoryid from (select lockerid, compcategoryid from compartment where compstateid = 1 and lockerid is not null group by lockerid, compcategoryid,compstateid order by lockerid, compcategoryid) as  c inner join deliverybox d on c.lockerid = d.lockerid)as l inner join parcelfordelivery p on l.address=p.address and l.city=p.city and l.province=p.province and l.compcategoryid=p.dimensionid where p.receivertrackingid = '" + trackingID + "' and p.lockerid is null order by l.lockerid;";

	try {
		const result = await db.query(query1);
		// console.log(result);
		res.status(200).send(result);
	}
	catch (error) {
		res.status(500).send({ message: "Error while fetching available Lockers: " + error.message });
	}
});

app.post('/reserveLocker', async (req, res) => {
	const lockerID = req.body.lockerID;
	const compCategoryID = req.body.compCategoryID;
	const trackingID = req.body.trackingID;
	const parcelID = req.body.parcelID;
	//console.log("Parcelid: " + parcelID);

	const q = "select compID from compartment where lockerid='" + lockerID + "' and compcategoryid=" + compCategoryID + " and compStateID=1 order by compid";
	try {
		const result = await db.query(q);
		//console.log(result.rows);
		const compid = result.rows[0].compid;

		//checking whether it is first attempt or reattempt
		const str = "select stampid from parcelForDelivery where parcelid = " + parcelID + " and stampid is not null";
		const result2 = await db.query(str);
		if(result2.rowCount == 0)
		{
			//adding timestamp for selection
			const str1 = "insert into timestamps(selection) values(now());update parcelfordelivery set stampid = (select stampid from timestamps order by stampid desc limit 1) where parcelid = " + parcelID;

			try {
				const result = await db.query(str1);
				console.log("timestamp of selection has been added");
			} catch (error) {
				console.log("Error while adding timestamp of selection: " + error);
			}
		}
		else {
			const values = {
				stampid: result2.rows[0].stampid,
			}

			await axios.put('http://localhost:4001/updateTimestamp/reAttempt', values)
			.then(response => {
				console.log(response.message);
			})
			.catch(err => {
				console.error(err);
			});
		}

		//updating status of compartment in locker to Reserved
		const values1 = {
			lockerid: lockerID,
			compid: compid,
			compstateid: 2
		}
		await axios.put('http://localhost:4002/Locker/Compartment/compstateid', values1)
			.then(response => {
				console.log(response.data);
				//res.status(200).send({message: "Locker reserved"});
			})
			.catch(err => {
				throw (err);
			});

		//updating status of compartment in locker to Reserved
		const values2 = {
			lockerid: lockerID,
			compid: compid,
			parcelid: parcelID
		}
		await axios.put('http://localhost:4002/Locker/Compartment/parcelid', values2)
			.then(response => {
				console.log(response.data);
				//res.status(200).send({message: "Locker reserved"});
			})
			.catch(err => {
				throw (err);
			});

		//updating parcelForDelivery table and setting lockerid for it
		const q1 = "update parcelForDelivery set lockerId =" + lockerID + ", compid = " + compid + " where receiverTrackingId = '" + trackingID + "'";
		const r = await db.query(q1);
		//console.log(r);

		//updating status of compartment in locker to Reserved
		//generating 4 digit random otp
		const otp = Math.floor(Math.random() * 9000);
		const values3 = {
			lockerid: lockerID,
			compid: compid,
			otp: otp
		}
		await axios.put('http://localhost:4002/Locker/Compartment/otp', values3)
			.then(response => {
				console.log(response.data + " " + otp);
			})
			.catch(err => {
				throw (err);
			});

		const values4 = {
			lockerid: lockerID,
			compid: compid,
			purpose: "receiving"
		}
		await axios.put('http://localhost:4002/Locker/Compartment/purpose', values4)
			.then(response => {
				console.log(response.data.message);
			})
			.catch(err => {
				throw (err);
			});

		const values5 = {
			parcelID: parcelID,
			status: "selectionDone"
		}
		await axios.put('http://localhost:4001/updateStatus', values5)
			.then(response => {
				console.log(response.data.message);
				res.status(200).send({ message: "Locker reserved" });
			})
			.catch(err => {
				throw (err);
			});

	} catch (error) {
		res.status(500).send({ message: "Error while reserving available Lockers: " + error.message });
	}

});

app.put('/updateStatus', async (req, res) => {
	const parcelID = req.body.parcelID;
	const status = req.body.status;

	const str = "update parcelForDelivery set status ='" + status + "' where parcelid = " + parcelID;

	try {
		const result = await db.query(str);
		res.status(200).send({ message: "Parcel status updated successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while updating status of parcel: " + error });
	}
});

app.put('/markFailDeliveries', async (req, res) => {
	const days = req.body.days;
	let failedDeliveries = 0;

	console.log("Number of days: " + days);

	const str = "select parcelid, stampid, lockerid, compid, to_char(creationtime, 'yyyy-mm-dd') as date from parcelfordelivery where status ='parcelPlaced'";

	try {
		const result = await db.query(str);
		//console.log(result);
		if (result.rowCount > 0) {
			for (let i = 0; i < result.rowCount; i++) {

				const date1 = new Date(result.rows[i].date);
				const date2 = new Date(Date.now());

				const daysWaited = (date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000);
				console.log("Days delayed: " + daysWaited);
				if (daysWaited >= days) {
					const str1 = "update parcelForDelivery set status = 'failed' where parcelid = " + result.rows[i].parcelid;

					const result1 = await db.query(str1);

					const values = {
						column: "failed",
						stampid: result.rows[i].stampid
					}
					await axios.put('http://localhost:4001/updateTimestamp', values)
						.then(response => {
							console.log(response.data.message);
						})
						.catch(err => {
							console.error("Error while updating status of parcel: " + err);
						});
					
					const otp = Math.floor(Math.random() *9000);
					const values1 = {
						lockerid: result.rows[i].lockerid,
						compid: result.rows[i].compid,
						otp: otp
					}
					axios.put('http://localhost:4002/Locker/Compartment/otp', values1)
					.then(response => {
						console.log(response.data.message);
					})
					.catch(err => {
						console.error(err);
					});

					failedDeliveries++;
				}

			}
		}
		res.status(200).send({ message: "Number of deliveries masked as failed: " + failedDeliveries });
	} catch (error) {
		res.status(500).send({ message: "Error while marking failed deliveries: " + error });
	}
});

app.get('/failedDelivery/ParcelToBring/Details', async (req, res) => {
	const trackingID = req.query.trackingID;

	const str = "select p.lockerid, p.compid, p.itemname, p.sname, p.rname, p.address, p.city, p.province, c.otp from (select lockerid, compid, itemname, sname, rname, address, city, province, status from parcelfordelivery where ridertrackingid = '" + trackingID + "') as p inner join compartment c on p.lockerid=c.lockerid and p.compid=c.compid where p.status = 'failed'";

	try {
		const result = await db.query(str);
		res.status(200).send(result);
	} catch (error) {
		res.status(500).send({ message: "Error while getting failed delivery details for rider to bring back: " + error });
	}

});

app.put('/updateTimestamp', async (req, res) => {
	const column = req.body.column;
	const stampid = req.body.stampid;

	console.log(column, stampid);
	const str = "update timestamps set " + column + "= now() where stampid=" + stampid;

	try {
		const result = await db.query(str);
		res.status(200).send({ message: "timestamp of " + column + " has been updated" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while updating timestamp of " + column + ": " + error });
	}
});

app.put('/updateTimestamp/reAttempt', async (req, res) => {
	const stampid = req.body.stampid;

	console.log(stampid);
	const str = "update timestamps set reattempt= now(), placement = null where stampid=" + stampid;

	try {
		const result = await db.query(str);
		res.status(200).send({ message: "timestamp of reattempt has been updated" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while updating timestamp of reattempt: " + error });
	}
});

app.get('/checkEligibility/ReDelivery', async (req, res) => {
	const trackingID = req.query.trackingID;
	//console.log(trackingID);

	const str = "select parcelid, p.stampid, p.lockerid, p.compid from (select parcelid, stampid, lockerid, compid from parcelfordelivery where receiverTrackingID='"+ trackingID +"') as p inner join timestamps t on p.stampid=t.stampid where t.failed is not null and t.reattempt is null";

	try {
		const result = await db.query(str);
		//console.log(result);
		if(result.rowCount == 1)
		{
			res.status(200).send({message: "Eligibility Confirmed", eligible: true, stampid: result.rows[0].stampid, lockerid: result.rows[0].lockerid, compid: result.rows[0].compid, parcelid: result.rows[0].parcelid});
		}
		else {
			res.status(200).send({message: "Eligibility Denied", eligible: false});
		}
	} catch (error) {
		console.log("Error while checking eligibility for rescheduling" + error);
		res.status(500).send({message: "Error while checking eligibility for rescheduling" + error});
	}
});

app.put("/parcelForDelivery/updateLockerID", (req, res) => {
    let parcelID = req.body.parcelID;

    const str = "update parcelForDelivery set lockerid = null, compid = null where parcelid = " + parcelID;

    db.query(str, (err, data) => {
        if (err) {
            return res.json("Error");
        }
        return res.json("Locker ID and CompID updated");
    });
});

app.get("/checkParcelInLocker", async (req, res) => {
	const trackingID = req.query.trackingID;

	const str = "select d.lockerid, p.compid, d.address, d.city, d.province from (select lockerid, compid from parcelfordelivery where receivertrackingid = '"+ trackingID +"' and lockerid is not null) as p inner join deliverybox d on p.lockerid=d.lockerid";

	try {
		const result = await db.query(str);
		res.status(200).send(result);
	} catch (error) {
		
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

// app.post('/postUpdates', async (req, res) => {
//   const data = req.body;
//   const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, dimensionID, receiverTrackingID, riderTrackingID) values
//     ${data.map((d, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`)}
//     `;

//   let receiverTrackingID = "123456";
//   let riderTrackingID = "123456";
//   let dimension = "small";

//   const values = data.flatMap((d) => [
//     d.itemName,
//     d.sname,
//     d.sphone,
//     d.semail,
//     d.rname,
//     d.rphone,
//     d.remail,
//     dimension,
//     receiverTrackingID,
//     riderTrackingID
//   ]);

//   try {
//     const result = await db.query(query, values);
//     console.log(result.rowCount);
//     res.status(200).send({ message: 'Rows Successfully inserted: ' + result.rowCount });
//   } catch (error) {
//     console.error("Error while insertion: " + error.message);
//     res.status(500).send({ message: "Error while insertion: " + error.message });
//   }
// });

// app.get('/getUpdates', async (req, res) => {
//   const query = "select * from parcelForDelivery";

//   try {
//     const result = await db.query(query);
//     console.log({ rowCount: result.rowCount, rows: result.rows });
//     res.status(200).send({
//       message: "Data fetched successfully",
//       rowCount: result.rowCount,
//       rows: result.rows
//     });
//   } catch (error) {
//     console.error("Error while fetching: " + error.message);
//     res.status(500).send("Error while fetching: " + error.message);
//   }
// });



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
	res.json({ message: "Added Successfully" })
});

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

// Route to add a new parcel for the Sender
app.post("/sendParcel", async (req, res) => {
  try {
    const {
      itemName,
      sname,
      sphone,
      semail,
      rname,
      rphone,
      remail,
      address,
      city,
      province,
      dimensionID,
      receiverTrackingID,
      riderTrackingID,
      lockerID,
      compID,
      status,
      stampid,
    } = req.body;

    const query = `
      INSERT INTO SendParcel (
        itemName, sname, sphone, semail, rname, rphone, remail, address, city, 
        province, dimensionID, receiverTrackingID, riderTrackingID, lockerID, compID, status, stampid
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *;
    `;

    const values = [
      itemName,
      sname,
      sphone,
      semail,
      rname,
      rphone,
      remail,
      address,
      city,
      province,
      dimensionID,
      receiverTrackingID,
      riderTrackingID,
      lockerID,
      compID,
      status,
      stampid,
    ];

    const result = await db.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error("Error inserting parcel:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//route to get parcel lockers based on city
app.get("/getlockers", async (req, res) => {
  try {
    const { city, compcategoryid } = req.query; // Get both query parameters
    if (!city || !compcategoryid) {
      return res.status(400).json({ success: false, message: "City and compcategoryid are required" });
    }

    const query = `SELECT * FROM deliveryBox d 
                   INNER JOIN compartment c 
                   ON d.lockerID = c.lockerID 
                   WHERE d.city = $1 AND c.compcategoryid = $2`;

    const { rows } = await db.query(query, [city, compcategoryid]); // Pass both parameters

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error getting Delivery Boxes: ", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});


