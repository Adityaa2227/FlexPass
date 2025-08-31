const { Wallet } = require("ethers");

// अपनी recovery phrase यहाँ डालो
const mnemonic = "abandon castle illegal resist add vote liar advance rescue legend cry hen";

async function main() {
  const wallet = Wallet.fromPhrase(mnemonic);
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
}
main();
