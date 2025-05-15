import express from 'express';
import db from "../database.js";
const router = express.Router();

router.get('/', async (req, res) => {
    const trackingID = req.query.trackingID;
    // console.log(trackingID);

    const str = "select p.lockerid, p.compid, p.itemname, p.sname, p.rname, p.address, p.city, p.province, c.otp from (select lockerid, compid, itemname, sname, rname, address, city, province, status from parcelfordelivery where ridertrackingid = '" + trackingID + "') as p inner join compartment c on p.lockerid=c.lockerid and p.compid=c.compid where p.status = 'selectionDone'";

    try {
        const result = await db.query(str);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Error while getting parcel details for rider to deliver: " + error });
    }

});

export default router;