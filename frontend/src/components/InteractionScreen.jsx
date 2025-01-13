import React from "react";
import axios from "axios";
import "../styles/InteractionScreen.css";
// import BeepSound from "../Audio/ButtonClick.mp3";
// import $ from "jquery";

function InteractionScreen(props) {
    let clickedOutside = true;
    const id=props.id;
    function handleClick(size)
    {
        axios.post('http://localhost:4001/compartment', {size,id})
            .then(res => {
                console.log(res.data.message);
            })
            .catch(err => {
                console.log(err);
            });
    }
    return (
        <div id="interactionScreenBody" onClick={() => {
            if(clickedOutside)
                props.hideScreen();
            else
                clickedOutside = true;
            }
            }>
            <div id="screenContainer" onClick={() => {clickedOutside = false}}>
                <div id="display">
                    <div>Select Category</div>
                    
                </div>
                <div id="buttonContainer">
                    <div class="buttonRow">
                        <div class="button" onClick={() => handleClick("small")}>Small</div>
                    
                        <div class="button" onClick={() => handleClick("medium")}>Medium</div>
                   
                        <div class="button" onClick={ () => handleClick("large")}>Large</div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export default InteractionScreen;