import express from 'express';
import db from "../database.js";
const router = express.Router();

router.get('/',  async (req, res) => {
	const trackingID = req.query.trackingID;
	//console.log(trackingID);

	const str = "select parcelid, stampid from parcelfordelivery where receiverTrackingID='" + trackingID + "' and status = 'selectionPending'";

	try {
		const result = await db.query(str);
		//console.log(result);
		if (result.rowCount == 1) {
			res.status(200).send({ message: "Eligibility Confirmed", eligible: true, stampid: result.rows[0].stampid, lockerid: result.rows[0].lockerid, compid: result.rows[0].compid, parcelid: result.rows[0].parcelid });
		}
		else {
			res.status(200).send({ message: "Eligibility Denied", eligible: false });
		}
	} catch (error) {
		console.log("Error while checking eligibility for rescheduling" + error);
		res.status(500).send({ message: "Error while checking eligibility for rescheduling" + error });
	}
});

export default router;