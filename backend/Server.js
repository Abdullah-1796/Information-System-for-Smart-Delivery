import express, { response } from "express";
import db from "./database.js"
import cors from "cors";
import bodyParser from "body-parser";
import fs from 'fs';
import path from "path";
import twilio from "twilio";
import axios from "axios";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc"
import postandgetUpdate from "./Routes/post&getUpdates.js"
import parceldetails from "./Routes/getparcelToDeliverDetails.js"
import LockerCRUD from "./Routes/lockerCRUD.js"
import updateStatus from "./Routes/updateStatus.js"
import failedDeliveries from "./Routes/failedDeliveries.js"
import updateTimestamp from "./Routes/updateTimestamp.js"
import checkforRedelivery from "./Routes/checkingEligibilityForRedelivery.js"
import checkforDelivery from "./Routes/checkingEligibilityForDelivery.js"
import checkParcel from "./Routes/checkParcelinLocker.js";
import deliveryBox from "./Routes/deliveryBoxCRUD.js"
import compartmentCRUD from "./Routes/compartmentCRUD.js"
import sendParcel from "./Routes/sendParcel.js"
import getPending from "./Routes/getParcels/getPending.js";
import getDelivered from "./Routes/getParcels/getDelivered.js";
import getPlaced from "./Routes/getParcels/getPlaced.js";
import parcelToReceive from "./Routes/getDetailsOfReceivingParcel.js"
import checkforRePickup from "./Routes/checkingEligibilityForRePickup.js"
import checkParcelSender from "./Routes/checkParcelinLockerforSender.js";
import updateStatusSender from "./Routes/updateLockerIdforSender.js"


