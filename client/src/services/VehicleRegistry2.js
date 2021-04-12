class VehicleRegistryService2 {
    static async swapVehLicensePlate(drizzle, vehicleId, otherVehicleId) {
        const strConvert = drizzle.web3.utils.utf8ToHex;
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .swapVehLicensePlate(
              vehicleId,
              otherVehicleId,
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

    static async deregisterVehicle(drizzle, vehicleId, ownerDealerAddress) {
        const strConvert = drizzle.web3.utils.utf8ToHex;
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .deregisterVehicle(
              vehicleId,
              ownerDealerAddress,
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

    static async retrieveNoOfTransfers(drizzle, vehicleId) {
        try {
          const res = await drizzle.contracts.VehicleRegistry.methods
            .retrieveNoOfTransfers(
              vehicleId,
            )
            .call();
    
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

    static async retrieveNoOfServicingRecords(drizzle, vehicleId) {
        try {
          const res = await drizzle.contracts.VehicleRegistry.methods
            .retrieveNoOfServicingRecords(
              vehicleId,
            )
            .call();
    
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

    static async addAccidentRecord(drizzle, values) {
        const strConvert = drizzle.web3.utils.utf8ToHex;
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .addAccidentRecord(
              values.vehicleId,
              strConvert(values.accidentDateLocation),
              strConvert(values.driverName),
              strConvert(values.timeOfAccident),
              strConvert(values.descriptionOfAccident),
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

    static async retrieveNoOfAccidentRecords(drizzle, vehicleId) {
        try {
          const res = await drizzle.contracts.VehicleRegistry.methods
            .retrieveNoOfAccidentRecords(
              vehicleId,
            )
            .call();
    
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

    static async isAddressRegisteredOwner(drizzle, address) {
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .isAddressRegisteredOwner(
              address,
            )
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