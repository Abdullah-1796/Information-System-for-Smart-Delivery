import express from 'express';
import db from "../database.js";
import axios from "axios";

const router = express.Router();

router.get('/', async (req, res) => {
	const { column, trackingID } = req.query;
	console.log(column," ",trackingID)

	let table = "parcelfordelivery";
	let col = "receivertrackingid";
	if (column === "SendParcel") {
		table = "SendParcel";
		col = "sendertrackingid";
	}

	// Prevent SQL injection by allowing only two known table names
	if (!["parcelfordelivery", "SendParcel"].includes(table)) {
		return res.status(400).send({ message: "Invalid column" });
	}

	const query = `
		SELECT 
			l.lockerid, l.compcategoryid, l.address, l.city, l.province,
			p.parcelid, p.itemname, p.sname, p.rname, p.rphone
		FROM (
			SELECT d.lockerid, d.address, d.city, d.province, c.compcategoryid
			FROM (
				SELECT lockerid, compcategoryid
				FROM compartment
				WHERE compstateid = 1 AND lockerid IS NOT NULL
				GROUP BY lockerid, compcategoryid, compstateid
				ORDER BY lockerid, compcategoryid
			) AS c
			INNER JOIN deliverybox d ON c.lockerid = d.lockerid
		) AS l
		INNER JOIN ${table} p 
			ON l.address = p.address 
			AND l.city = p.city 
			AND l.province = p.province 
			AND l.compcategoryid = p.dimensionid
		WHERE p.${col} = $1 AND p.lockerid IS NULL
		ORDER BY l.lockerid;
	`;

	try {
		const result = await db.query(query, [trackingID]);
		console.log(result.rowCount);
		res.status(200).send(result);
	} catch (error) {
		res.status(500).send({ message: "Error while fetching available Lockers: " + error.message });
	}
});


router.post('/', async (req, res) => {
	const lockerID = req.body.lockerID;
	const compCategoryID = req.body.compCategoryID;
	const trackingID = req.body.trackingID;
	const parcelID = req.body.parcelID;
	console.log("Pa/rcelid: " + parcelID);

	const q = "select compID from compartment where lockerid='" + lockerID + "' and compcategoryid=" + compCategoryID + " and compStateID=1 order by compid";
	try {
		const result = await db.query(q);
		//// console.log(result.rows);
		const compid = result.rows[0].compid;

		//checking whether it is first attempt or reattempt
		const str = "select stampid from parcelForDelivery where parcelid = " + parcelID + " and stampid is not null";
		const result2 = await db.query(str);
		console.log(result.rowCount)
		if (result2.rowCount == 0) {
			//adding timestamp for selection
			const str1 = "insert into timestamps(selection) values(now());update parcelfordelivery set stampid = (select stampid from timestamps order by stampid desc limit 1) where parcelid = " + parcelID;

			try {
				const result = await db.query(str1);
				console.log("timestamp of selection has been added");
			} catch (error) {
				// console.log("Error while adding timestamp of selection: " + error);
			}
		}
		else {
			const values = {
				column: "reattempt",
				stampid: result2.rows[0].stampid,
			}
			console.log("reattempt")

			await axios.put('http://localhost:4001/updateTimestamp', values)
				.then(response => {
					// console.log(response.message);
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
		console.log(values1);
		await axios.put('http://localhost:4002/Locker/Compartment/compstateid', values1)
			.then(response => {
				console.log("values1 axios", response.data);
			})
			.catch(err => {
				if (err.response) {
					// Server responded with a status outside 2xx
					console.error("Server error:", err.response.status, err.response.data);
				} else if (err.request) {
					// No response received
					console.error("No response received. Axios request:", err.request);
				} else {
					// Something went wrong setting up the request
					console.error("Axios error:", err.message);
				}
			});

		console.log("next");

		//updating parcelid of compartment in locker to Reserved
		const values2 = {
			lockerid: lockerID,
			compid: compid,
			parcelid: parcelID
		}
		await axios.put('http://localhost:4002/Locker/Compartment/parcelid', values2)
			.then(response => {
				// console.log(response.data);
				//res.status(200).send({message: "Locker reserved"});
			})
			.catch(err => {
				// console.log(err);
				throw (err);
			});

		//updating parcelForDelivery table and setting lockerid for it
		const q1 = "update parcelForDelivery set lockerId =" + lockerID + ", compid = " + compid + " where receiverTrackingId = '" + trackingID + "'";
		const r = await db.query(q1);
		//// console.log(r);

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
				// console.log(response.data + " " + otp);
			})
			.catch(err => {
				// console.log(err);
				throw (err);
			});

		const values4 = {
			lockerid: lockerID,
			compid: compid,
			purpose: "receiving"
		}
		await axios.put('http://localhost:4002/Locker/Compartment/purpose', values4)
			.then(response => {
				// console.log(response.data.message);
			})
			.catch(err => {
				// console.log(err);
				throw (err);
			});

		const values5 = {
			parcelID: parcelID,
			status: "selectionDone"
		}
		await axios.put('http://localhost:4001/updateStatus', values5)
			.then(response => {
				// console.log(response.data.message);
				res.status(200).send({ message: "Locker reserved" });
			})
			.catch(err => {
				// console.log(err);
				throw (err);
			});

	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while reserving available Lockers: " + error.message });
	}

});

router.put("/", (req, res) => {
	let parcelID = req.body.parcelID;

	const str = "update parcelForDelivery set lockerid = null, compid = null where parcelid = " + parcelID;

	db.query(str, (err, data) => {
		if (err) {
			return res.json("Error");
		}
		return res.json("Locker ID and CompID updated");
	});
});

export default router;