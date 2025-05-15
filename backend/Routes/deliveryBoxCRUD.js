import express from 'express';
import db from "../database.js";
const router = express.Router();

async function addcompartment(lockerid, noofSmall, noofMedium, noofLarge) {
    // console.log(lockerid)
    // Define the base query for inserting a new compartment
    const query = `
        INSERT INTO compartment ("lockerid", "compstateid", "compcategoryid", "islocked", "otp")
        VALUES ($1, $2, $3, $4, $5) 
    `;

    try {
        if (noofSmall !== 0) {
            for (let i = 0; i < noofSmall; i++) {
                await db.query(query, [lockerid, 1, 1, true, 0]);
            }
        }

        if (noofMedium !== 0) {
            for (let i = 0; i < noofMedium; i++) {
                await db.query(query, [lockerid, 1, 2, true, 0]);
            }
        }

        if (noofLarge !== 0) {
            for (let i = 0; i < noofLarge; i++) {
                await db.query(query, [lockerid, 1, 3, true, 0]);
            }
        }
    } catch (err) {
        console.error("Error inserting compartments:", err);
    }
}

router.post("/", async (req, res) => {
	try {
		const data = req.body;

		// First, check if the record already exists
		const checkQuery = `SELECT lockerid FROM deliveryBox WHERE address = $1 AND city = $2`;
		const existingRecord = await db.query(checkQuery, [data.address, data.city]);

		if (existingRecord.rows.length > 0) {
			// console.log(existingRecord.rows);

			return res.status(400).json({ error: "A locker with this address and city already exists." });
		}

		// If no existing record, insert new data
		const insertQuery = `INSERT INTO deliveryBox ("address", "city", "province") VALUES ($1, $2, $3) RETURNING "lockerid"`;
		const result = await db.query(insertQuery, [data.address, data.city, data.province]);

		const insertedId = result.rows[0].lockerid;

		// Call function to add compartments
		addcompartment(insertedId, data.small, data.medium, data.large);

		return res.status(201).json({ message: "Data inserted successfully", lockerid: insertedId });

	} catch (err) {
		console.error("Database error:", err);
		return res.status(500).json({ error: "Database error", details: err });
	}
});

router.delete("/",async (req, res) => {
	const lockerId = parseInt(req.query.lockerid, 10);

	if (!lockerId || isNaN(lockerId)) {
		return res.status(400).json({ error: "Invalid locker ID" });
	}

	const query = "DELETE FROM deliveryBox WHERE lockerid = $1";
	await db.query(query, [lockerId], (err, result) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: "An error occurred while deleting the locker" });
		}

		if (result.rowCount === 0) {
			return res.status(404).json({ message: "Locker not found" });
		}

		return res.status(200).json({ message: "Deleted successfully" });
	});
});
router
router.put("/",async (req, res) => {
	const data = req.body;
	const str = `UPDATE deliveryBox SET address = $1, city = $2, province = $3 WHERE lockerid = $4`;

	await db.query(str, [data.address, data.city, data.province, data.lockerid], (err, result) => {
		if (err) {
			console.error("Database error:", err);
			return res.status(500).json({ error: "Database error", details: err });
		}
		return res.status(200).json({ message: "Data updated successfully" });
	});
});


export default router;