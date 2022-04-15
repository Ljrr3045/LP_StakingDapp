import {useState, useEffect} from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "./App.css"

export default function App() {

    const [amount, setAmount] = useState(null)
    const [currentAccount, setCurrentAccount] = useState("");

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have metamask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};   

    const changeAccount = async () => {
			window.ethereum.on("accountsChanged", async () => {
				const accounts = await window.ethereum.request({
					method: "eth_accounts",
				});

				if (accounts.length !== 0) {
					const account = accounts[0];
					console.log("Found an authorized account:", account);
					setCurrentAccount(account);
				} else {
					console.log("No authorized account found");
				}
			});
		};

    	const connectWallet = async () => {
				try {
					const { ethereum } = window;

					if (!ethereum) {
						alert("Get MetaMask!");
						return;
					}

					const accounts = await ethereum.request({
						method: "eth_requestAccounts",
					});

					console.log("Connected", accounts[0]);
					setCurrentAccount(accounts[0]);
				} catch (error) {
					console.log(error);
				}
			};

	useEffect(() => {
		checkIfWalletIsConnected();
		changeAccount();
	}, []);
                   

	return (
		<div className="father">
			<div className="connect-button">
				{currentAccount.le}
				<Button
					variant="outlined"
					onClick={() => connectWallet()}
					sx={{ color: "black", background: "white" } }>
					Connect
				</Button>
			</div>
			<div className="input-father">
				<div className="input">
					<TextField
						fullWidth
						label="Amount of ether"
						variant="standard"
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
					/>
				</div>
			</div>
			<div className="grid-father">
				<div className="grid">
					<div>
						<Button
							variant="contained"
							sx={{ color: "white", background: "black" }}>
							Deposit
						</Button>
					</div>
					<div>
						<Button
							variant="contained"
							sx={{ color: "white", background: "black" }}>
							Withdraw
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
