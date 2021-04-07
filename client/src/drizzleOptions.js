import VehicleRegistry from "./contracts/VehicleRegistry.json";

const drizzleOptions = {
  contracts: [VehicleRegistry],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545",
    },
  },
};

export default drizzleOptions;