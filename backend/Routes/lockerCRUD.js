import express from 'express';
import db from "../database.js";
const router = express.Router();

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
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
		if (result2.rowCount == 0) {
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
                column: "reattempt",
				stampid: result2.rows[0].stampid,
			}

			await axios.put('http://localhost:4001/updateTimestamp', values)
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

		//updating parcelid of compartment in locker to Reserved
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