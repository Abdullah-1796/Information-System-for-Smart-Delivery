import express from 'express';
import db from "../database.js";
import axios from "axios";

const router = express.Router();

async function updateCompartment(lockerID, compID, parcelID) {
	const values1 = {
		lockerid: lockerID,
		compid: compID,
		compstateid: 2
	};
	await axios.put('http://localhost:4002/Locker/Compartment/compstateid', values1)
		.then(response => {
			console.log(response.data);
			//res.status(200).send({message: "Locker reserved"});
		})
		.catch(err => {
			throw (err);
		});

	//updating parcelid of compartment in locker to Reserved
	const values2 = {
		lockerid: lockerID,
		compid: compID,
		parcelid: parcelID
	};
	await axios.put('http://localhost:4002/Locker/Compartment/parcelid', values2)
		.then(response => {
			console.log(response.data);
			//res.status(200).send({message: "Locker reserved"});
		})
		.catch(err => {
			throw (err);
		});
	const otp = Math.floor(Math.random() * 9000);
	const values3 = {
		lockerid: lockerID,
		compid: compID,
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
		compid: compID,
		purpose: "sending"
	}
	await axios.put('http://localhost:4002/Locker/Compartment/purpose', values4)
		.then(response => {
			console.log(response.data.message);
		})
		.catch(err => {
			throw (err);
		});
}

router.post("/", async (req, res) => {
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
			status
		} = req.body;

		// Step 1: Insert timestamp and get stampid
		const insertTimestampQuery = `INSERT INTO timestamps (selection) VALUES (NOW());`;
		await db.query(insertTimestampQuery);


		// Step 2: Get latest stampid
		const getStampIdQuery = `SELECT stampid FROM timestamps ORDER BY stampid DESC LIMIT 1;`;
		const stampResult = await db.query(getStampIdQuery);
		const stampid = stampResult.rows[0].stampid;

		// Step 3: Insert parcel info with stampid
		const parcelQuery = `
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

		const result = await db.query(parcelQuery, values);
		const parcelID = result.rows[0].parcelid;

		//updating status of compartment in locker to Reserved
		await updateCompartment(lockerID, compID, parcelID);

		res.status(201).json({ success: true, data: result.rows[0] });

	} catch (error) {
		console.error("Error inserting parcel with timestamp:", error);
		res.status(500).json({ success: false, message: "Database error" });
	}
});

router.get("/", async (req, res) => {
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

router.put('/reattempt', async (req, res) => {
	try {
		const { parcelId, compID, lockerID } = req.body;
		//check whether it is reattempt or not
		const str = "select stampid from SendParcel where parcelid = " + parcelId;
		const reattempt = await db.query(str);
		const stampid = reattempt.rows[0].stampid;

		const getfailedQuery = `SELECT failed FROM timestamps where stampid = ` + stampid + " and failed is null";
		const flagfailed = await db.query(getfailedQuery);
		if (flagfailed.rowCount !== 0) {
			const str1 = "update timestamps set reattempt= now(), placement = null where stampid=" + stampid;
			await db.query(str1);
			await updateCompartment(lockerID, compID, parcelId);
		}



		res.status(201).json({ success: true });

	} catch (error) {
		console.error("Error inserting parcel with timestamp:", error);
		res.status(500).json({ success: false, message: "Database error" });
	}
});






export default router;