import express from 'express';
import db from "../database.js";
const router = express.Router();

router.put('/', async (req, res) => {
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
		res.status(200).send({ message: "Number of deliveries masked as failed: " + failedDeliveries });
	} catch (error) {
		res.status(500).send({ message: "Error while marking failed deliveries: " + error });
	}
});

router.get('/', async (req, res) => {
	const trackingID = req.query.trackingID;

	const str = "select p.lockerid, p.compid, p.itemname, p.sname, p.rname, p.address, p.city, p.province, c.otp from (select lockerid, compid, itemname, sname, rname, address, city, province, status from parcelfordelivery where ridertrackingid = '" + trackingID + "') as p inner join compartment c on p.lockerid=c.lockerid and p.compid=c.compid where p.status = 'failed'";

	try {
		const result = await db.query(str);
		res.status(200).send(result);
	} catch (error) {
		res.status(500).send({ message: "Error while getting failed delivery details for rider to bring back: " + error });
	}

});

export default router;