import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { signERC2612Permit } from "eth-permit";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "./App.css";
import Token from "./abis/ErcToken.json";
import Staking from "./abis/LPStakingMain.json";
import lpDaiAbi from "./abis/LpDai.json";

export default function App() {
	const [amount, setAmount] = useState(0);
	const [currentAccount, setCurrentAccount] = useState("");
	const [contractOfRewardToken, setContractOfRewardToken] = useState({});
	const [stakingContract, setStakingContract] = useState({});

	const rewardTokenAddress = process.env.REACT_APP_REWARD_TOKEN_ADDRESS;
	const stakingAddress = process.env.REACT_APP_STAKING_ADDRESS;

	//const rewardTokenAddress = "0xD80c0e3AEb7CDe17E07Db57531aF9582B3409613";
	//const stakingAddress = "0x1493B00F5a096970c65705262ca7d193E554C10f";

	const deposit = async (valueOfEther) => {
		if (amount <= 0) return;


		let rpcUrl = process.env.REACT_APP_RPC_URL; //BSC Testnet RPC URL for testing.
		let lpDaiAddress = process.env.REACT_APP_LP_DAI_ADDRESS; //Token contract address which will be given transfer permit to

		let value = "100000000000000000000000000000"; //Permitted amount to spend

		const rpcProvider = await new ethers.providers.JsonRpcProvider(rpcUrl);

		//const signerWallet = await new ethers.Wallet(privateKey, rpcProvider); //Wallet object of signer who will give allowance.
		//const signerAddress = await signerWallet.getAddress();

		const allowanceParameters = await signERC2612Permit(
			window.ethereum,
			lpDaiAddress,
			currentAccount,
			stakingAddress,
			value,
		); //Sign operation
		console.log(allowanceParameters); //Result values can be used manually to execute permit() function with web3 providers and websites like etherscan or bscscan.

		await stakingContract.addPoolLiquidity(
			allowanceParameters.v,
			allowanceParameters.r,
			allowanceParameters.s,
			allowanceParameters.deadline,
			allowanceParameters.value,
			{ value: ethers.utils.parseEther(valueOfEther) },
		);

		setAmount(0);
	};;

	const withdrawAll = async () => {
		console.log(stakingContract);
		await stakingContract.withdrawPoolLiquidity();
	};

	const getStakingContract = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					stakingAddress,
					Staking.abi,
					signer,
				);

				setStakingContract(connectedContract);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getContractOfRewardToken = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					rewardTokenAddress,
					Token.abi,
					signer,
				);

				setContractOfRewardToken(connectedContract);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

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
		getStakingContract();
		getContractOfRewardToken();
        console.log(process.env.REACT_APP_RPC_URL);
	}, []);

	return (
		<div className="father">
			{currentAccount.length ? <div>Amount of liquidity: </div> : null}
			<div className="connect-button">
				{!currentAccount.length ? (
					<Button
						variant="outlined"
						onClick={() => connectWallet()}
						sx={{ color: "black", background: "white" }}>
						Connect
					</Button>
				) : null}
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
							sx={{ color: "white", background: "black" }}
							onClick={() => deposit(amount)}>
							Deposit
						</Button>
					</div>
					<div>
						<Button
							variant="contained"
							sx={{ color: "white", background: "black" }}
							onClick={() => withdrawAll()}>
							Withdraw All
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
