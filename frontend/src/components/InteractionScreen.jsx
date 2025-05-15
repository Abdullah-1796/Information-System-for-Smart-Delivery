import React, { useState } from "react";
import axios from "axios";
import "../styles/InteractionScreen.css";
// import BeepSound from "../Audio/ButtonClick.mp3";
// import $ from "jquery";

function InteractionScreen(props) {
    const [selectedType, setSelectedType] = useState("");
    const [noOfCompartments, setNoOfCompartments] = useState("");
    const handleTypeChange = (event) => {
        setSelectedType(event.target.id);
        // console.log(`Selected type: ${event.target.id}`);
    };

    const handleAmountChange = (event) => {
        const value = Math.abs(event.target.value); // Ensure the value is positive
        setNoOfCompartments(value);
        // console.log(`Number of compartments: ${value}`);
    };
    let clickedOutside = true;
    const id = props.id;
    // React.useEffect(()=>{// console.log(id)},[id])

    function handleClick() {
        // console.log(id)
        axios.post('http://localhost:4001/compartment', { selectedType, id, noOfCompartments})
            .then(res => {
                // console.log(res.data.message);
                props.hideScreen();
                props.loadData()
            })
            .catch(err => {
                // console.log(err);
            });
    }
    return (
        <div id="interactionScreenBody" onClick={() => {
            if (clickedOutside)
                props.hideScreen();
            else
                clickedOutside = true;
        }
        }>
            <div id="screenContainer" onClick={() => { clickedOutside = false }}>
                <div id="display">
                    <div>Select Category</div>

                </div>
                <div id="buttonContainer">
                    <div className="buttonRow">
                        <div className="button">
                            <input
                                type="radio"
                                name="type"
                                id="small"
                                onChange={handleTypeChange}
                            />
                            <label htmlFor="small">Small</label>
                        </div>

                        <div className="button">
                            <input
                                type="radio"
                                name="type"
                                id="medium"
                                onChange={handleTypeChange}
                            />
                            <label htmlFor="medium">Medium</label>
                        </div>

                        <div className="button">
                            <input
                                type="radio"
                                name="type"
                                id="large"
                                onChange={handleTypeChange}
                            />
                            <label htmlFor="large">Large</label>
                        </div>
                    </div>
                    <div className="buttonRow" style={{ marginTop: "25px" }}>
                        <div>
                            <label htmlFor="amount">Enter no of Compartments</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                min="0"
                                style={{
                                    padding: "5px",
                                    marginLeft: "20px",
                                    borderRadius: "10px",
                                }}
                                onChange={handleAmountChange}
                            />
                        </div>
                    </div>
                    <div className="buttonRow">
                        <input type="submit" value="submit" onClick={handleClick}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InteractionScreen;