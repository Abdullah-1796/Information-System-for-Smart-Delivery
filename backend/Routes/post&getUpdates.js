import express from 'express';
import db from "../database.js";
const router = express.Router();
router.post('/', async (req, res) => {
    const data = req.body;
    // console.log("post data ",data);
    const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, address, city, province, dimensionID, receiverTrackingID, riderTrackingID, status) values
    ${data.map((d, i) => `($${i * 14 + 1}, $${i * 14 + 2}, $${i * 14 + 3}, $${i * 14 + 4}, $${i * 14 + 5}, $${i * 14 + 6}, $${i * 14 + 7}, $${i * 14 + 8}, $${i * 14 + 9}, $${i * 14 + 10}, $${i * 14 + 11}, $${i * 14 + 12}, $${i * 14 + 13}, $${i * 14 + 14})`)}`;



    const values = [];
    await Promise.all(data.flatMap(async (d) => {

        //setting dimension
        let dimension = "1";
        if (d.weight > 3000 && d.weight < 10001) {
            dimension = "2";
        }
        else if (d.weight > 10000 && d.weight < 20000) {
            dimension = "3";
        }

        //generating tracking ids
        const id = Date.now() + Math.floor(Math.random() * 1000);
        let receiverTrackingID = id + 1;
        let riderTrackingID = id + 2;
        const status = "selectionPending";

        const message = "Hi, Kindly select your delivery box for your item " + d.itemName + " with your tracking id " + receiverTrackingID;

        //sending message

        values.push(
            d.itemName,
            d.sname,
            d.sphone,
            d.semail,
            d.rname,
            d.rphone,
            d.remail,
            d.address,
            d.city,
            d.province,
            dimension,
            receiverTrackingID,
            riderTrackingID,
            status
        )
    }));

    //// console.log(values);
    try {
        const result = await db.query(query, values);
        // console.log("rows inserted after SP's post api: " + result.rowCount);
        res.status(200).send({ message: 'Rows Successfully inserted: ' + result.rowCount });
    } catch (error) {
        console.error("Error while insertion: " + error.message);
        res.status(500).send({ message: "Error while insertion: " + error.message });
    }
});

router.get('/', async (req, res) => {
	const query = "select * from parcelForDelivery where status = 'selectionDone';";

	try {
		const result = await db.query(query);
		// console.log({ rowCount: result.rowCount, rows: result.rows });
		res.status(200).send({
			message: "Data fetched successfully",
			rowCount: result.rowCount,
			rows: result.rows
		});
	} catch (error) {
		console.error("Error while fetching: " + error.message);
		res.status(500).send("Error while fetching: " + error.message);
	}
});

export default router;