import express from 'express';
import db from "../database.js";
const router = express.Router();

router.get("/", async (req, res) => {
	const trackingID = req.query.trackingID;

	const str = "select d.lockerid, p.compid, d.address, d.city, d.province from (select lockerid, compid from SendParcel where sendertrackingid = '" + trackingID + "' and lockerid is not null) as p inner join deliverybox d on p.lockerid=d.lockerid";

	try {
		const result = await db.query(str);
		res.status(200).send(result);
	} catch (error) {

	}
})

export default router;