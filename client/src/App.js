import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { signERC2612Permit } from "eth-permit";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import OutboxIcon from '@mui/icons-material/Outbox';
import "./App.css";
import Staking from "./abis/LPStakingMain.json";

export default function App() {
	const [amount, setAmount] = useState(0);
	const [currentAccount, setCurrentAccount] = useState("");
	const [stakingContract, setStakingContract] = useState({});
    const [lpStakingBalance, setLpStakingBalance] = useState(0);

	const stakingAddress = process.env.REACT_APP_STAKING_ADDRESS;

    // Deposit amountOfEther to Liquidity pool 
	const deposit = async (amountOfEther) => {
		if (amount <= 0) return;
		let lpDaiAddress = process.env.REACT_APP_LP_DAI_ADDRESS; //Token contract address which will be given transfer permit to
		let value = "100000000000000000000000000000"; //Permitted amount to spend

		// Sign operation
        const allowanceParameters = await signERC2612Permit(
			window.ethereum,
			lpDaiAddress,
			currentAccount,
			stakingAddress,
			value,
		); 

        // Add amount of ether selected to liquidity pool
		await stakingContract.addPoolLiquidity(
			allowanceParameters.v,
			allowanceParameters.r,
			allowanceParameters.s,
			allowanceParameters.deadline,
			allowanceParameters.value,
			{ value: ethers.utils.parseEther(amountOfEther) },
		);

		setAmount(0);
	};;

    // Get all the lpDai and the interest paid with a ERC20Token from liquidity pool
	const withdrawAll = async () => {
		await stakingContract.withdrawPoolLiquidity();
	};

    // Get smart contract that stakes token
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

    // Check if metamask wallet is connected
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

    // Get account (wallet) of the current user of the app
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

    // Get amount of LPToken of user in smart contract
    const getAmountOfStakeInContract = async (address) => {

        const balanceOfStakeTokenOfCurrentUser = await stakingContract.balances(address);

		setLpStakingBalance(Number(ethers.utils.formatEther(balanceOfStakeTokenOfCurrentUser)));

    }

    //Connect wallet to app
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
        changeAccount();
        checkIfWalletIsConnected();
        getStakingContract();
	}, [])

    useEffect(() => {
        getAmountOfStakeInContract(currentAccount); 
    }, [currentAccount])

	return (
		<div className="father">
			{currentAccount.length ? (
				<div>Amount of LPToken liquidity: ${lpStakingBalance}</div>
			) : null}
			<div className="connect-button">
				{!currentAccount.length ? (
					<Button
						variant="contained"
						startIcon={<AccountBalanceWalletIcon/>}
						onClick={() => connectWallet()}
						sx={{ color: "white", background: "#000428" }}
						style={{borderRadius: '10px', overflow: 'hidden'}}>
						Connect wallet
					</Button>
				) : null}
			</div>
			<div className="container">
				<div className="input-father">
					<div className="input">
						<TextField
							fullWidth
							label="Amount of Ether"
					        InputLabelProps={{ style: { fontSize: 17 } }}
							variant="outlined"
							type="number"
							InputProps={{ inputProps: { min: 0 } }}
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
								startIcon={<SavingsIcon/>}
								sx={{ color: "white", background: "black" }}
								style={{borderRadius: '10px', overflow: 'hidden'}}
								onClick={() => deposit(amount)}>	
								Deposit
							</Button>
						</div>
						<div>
							<Button
								variant="contained"
								startIcon={<OutboxIcon/>}
								sx={{ color: "white", background: "black" }}
								style={{borderRadius: '10px', overflow: 'hidden'}}
								onClick={() => withdrawAll()}>
								Withdraw All
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
