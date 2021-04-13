class VehicleRegistryService2 {
  static async swapVehLicensePlate(drizzle, vehicleId, otherVehicleId) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .swapVehLicensePlate(vehicleId, otherVehicleId)
        .send();

      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  

  static async isAddressRegisteredOwner(drizzle, address) {
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .isAddressRegisteredOwner(address)
        .call();

      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }
}
