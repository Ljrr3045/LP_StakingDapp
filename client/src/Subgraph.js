import { useState, useEffect } from "react";
import "./App.css";

export default function Subgraph({user, amount}) {

    return (
        <div className="rectangule3">
            <div>
                <h2 style={{ position: "relative", top: "-20px", left: "60px", textAlign: "center"}}>{user.slice(0, 5)}...{user.slice(-4)}</h2>
            </div>
            <div>
                <p style={{position: "relative", top: "25px", left: "-65px", textAlign: "center"}}>{amount}(HT)</p>
            </div>
        </div>
    );
}