const port = 4001;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const swaggerOptions = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Smart Locker API",
			version: "1.0.0",
			description: "API documentation for Smart Locker system",
		},
	},
	apis: ["./server.js"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



// const db = new pg.Client({
// 	user: "postgres",
// 	host: "smartlocker.cdecc64m04m6.eu-north-1.rds.amazonaws.com",
// 	database: "smartLocker",
// 	password: "amazonwebservice123",
// 	port: 5432,
// 	ssl: { rejectUnauthorized: false },
// 	keepAlive: true
// });

// db.connect((err) => {
// 	if (err) {
// 		console.error('Error connecting to postgres database: ', err);
// 		return;
// 	}
// 	console.log('Connected to postgres database');
// });

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

/**
 * @swagger
 * /postUpdates:
 *   post:
 *     summary: Insert multiple parcel deliveries into the database
 *     tags:
 *       - Parcel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 itemName:
 *                   type: string
 *                 sname:
 *                   type: string
 *                 sphone:
 *                   type: string
 *                 semail:
 *                   type: string
 *                 rname:
 *                   type: string
 *                 rphone:
 *                   type: string
 *                 remail:
 *                   type: string
 *                 address:
 *                   type: string
 *                 city:
 *                   type: string
 *                 province:
 *                   type: string
 *                 weight:
 *                   type: number
 *     responses:
 *       200:
 *         description: Rows Successfully inserted
 *       500:
 *         description: Error while insertion
 */

app.use('/postUpdates', postandgetUpdate);

/**
 * @swagger
 * /getUpdates:
 *   get:
 *     summary: Get parcels with status 'selectionDone'
 *     tags:
 *       - Parcel
 *     responses:
 *       200:
 *         description: Data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rowCount:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error while fetching data
 */
app.use('/getUpdates', postandgetUpdate);

/**
 * @swagger
 * /parcelToDeliver/Details:
 *   get:
 *     summary: Get parcel details for rider using tracking ID
 *     tags:
 *       - Parcel
 *     parameters:
 *       - in: query
 *         name: trackingID
 *         schema:
 *           type: string
 *         required: true
 *         description: Tracking ID of the parcel
 *     responses:
 *       200:
 *         description: Parcel details retrieved successfully
 *       500:
 *         description: Error while fetching parcel details
 */
app.use('/parcelToDeliver/Details', parceldetails);

/**
 * @swagger
 * /availableLockers:
 *   get:
 *     summary: Get available lockers for a parcel based on tracking ID
 *     tags:
 *       - Lockers
 *     parameters:
 *       - in: query
 *         name: trackingID
 *         schema:
 *           type: string
 *         required: true
 *         description: Receiver tracking ID of the parcel
 *     responses:
 *       200:
 *         description: Available lockers fetched successfully
 *       500:
 *         description: Error while fetching available lockers
 */
app.use('/availableLockers', LockerCRUD);

/**
 * @swagger
 * /reserveLocker:
 *   post:
 *     summary: Reserve a locker for parcel delivery
 *     tags:
 *       - Lockers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lockerID:
 *                 type: string
 *                 description: The ID of the locker to reserve
 *               compCategoryID:
 *                 type: integer
 *                 description: The compartment category ID
 *               trackingID:
 *                 type: string
 *                 description: The tracking ID of the parcel
 *               parcelID:
 *                 type: integer
 *                 description: The parcel ID
 *     responses:
 *       200:
 *         description: Locker reserved successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Error while reserving locker
 */
app.use('/reserveLocker', LockerCRUD);

/**
 * @swagger
 * /updateStatus:
 *   put:
 *     summary: Update the status of a parcel
 *     tags:
 *       - Parcels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parcelID:
 *                 type: integer
 *                 description: The ID of the parcel
 *               status:
 *                 type: string
 *                 description: The new status of the parcel
 *     responses:
 *       200:
 *         description: Parcel status updated successfully
 *       500:
 *         description: Error while updating status of parcel
 */
app.use('/updateStatus', updateStatus);

/**
 * @swagger
 * /markFailDeliveries:
 *   put:
 *     summary: Mark deliveries as failed if not picked up within a given number of days
 *     tags:
 *       - Deliveries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 description: Number of days after which a parcel is marked as failed
 *     responses:
 *       200:
 *         description: Number of deliveries marked as failed
 *       500:
 *         description: Error while marking failed deliveries
 */
app.use('/markFailDeliveries', failedDeliveries);

/**
 * @swagger
 * /failedDelivery/ParcelToBring/Details:
 *   get:
 *     summary: Retrieve details of failed deliveries for rider to bring back
 *     tags:
 *       - Deliveries
 *     parameters:
 *       - in: query
 *         name: trackingID
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracking ID of the rider
 *     responses:
 *       200:
 *         description: Successfully retrieved failed delivery details
 *       500:
 *         description: Error while getting failed delivery details
 */
app.use('/failedDelivery/ParcelToBring/Details', failedDeliveries);

/**
 * @swagger
 * /updateTimestamp:
 *   put:
 *     summary: Update a specific timestamp entry
 *     tags:
 *       - Timestamps
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               column:
 *                 type: string
 *                 description: The column name to update
 *               stampid:
 *                 type: integer
 *                 description: The ID of the timestamp record
 *     responses:
 *       200:
 *         description: Timestamp updated successfully
 *       500:
 *         description: Error while updating timestamp
 */
app.use('/updateTimestamp', updateTimestamp);

/**
 * @swagger
 * /checkEligibility/ReDelivery:
 *   get:
 *     summary: Check eligibility for redelivery of a failed parcel
 *     tags:
 *       - Parcels
 *     parameters:
 *       - in: query
 *         name: trackingID
 *         required: true
 *         schema:
 *           type: string
 *         description: Receiver's tracking ID
 *     responses:
 *       200:
 *         description: Eligibility check completed
 *       500:
 *         description: Error while checking eligibility
 */
app.use('/checkEligibility/ReDelivery', checkforRedelivery);

app.use('/checkEligibility/Delivery', checkforDelivery);

/**
 * @swagger
 * /parcelForDelivery/updateLockerID:
 *   put:
 *     summary: Update locker ID and compartment ID for a parcel
 *     tags:
 *       - Parcels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parcelID:
 *                 type: integer
 *                 description: The ID of the parcel
 *     responses:
 *       200:
 *         description: Locker ID and Compartment ID updated successfully
 *       500:
 *         description: Error while updating locker ID and compartment ID
 */
app.use("/parcelForDelivery/updateLockerID", LockerCRUD);

/**
 * @swagger
 * /checkParcelInLocker:
 *   get:
 *     summary: Check if a parcel is present in a locker
 *     tags:
 *       - Lockers
 *     parameters:
 *       - in: query
 *         name: trackingID
 *         required: true
 *         schema:
 *           type: string
 *         description: Receiver's tracking ID
 *     responses:
 *       200:
 *         description: Parcel details retrieved successfully
 *       500:
 *         description: Error while checking parcel in locker
 */
app.use("/checkParcelInLocker", checkParcel)

//---------------------------------------------------------------------------------------------------
// app.get('/api/delivery-boxes', (req, res) => {
// 	const filePath = path.join('./src/compartments.json'); // Use import.meta.url for ES modules
// 	fs.readFile(filePath, 'utf8', (err, data) => {
// 		if (err) {
// 			console.error('Error reading JSON file:', err);
// 			return res.status(500).json({ error: 'Failed to load data' });
// 		}
// 		const deliveryBoxes = JSON.parse(data);
// 		res.json(deliveryBoxes);
// 	});
// });


// // Endpoint to get parcel details by parcel ID
// app.get('/api/parcel/:id', async (req, res) => {
// 	const parcelId = req.params.id; // Get the parcel ID from the request parameters

// 	try {
// 		// Query the database for the parcel with the given ID
// 		const query = "SELECT * FROM parcelForDelivery WHERE parcelid = $1";
// 		const result = await db.query(query, [parcelId]);

// 		// Check if a parcel was found
// 		if (result.rows.length > 0) {
// 			res.status(200).json(result.rows[0]); // Return the first (and only) matching parcel
// 		} else {
// 			res.status(404).json({ message: "Parcel not found" }); // Parcel not found
// 		}
// 	} catch (error) {
// 		console.error("Error while fetching parcel:", error.message);
// 		res.status(500).json({ message: "Error while fetching parcel: " + error.message }); // Internal server error
// 	}
// });

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


/**
 * @swagger
 * /L:
 *   post:
 *     summary: Add a new locker
 *     tags:
 *       - Lockers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: Locker address
 *               city:
 *                 type: string
 *                 description: Locker city
 *               province:
 *                 type: string
 *                 description: Locker province
 *               small:
 *                 type: integer
 *                 description: Number of small compartments
 *               medium:
 *                 type: integer
 *                 description: Number of medium compartments
 *               large:
 *                 type: integer
 *                 description: Number of large compartments
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *       500:
 *         description: Database error
 * 
 *   put:
 *     summary: Update locker details
 *     tags:
 *       - Lockers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lockerid:
 *                 type: integer
 *                 description: Locker ID to update
 *               address:
 *                 type: string
 *                 description: Updated locker address
 *               city:
 *                 type: string
 *                 description: Updated locker city
 *               province:
 *                 type: string
 *                 description: Updated locker province
 *     responses:
 *       200:
 *         description: Data updated successfully
 *       500:
 *         description: Database error
 * 
 *   delete:
 *     summary: Delete a locker
 *     tags:
 *       - Lockers
 *     parameters:
 *       - in: query
 *         name: lockerid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the locker to delete
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       400:
 *         description: Invalid locker ID
 *       404:
 *         description: Locker not found
 *       500:
 *         description: Error while deleting locker
 */

app.use("/L", deliveryBox);

app.use("/L", deliveryBox);

app.use("/L", deliveryBox);


/**
 * @swagger
 * /compartment:
 *   post:
 *     summary: Add compartments to a locker
 *     tags:
 *       - Compartments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedType:
 *                 type: string
 *                 enum: [small, medium, large]
 *                 description: The type of compartment to add
 *               id:
 *                 type: integer
 *                 description: The ID of the locker
 *               noOfCompartments:
 *                 type: integer
 *                 description: Number of compartments to add
 *     responses:
 *       200:
 *         description: Compartments added successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Database error
 * 
 *   delete:
 *     summary: Delete a compartment
 *     tags:
 *       - Compartments
 *     parameters:
 *       - in: query
 *         name: lockerid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the locker whose compartment is to be deleted
 *     responses:
 *       200:
 *         description: Compartment deleted successfully
 *       400:
 *         description: Invalid locker ID
 *       404:
 *         description: Compartment not found
 *       500:
 *         description: Error while deleting compartment
 */

app.use("/compartment", compartmentCRUD);

app.use("/compartment", compartmentCRUD);



// Route to add a new parcel for the Sender
app.use("/sendParcel", sendParcel);


//route to get parcel lockers based on city
app.use("/getlockers", sendParcel);

app.use("/getPendingParcels", getPending);

app.use("/getPlacedParcels", getPlaced);

app.use("/getDeliveredParcels", getDelivered);

app.get("/", async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM sendParcel");
		res.status(200).json(result.rows);
	} catch (err) {
		console.error("Database query error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/delivery", async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM parcelForDelivery");
		res.status(200).json(result.rows);
	} catch (err) {
		console.error("Database query error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/time", async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM timestamps");
		res.status(200).json(result.rows);
	} catch (err) {
		console.error("Database query error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/random", async (req, res) => {
	let column = "SendParcel";
	try {
		const result = await db.query(`
			select c.compcategoryid from compartment c where c.compid=43
		`);
		res.status(200).json(result.rows);
	} catch (err) {
		console.error("Database query error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});


app.use('/parcelToReceive/Details', parcelToReceive);

app.use('/sendParcel', sendParcel);


app.put('/updateStatusOfSending', async (req, res) => {
	const parcelID = req.body.parcelID;
	const status = req.body.status;

	const str = "update SendParcel set status ='" + status + "' where parcelid = " + parcelID;

	try {
		const result = await db.query(str);
		res.status(200).send({ message: "Parcel status updated successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while updating status of parcel: " + error });
	}
});

app.put("/sendParcel/updateLockerID", (req, res) => {
	let parcelID = req.body.parcelID;

	const str = "update SendParcel set lockerid = null, compid = null where parcelid = " + parcelID;

	db.query(str, (err, data) => {
		if (err) {
			return res.json("Error");
		}
		return res.json("Locker ID and CompID updated");
	});
});

app.put('/markFailpickups', async (req, res) => {
	const days = req.body.days;
	let failedDeliveries = 0;

	console.log("Number of days: " + days);

	const str = "select parcelid, stampid, lockerid, compid, to_char(creationtime, 'yyyy-mm-dd') as date from SendParcel where status ='selectionDone'";

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
					const str1 = "update SendParcel set status = 'failed' where parcelid = " + result.rows[i].parcelid;

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

					const otp = Math.floor(Math.random() * 9000);
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
		res.status(200).send({ message: "Number of pickups masked as failed: " + failedDeliveries });
	} catch (error) {
		res.status(500).send({ message: "Error while marking failed pickups: " + error });
	}
});

app.use('/checkEligibility/RePickup', checkforRePickup);

app.use("/checkParcelInLockerSender", checkParcelSender)

app.use('/updateLockerId', updateStatusSender);
