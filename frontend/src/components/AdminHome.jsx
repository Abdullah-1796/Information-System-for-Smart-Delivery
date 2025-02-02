import React from "react";
import axios from "axios";
import "../styles/AdminHome.css";

function AdminHome() {
    const [data, setData] = React.useState([
        {
            itemName: 'AKG Handfree',
            sname: 'Mario',
            sphone: '03000000000',
            semail: 'stest1@gmail.com',
            rname: 'John William',
            rphone: '+923227888444',
            remail: 'rtest1@gmail.com',
            address: 'Faisal Town A Block',
            city: 'Lahore',
            province: 'Punjab',
            weight: 20
        },
        {
            itemName: 'Leather wallet',
            sname: 'Daraz',
            sphone: '03000000000',
            semail: 'stest1@gmail.com',
            rname: 'Michal',
            rphone: '+923227888444',
            remail: 'rtest2@gmail.com',
            address: 'Faisal Town A Block',
            city: 'Lahore',
            province: 'Punjab',
            weight: 100
        }
    ]);

    function postUpdates() {
        //console.log(data);
        axios.post('http://localhost:4001/postUpdates', data)
            .then(res => {
                console.log(res.data.message);
                if(res.status == 200)
                {
                    alert(res.data.message);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    function getUpdates() {
        //console.log(data);
        axios.get('http://localhost:4001/getUpdates')
            .then(res => {
                console.log(res.data);
                if(res.status == 200)
                {
                    alert("Number of rows fetched: " + res.data.rowCount);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    function markFailDeliveries()
    {
        const days = prompt("Enter number of days, the parcel has not been picked up:");
        const values = {
            days: days
        }
        axios.put('http://localhost:4001/markFailDeliveries', values)
            .then(res => {
                console.log(res.data);
                if(res.status == 200)
                {
                    alert(res.data.message);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div id="adminHomeBody">
            <button onClick={postUpdates} className="adminButton">Post Updates</button>
            <button onClick={getUpdates} className="adminButton">Get Updates</button>
            <button onClick={markFailDeliveries} className="adminButton">Mark Fail Deliveries</button>
        </div>
    );
}

export default AdminHome;