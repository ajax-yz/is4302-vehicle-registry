const ERC721Full = artifacts.require("ERC721Full");
const Vehicle = artifacts.require("Vehicle");
const VehicleRegistry = artifacts.require("VehicleRegistry");

const Migrations = artifacts.require("Migrations");

module.exports = function (deployer, network, accounts) {

	let vehicleRegistryOwner = accounts[0];

	deployer.then(async () => {
		// await deployer.deploy(ERC721Full, { from: vehicleRegistryOwner });
		await deployer.deploy(Vehicle, { from: vehicleRegistryOwner });
		await deployer.deploy(
			VehicleRegistry,
			Vehicle.address,
			{ from: vehicleRegistryOwner });
	});
}
