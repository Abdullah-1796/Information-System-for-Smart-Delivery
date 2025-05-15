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
			// console.log(response.data);
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
			// console.log(response.data);
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
			// console.log(response.data + " " + otp);
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
			// console.log(response.data.message);
		})
		.catch(err => {
			throw (err);
		});
}

router.put('/', async (req, res) => {
	const lockerid = req.body.lockerid;
	const compid = req.body.compid;
	const stampid = req.body.stampid;
	const parcelid = req.body.parcelid;

	console.log(req.body);

	const str = `update SendParcel set lockerid = ${lockerid}, compid = ${compid} where stampid =  ${stampid}`;

	try {
		const result = await db.query(str);
		const value1 = {
			stampid: stampid,
			column: "reattempt"
		}
		axios.put('http://localhost:4001/updateTimestamp', value1)
			.then(async response1 => {
				if (response1.status == 200) {
					await updateCompartment(lockerid,compid,parcelid);
				}
			})
			.catch(error1 => {
				console.error(error1);
			});
		res.status(200).send({ message: "Parcel status updated successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while updating status of parcel: " + error });
	}
});

export default router;