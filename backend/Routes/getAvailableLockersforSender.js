import express from 'express';
import db from "../database.js";
const router = express.Router();

router.get('/', async (req, res) => {
	const {column, trackingID} = req.query;

	//finding and matching lockers with parcel details
	const query1 = "select l.lockerid, l.compcategoryid, l.address, l.city, l.province,p.parcelid, p.itemname, p.sname, p.rname, p.rphone from (select d.lockerid, d.address, d.city, d.province, c.compcategoryid from (select lockerid, compcategoryid from compartment where compstateid = 1 and lockerid is not null group by lockerid, compcategoryid,compstateid order by lockerid, compcategoryid) as  c inner join deliverybox d on c.lockerid = d.lockerid)as l inner join " + column + " p on l.address=p.address and l.city=p.city and l.province=p.province and l.compcategoryid=p.dimensionid where p.receivertrackingid = '" + trackingID + "' and p.lockerid is null order by l.lockerid;";

	try {
		const result = await db.query(query1);
		// // console.log(result);
		res.status(200).send(result);
	}
	catch (error) {
		res.status(500).send({ message: "Error while fetching available Lockers: " + error.message });
	}
});

export default router;