class VehicleRegistryService {
  static async registerOwnerDealer(drizzle, values) {
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

  static async retrieveOwnerDealerInfo(drizzle, ownerAddress) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveOwnerDealerInfo(ownerAddress)
        .call();
      console.log("res =", res);
      if (res) {
        const info = {
          name: hexConvert(res[0]),
          contact: res[1],
          companyRegNo: hexConvert(res[2]),
          physicalAddress: hexConvert(res[3]),
          isDealer: res[4],
          noOfVehiclesOwn: res[5],
        };
        return info;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  static async retrieveAllVehiclesOwn(drizzle, ownerAddress) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehiclesOwn(ownerAddress)
        .call();
      console.log("res =", res);
      if (res) {
        return res;
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
