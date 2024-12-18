import React from "react";
import axios from "axios";

function AdminHome() {
    const [data, setData] = React.useState([
        {
            itemName: 'AKG Handfree',
            sname: 'Mario',
            sphone: '03000000000',
            semail: 'stest1@gmail.com',
            rname: 'John William',
            rphone: '03110000000',
            remail: 'rtest1@gmail.com',
            weight: '20'
        },
        {
            itemName: 'Leather wallet',
            sname: 'Daraz',
            sphone: '03000000000',
            semail: 'stest1@gmail.com',
            rname: 'Michal',
            rphone: '03110000000',
            remail: 'rtest1@gmail.com',
            weight: '100'
        }
    ]);
    function postUpdates() {
        //console.log(data);
        axios.post('http://localhost:4001/postUpdates', data)
            .then(res => {
                console.log(res.data.message);
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
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div>
            <button onClick={postUpdates}>Post Updates</button>
            <button onClick={getUpdates}>Get Updates</button>
        </div>
    );
}

export default AdminHome;