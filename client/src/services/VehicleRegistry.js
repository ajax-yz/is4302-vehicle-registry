class VehicleRegistryService {
  static async registerOwnerDealer(drizzle, values) {
    console.log("drizzle service =", drizzle);
    const strConvert = drizzle.web3.utils.utf8ToHex;

    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .registerOwnerDealer(
          values.ownerAddress,
          strConvert(values.name),
          values.contact,
          strConvert(values.companyRegNo),
          strConvert(values.physicalAddress),
          false,
        )
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
}

export default VehicleRegistryService;
