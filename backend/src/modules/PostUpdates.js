async function PostUpdates(db, req, res, data)
{
    const query = `insert into parcelForDelivery(itemName, sname, sphone, semail, rname, rphone, remail, dimensionID, receiverTrackingID, riderTrackingID) values
    ${data.map((d, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`)}
    `;

    //// console.log(query1);
    let receiverTrackingID = "123456";
    let riderTrackingID = "123456";
    let dimension = "small";

    const values = data.flatMap((d) => [
        d.itemName,
        d.sname,
        d.sphone,
        d.semail,
        d.rname,
        d.rphone,
        d.remail,
        dimension,
        receiverTrackingID,
        riderTrackingID
    ]);

    try {
        const result = await db.query(query, values);
        // console.log(result.rowCount);
        res.status(200).send({message: 'Rows Successfully inserted: ' + result.rowCount});
    } catch (error) {
        console.error("Error while insertion: " + error.message);
        res.status(500).send({message: "Error while insertion: " + error.message});
    }
}

export default PostUpdates;