import "./App.css";
export default function Subgraph({user, amount}) {
    return (
        <div className="rectangule3">
            <div>
                <h2 style={{ position: "relative", textAlign: "center"}}>{user}</h2>
            </div>
            <div>
                <p className= "amount" style={{position: "relative", textAlign: "center"}}>{amount}(HT)</p>
            </div>
        </div>
    );
}