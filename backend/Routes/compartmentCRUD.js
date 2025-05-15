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
    // console.log("post")
    const { selectedType, id, noOfCompartments } = req.body;

    if (!selectedType || !id || !noOfCompartments || isNaN(id) || isNaN(noOfCompartments)) {
        return res.status(400).json({ error: "Invalid request parameters" });
    }

    // console.log(selectedType);

    switch (selectedType) {
        case "small":
            await addcompartment(id, noOfCompartments, 0, 0);
            break;
        case "medium":
            await addcompartment(id, 0, noOfCompartments, 0);
            break;
        case "large":
            await addcompartment(id, 0, 0, noOfCompartments);
            break;
        default:
            return res.status(400).json({ error: "Invalid compartment type" });
    }

    res.status(200).json({ message: "Added Successfully" });
});

router.delete("/", async (req, res) => {
    const lockerId = parseInt(req.query.lockerid, 10);

    if (!lockerId || isNaN(lockerId)) {
        return res.status(400).json({ error: "Invalid locker ID" });
    }

    const query = "DELETE FROM compartment WHERE compid = $1";

    try {
        const result = await db.query(query, [lockerId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Compartment not found" });
        }

        return res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "An error occurred while deleting the compartment" });
    }
});






export default router;