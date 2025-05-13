import express from 'express';
import db from "../../database.js";
const router = express.Router();

router.get('/',  async (req, res) => {
	try {
		const query = `select * from parcelForDelivery where status= 'parcelPlaced'`
		const { rows } = await db.query(query); // Pass both parameters
		res.json({ success: true, data: rows });
	} catch (error) {
		console.error("Error getting Delivery Boxes: ", error);
		res.status(500).json({ success: false, message: "Database error" });
	}
});

export default router;