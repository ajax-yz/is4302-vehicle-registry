class VehicleRegistryService {
  // ==================================== USERS ====================================
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
          strConvert(values.dateOfReg),
          values.isDealer,
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
          dateOfReg: res[4],
          isDealer: res[5],
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


  static async registerAdmin(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .registerAdmin(
          values.adminAddress,
          strConvert(values.adminName),
          strConvert(values.dateJoined),
          values.contact,
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


  static async retrieveAdminInfo(drizzle, adminAddress) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAdminInfo(adminAddress)
        .call();
      console.log("res =", res);
      if (res) {
        const info = {
          adminAddress: adminAddress,
          adminName: hexConvert(res[0]),
          dateJoined: hexConvert(res[1]),
          contact: res[2],
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
  
  static async registerWorkshop(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .registerWorkshop(
          values.workshopAddress,
          strConvert(values.workshopName),
          strConvert(values.workshopRegNo),
          strConvert(values.physicalAddress),
          values.contact,
          strConvert(values.DOR),
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
  static async retrieveWorkshopInfo(drizzle, workshopAddress) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveWorkshopInfo(workshopAddress)
        .call();
      console.log("res =", res);
      if (res) {
        const info = {
          workshopName: hexConvert(res[0]),
          workshopRegNo: hexConvert(res[1]),
          physicalAddress: hexConvert(res[2]),
          workshopContact: res[3],
          DOR: hexConvert(res[4]),
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
  static async updateWorkshopInfo(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .updateWorkshopInfo(
          values.workshopAddress,
          strConvert(values.workshopName),
          strConvert(values.workshopRegNo),
          strConvert(values.physicalAddress),
          values.contact,
          strConvert(values.DOR),
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
  static async addServicingRecord(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .addServicingRecord(
          values.vehicleId,
          strConvert(values.dateCompleted),
          strConvert(values.workshopRegNo),
          strConvert(values.typeOfWorkDone),
          strConvert(values.appointedMechanic),
          strConvert(values.currentMileage),
          strConvert(values.workDone),
          strConvert(values.totalCharges),
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
  static async retrieveAllVehIdsServicedBy(drizzle, workshopAddress) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehIdsServicedBy(workshopAddress)
        .call();
      console.log("res =", res);
      if (res) {
        // const info = {
        //   name: hexConvert(res[0]),
        //   contact: res[1],
        //   companyRegNo: hexConvert(res[2]),
        //   physicalAddress: hexConvert(res[3]),
        //   isDealer: res[4],
        //   noOfVehiclesOwn: res[5],
        // };
        return res;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  // ==================================== VEHICLES ====================================

  static async retrieveAllVehiclesOwn(drizzle, ownerAddress) {
    try {
      const vehIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehiclesOwn(ownerAddress)
        .call();
      console.log("vehIds =", vehIds);
      if (vehIds) {
        const vehicles = await Promise.all(
          vehIds.map(async (id) => {
            const data = await Promise.all([
              await this.retrieveVehicleDetails1(drizzle, id),
              await this.retrieveVehicleDetails1Part2(drizzle, id),
              await this.retrieveVehicleDetails2(drizzle, id),
            ]);
            return {
              vehicleId: id,
              ...data[0],
              ...data[1],
              ...data[2],
            };
          }),
        );
        console.log("veh =", vehicles);
        return vehicles;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async retrieveVehicleDetails1(drizzle, vehicleId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveVehicleDetails1(vehicleId)
        .call();
      if (res) {
        const details1 = {
          vehicleNo: hexConvert(res[0]),
          makeModel: hexConvert(res[1]),
          manufacturingYear: res[2],
          engineNo: hexConvert(res[3]),
          chassisNo: hexConvert(res[4]),
        };
        console.log("details 1=", details1);
        return details1;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  static async retrieveVehicleDetails1Part2(drizzle, vehicleId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveVehicleDetails1Part2(vehicleId)
        .call();
      if (res) {
        const details1p2 = {
          omv: res[0],
          originalRegDate: hexConvert(res[1]),
          effectiveRegDate: hexConvert(res[2]),
        };
        console.log("details1p2 =", details1p2);
        return details1p2;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  static async retrieveVehicleDetails2(drizzle, vehicleId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveVehicleDetails2(vehicleId)
        .call();
      if (res) {
        const details2 = {
          noOfTransfers: res[0],
          engineCap: hexConvert(res[1]),
          coeCat: hexConvert(res[2]),
          quotaPrem: res[3],
          ownerName: hexConvert(res[4]),
        };
        return details2;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  static async registerVehicleToOwner1(drizzle, values, ownerAddress) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .registerVehicleToOwner1(
          ownerAddress,
          strConvert(values.vehicleNo),
          strConvert(values.makeModel),
          values.manufacturingYear,
          strConvert(values.engineNo),
          strConvert(values.chassisNo),
          values.omv,
          strConvert(values.originalRegDate),
          strConvert(values.effectiveRegDate),
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

  static async registerVehicleToOwner2(drizzle, values, ownerAddress) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .registerVehicleToOwner2(
          ownerAddress,
          values.noOfTransfers,
          strConvert(values.engineCap),
          strConvert(values.coeCat),
          values.quotaPrem,
          strConvert(values.ownerName),
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

  // ==================================== ACCIDENT RECORDS ====================================
  static async retrieveAllAccidentHistory(drizzle, ownerAddress) {
    try {
      const vehIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehiclesOwn(ownerAddress)
        .call();
      if (vehIds) {
        // AccidenIds is an array of accidentId arrays for each veh
        const accidentIds = await Promise.all(
          vehIds.map(async (vehId) => {
            return drizzle.contracts.VehicleRegistry.retrieveAllAccidentRecordsOn(
              vehId,
            );
          }),
        );

        // _ids = { [vehId]: vehAccidentIds }
        const _ids = {};
        vehIds.map((id, i) => {
          _ids[id] = accidentIds[i];
        });
        console.log("accidentIds =", accidentIds);
        const accidentRecords = await Promise.all(
          vehIds.map(async (vehId) => {
            const accidentRecordsForOneVehicle = _ids[vehId].map(
              async (accidentId) => {
                const data = await Promise.all([
                  this.retrieveAccidentHistory1(drizzle, vehId, accidentId),
                  this.retrieveAccidentHistory2(drizzle, vehId, accidentId),
                ]);
                return {
                  ...data[0],
                  ...data[1],
                  vehicleId: vehId,
                };
              },
            );
            console.log(
              "accidentRecordsForOneVehicle= ",
              accidentRecordsForOneVehicle,
            );
            return accidentRecordsForOneVehicle;
          }),
        );
        // console.log("veh =", vehicles);
        return accidentRecords;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async retrieveAccidentHistory1(drizzle, vehicleId, accidentId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAccidentHistory1(vehicleId, accidentId)
        .call();
      if (res) {
        const history1 = {
          accidentDateLocation: hexConvert(res[0]),
          driverName: hexConvert(res[1]),
          timeOfAccident: hexConvert(res[2]),
          descriptionOfAccident: hexConvert(res[3]),
          insuranceCoName: hexConvert(res[4]),
        };
        return history1;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  static async retrieveAccidentHistory2(drizzle, vehicleId, accidentId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAccidentHistory2(vehicleId, accidentId)
        .call();
      if (res) {
        const history2 = {
          appointedWorkshopNo: hexConvert(res[0]),
          servicingId: res[1],
          remarks: hexConvert(res[2]),
          claimIssued: res[3],
        };
        return history2;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  // ==================================== SERVICING RECORDS ====================================
  static async retrieveAllServicingHistory(drizzle, ownerAddress) {
    try {
      const vehIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehiclesOwn(ownerAddress)
        .call();
      if (vehIds) {
        // AccidenIds is an array of accidentId arrays for each veh
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
        return servicingRecords;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async retrieveServicingHistory1(drizzle, vehicleId, servicingId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveServicingHistory1(vehicleId, servicingId)
        .call();
      if (res) {
        const history1 = {
          dateCompleted: hexConvert(res[0]),
          workshopRegNo: hexConvert(res[1]),
          appointedMechanic: hexConvert(res[2]),
          currentMileage: hexConvert(res[3]),
          workDone: hexConvert(res[4]),
        };
        return history1;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  static async retrieveServicingHistory2(drizzle, vehicleId, servicingId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveServicingHistory2(vehicleId, servicingId)
        .call();
      if (res) {
        const history2 = {
          typeOfWorkDone: hexConvert(res[0]),
          totalCharges: hexConvert(res[1]),
          acknowledgedByOwner: res[2],
        };
        return history2;
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
