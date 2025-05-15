import React, { useState } from "react";
import axios from "axios";
import "../styles/InteractionScreen.css";

function InteractionScreen(props) {
    const [selectedType, setSelectedType] = useState("");
    const [noOfCompartments, setNoOfCompartments] = useState("");

    const handleAmountChange = (event) => {
        const value = Math.abs(event.target.value);
        setNoOfCompartments(value);
    };

    let clickedOutside = true;
    const id = props.id;

    function handleClick() {
        axios.post("http://localhost:4001/compartment", {
            selectedType,
            id,
            noOfCompartments,
        })
            .then(() => {
                props.hideScreen();
                props.loadData();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    return (
        <div
            id="interactionScreenBody"
            onClick={() => {
                if (clickedOutside) props.hideScreen();
                else clickedOutside = true;
            }}
        >
            <div
                id="screenContainer"
                onClick={() => {
                    clickedOutside = false;
                }}
            >
                <div id="display">
                    <div>Select Category</div>
                </div>

                <div id="buttonContainer">
                    <div className="buttonRow">
                        <div
                            className={`button ${selectedType === "small" ? "selected" : ""}`}
                            onClick={() => setSelectedType("small")}
                        >
                            Small
                        </div>
                        <div
                            className={`button ${selectedType === "medium" ? "selected" : ""}`}
                            onClick={() => setSelectedType("medium")}
                        >
                            Medium
                        </div>
                        <div
                            className={`button ${selectedType === "large" ? "selected" : ""}`}
                            onClick={() => setSelectedType("large")}
                        >
                            Large
                        </div>
                    </div>

                    <div className="inputContainer">
                        <label htmlFor="amount">Enter no of Compartments</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            min="0"
                            value={noOfCompartments}
                            className={`compartmentInput ${noOfCompartments <= 0 ? "input-error" : ""}`}
                            onChange={handleAmountChange}
                            placeholder="e.g., 3"
                        />
                    </div>

                    <div className="submitRow">
                        <button className="submitBtn" onClick={handleClick}>
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InteractionScreen;
