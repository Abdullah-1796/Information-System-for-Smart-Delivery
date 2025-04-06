import React from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Option.css";

function Option(props) {
    const navigate = useNavigate();

    function moveToLink()
    {
        navigate(props.link.toString());
    }
    
    return (
        <div class="option1" style={{backgroundColor: props.backgroundColor, color: props.color}} onClick={moveToLink}>
            <p>{props.label}</p>
        </div>
    );
}

export default Option;