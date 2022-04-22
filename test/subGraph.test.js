const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const axios = require("axios");

describe("SubGraph Token", async ()=> {
    
    it("Should be able to call the API and receive the data", async ()=> {
        let result;

        try{
            let {data} = await axios.post(`https://api.thegraph.com/subgraphs/name/ljrr3045/house-token-subgraph`,
                {
                    query: `
                        {
                            transfers( 
                            orderBy: value, 
                            orderDirection: desc){
                                id
                                from
                                to
                                value
                            }
                        }

                    `
                }
            );

            result = data.data.transfers;

        }catch(e){
            console.error(e);
        }

        expect(result[0].from).to.equal("0x0000000000000000000000000000000000000000");
        expect(result[0].to).to.equal("0x1493b00f5a096970c65705262ca7d193e554c10f");
        expect(result[0].value).to.equal("100000000000000000000000");
    });  
});