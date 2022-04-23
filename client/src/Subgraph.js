import { useState, useEffect } from "react";
import "./App.css";

export default function Subgraph({user, amount}) {
    return (
        <div className="rectangule3">
            <div>
                <h2 style={{ position: "relative", top: "-20px", left: "60px", textAlign: "center"}}>{user}</h2>
            </div>
            <div>
                <p style={{position: "relative", top: "50px", left: "-65px", textAlign: "center"}}>{amount}(HT)</p>
            </div>
        </div>
    );
}