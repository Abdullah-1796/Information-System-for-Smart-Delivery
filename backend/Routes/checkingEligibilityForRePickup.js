import express from 'express';
import db from "../database.js";
const router = express.Router();

router.get('/', async (req, res) => {
	const trackingID = req.query.trackingID;

	const str = `
		SELECT p.city, p.compid, p.stampid
		FROM (
			SELECT city, stampid, compid
			FROM SendParcel 
			WHERE sendertrackingid = '${trackingID}'
		) AS p 
		INNER JOIN timestamps t 
		ON p.stampid = t.stampid 
		WHERE t.failed IS NOT NULL 
		  AND t.reattempt IS NULL 
		  AND t.placement IS NULL
	`;

	try {
		const result = await db.query(str);
		if (result.rowCount === 1) {
			const city = result.rows[0].city;
			const compid = result.rows[0].compid;
			const stampid = result.rows[0].stampid;
			const compcategoryid = await db.query(`
			select c.compcategoryid from compartment c where c.compid = ${compid}
		`);
			res.status(200).send({ message: "Eligibility Confirmed", eligible: true, city: city, stampid: stampid ,compcategoryid: compcategoryid.rows[0].compcategoryid });
		} else {
			res.status(200).send({ message: "Eligibility Denied", eligible: false });
		}
	} catch (error) {
		res.status(500).send({ message: "Error while checking eligibility for rescheduling: " + error.message });
	}
});


export default router;