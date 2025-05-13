import express from 'express';
import db from "../database.js";
const router = express.Router();

router.put('/', async (req, res) => {
	const column = req.body.column;
	const stampid = req.body.stampid;

	console.log(column, stampid);
	const str = "update timestamps set " + column + "= now() where stampid=" + stampid;

	try {
		const result = await db.query(str);
		res.status(200).send({ message: "timestamp of " + column + " has been updated" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Error while updating timestamp of " + column + ": " + error });
	}
});

export default router;