import express from 'express';
import db from "../database.js";
const router = express.Router();

router.put('/', async (req, res) => {
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

export default router;