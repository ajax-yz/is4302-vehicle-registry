class VehicleRegistryService1 {

    static async removeAuthorization(drizzle, vehicleId, authorizedAddress) {
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .removeAuthorization(
              vehicleId,
              authorizedAddress,
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


    static async retrieveAllVehIdsServicedByWorkshop(drizzle, workshopAddress) {
        try {
          const vehIds = await drizzle.contracts.VehicleRegistry.methods
            .retrieveAllVehIdsServicedByWorkshop(workshopAddress)
            .call();
          if (vehIds) {
         /*   // AccidenIds is an array of accidentId arrays for each veh
            const servicingIds = await Promise.all(
              vehIds.map(async (vehId) => {
                return drizzle.contracts.VehicleRegistry.retrieveAllServicingRecordsOn(
                  vehId,
                );
              }),
            );
    
            // _ids = { [vehId]: vehServicingIds }
            const _ids = {};
            vehIds.map((id, i) => {
              _ids[id] = servicingIds[i];
            });
            console.log("servicingIds ");
            const servicingRecords = await Promise.all(
              vehIds.map(async (vehId) => {
                const servicingRecordsForOneVehicle = _ids[vehId].map(
                  async (servicingId) => {
                    const data = await Promise.all([
                      this.retrieveServicingHistory1(drizzle, vehId, servicingId),
                      this.retrieveServicingHistory2(drizzle, vehId, servicingId),
                    ]);
                    return {
                      ...data[0],
                      ...data[1],
                      vehicleId: vehId,
                    };
                  },
                );
                console.log(
                  "servicingRecordsForOneVehicle= ",
                  servicingRecordsForOneVehicle,
                );
                return servicingRecordsForOneVehicle;
              }),
            );
            // console.log("veh =", vehicles);
            return servicingRecords;*/
            return vehIds;
          } else {
            return [];
          }
        } catch (e) {
          console.log("e =", e);
          return [];
        }
      }
    
      static async retrieveVehServicingRecordsByWorkshop(drizzle, workshopAddress, vehicleId) {
        try {
          const servIds = await drizzle.contracts.VehicleRegistry.methods
            .retrieveVehServicingRecordsByWorkshop(workshopAddress, vehicleId)
            .call();
          if (servIds) {

    
            // _ids = { [vehId]: vehServicingIds }
            console.log("servicingIds ");
            const servicingRecords = await Promise.all(
                async (servIds) => {
                    const data = await Promise.all([
                      this.retrieveServicingHistory1(drizzle, vehicleId, servIds),
                      this.retrieveServicingHistory2(drizzle, vehicleId, servIds),
                    ]);
                    return {
                      ...data[0],
                      ...data[1],
                      vehicleId: vehId,
                    };
                  },
                );
                console.log(
                  "servicingRecordsForOneVehicle= ",
                  servicingRecordsForOneVehicle,
                );
                return servicingRecordsForOneVehicle;
          } else {
            return [];
          }
        } catch (e) {
          console.log("e =", e);
          return [];
        }   
    }


    static async transferVehicle(drizzle, values, vehicleId, newOwnerAddress) {
        const strConvert = drizzle.web3.utils.utf8ToHex;
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .transferVehicle(
                vehicleId,
              newOwnerAddress,
              strConvert(values.newOwnerName),
              values.newOwnerContact,
              strConvert(values.newOwnerPhysicalAddress),
              strConvert(values.newOwnerDateOfReg),
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


      static async updateVehCOEReg(drizzle, values, vehicleId) {
        const strConvert = drizzle.web3.utils.utf8ToHex;
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .updateVehCOEReg(
              vehicleId,
              strConvert(values.effectiveRegDate),
              values.quotaPrem,
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

    static async updateVehLicensePlate(drizzle, values, vehicleId) {
        const strConvert = drizzle.web3.utils.utf8ToHex;
        try {
          const success = await drizzle.contracts.VehicleRegistry.methods
            .updateVehLicensePlate(
              vehicleId,
              strConvert(values.newLicensePlate),
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
export default VehicleRegistryService1;