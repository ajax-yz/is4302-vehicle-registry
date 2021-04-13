class VehicleRegistryService {
  // ==================================== OWNER/DEALER INFO/REMOVE FNS ====================================
  static async registerOwnerDealer(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .registerOwnerDealer(
          values.ownerDealerAddress,
          strConvert(values.name),
          values.contact,
          strConvert(values.companyRegNo),
          strConvert(values.physicalAddress),
          strConvert(values.dateOfReg),
          values.isDealer ? true : false,
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

  static async retrieveOwnerDealerInfo(drizzle, ownerDealerAddress) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveOwnerDealerInfo(ownerDealerAddress)
        .call();
      if (res) {
        const info = {
          ownerDealerAddress,
          name: hexConvert(res[0]),
          contact: res[1],
          companyRegNo: hexConvert(res[2]),
          physicalAddress: hexConvert(res[3]),
          dateOfReg: hexConvert(res[4]),
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

  static async updateOwnerDealerInfo(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .updateOwnerDealerInfo(
          values.ownerDealerAddress,
          strConvert(values.name),
          values.contact,
          strConvert(values.companyRegNo),
          strConvert(values.physicalAddress),
          strConvert(values.dateOfReg),
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
  static async removeDealer(drizzle, dealerAddress) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .removeDealer(dealerAddress)
        .send();
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  // ==================================== WORKSHOP INFO/REMOVE FNS ====================================
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
          strConvert(values.dateOfReg),
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
      if (res) {
        const info = {
          workshopAddress,
          workshopName: hexConvert(res[0]),
          workshopRegNo: hexConvert(res[1]),
          physicalAddress: hexConvert(res[2]),
          workshopContact: res[3],
          dateOfReg: hexConvert(res[4]),
          isActive: res[5],
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
          strConvert(values.dateOfReg),
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
  static async removeWorkshop(drizzle, workshopAddress) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .removeWorkshop(workshopAddress)
        .send();
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  // ==================================== ADMIN INFO/REMOVE FNS ====================================
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
      if (res) {
        const info = {
          adminAddress: adminAddress,
          adminName: hexConvert(res[0]),
          dateJoined: hexConvert(res[1]),
          contact: res[2],
          isActive: res[3],
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
  static async updateAdminInfo(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .updateAdminInfo(
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
  static async removeAdmin(drizzle, adminAddress) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .removeAdmin(adminAddress)
        .send();
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  // ==================================== Authorize FNS ====================================
  static async authorizeAccess(drizzle, values) {
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .authorizeAccess(values.vehicleId, values.authorizedAddress)
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
  static async retrieveAuthorizedAddresses(drizzle, vehicleId) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAuthorizedAddresses(vehicleId)
        .call();
      if (res) {
        const info = {
          noOfAuthorizedParties: res[0], //no of authorized parties for the given vehicleId
          authorizedParties: res[1], //array of authorized parties' addresses
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
  static async removeAuthorization(drizzle, values) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .removeAuthorization(values.vehicleId, values.authorizedAddress)
        .send();
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("e =", e);
      return false;
    }
  }

  // ==================================== VEHICLE INFO FNS ====================================
  static async retrieveAllVehiclesOwn(drizzle, ownerDealerAddress) {
    try {
      const vehIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehiclesOwn(ownerDealerAddress)
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

  static async retrieveOneVehicleDetails(drizzle, vehicleId) {
    const data = await Promise.all([
      await this.retrieveVehicleDetails1(drizzle, vehicleId),
      await this.retrieveVehicleDetails1Part2(drizzle, vehicleId),
      await this.retrieveVehicleDetails2(drizzle, vehicleId),
    ]);
    return {
      vehicleId,
      ...data[0],
      ...data[1],
      ...data[2],
    };
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

  // ============================ functions to be checked and added ==============
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
          0,
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

  // ==================================== VEHICLES ====================================

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

  static async deregisterVehicle(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .deregisterVehicle(values.vehicleId, values.ownerDealerAddress)
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
            return drizzle.contracts.VehicleRegistry.methods
              .retrieveAllAccidentRecordsOn(vehId)
              .call();
          }),
        );

        // _ids = { [vehId]: vehAccidentIds }
        const _ids = {};
        vehIds.map((id, i) => {
          _ids[id] = accidentIds[i];
        });
        console.log("accidentIds =", accidentIds);
        const recordsToReturn = [];
        await Promise.all(
          vehIds.map(async (vehId) => {
            await Promise.all(
              _ids[vehId].map(async (accidentId) => {
                const data = await Promise.all([
                  this.retrieveAccidentRecord1(drizzle, vehId, accidentId),
                  this.retrieveAccidentRecord2(drizzle, vehId, accidentId),
                ]);
                recordsToReturn.push({
                  vehicleId: vehId,
                  ...data[0],
                  ...data[1],
                });
              }),
            );
          }),
        );
        // console.log("recordsToReturn =", recordsToReturn);
        return recordsToReturn;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async retrieveAccidentRecord1(drizzle, vehicleId, accidentId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAccidentRecord1(vehicleId, accidentId)
        .call();
      if (res) {
        const history1 = {
          accidentDateLocation: hexConvert(res[0]),
          driverName: hexConvert(res[1]),
          timeOfAccident: hexConvert(res[2]),
          descriptionOfAccident: hexConvert(res[3]),
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

  static async retrieveAccidentRecord2(drizzle, vehicleId, accidentId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAccidentRecord2(vehicleId, accidentId)
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
            return drizzle.contracts.VehicleRegistry.methods
              .retrieveAllServicingRecordsOn(vehId)
              .call();
          }),
        );

        // _ids = { [vehId]: vehServicingIds }
        const _ids = {};
        vehIds.map((id, i) => {
          _ids[id] = servicingIds[i];
        });
        const dataToReturn = [];
        await Promise.all(
          vehIds.map(async (vehId) => {
            await Promise.all(
              _ids[vehId].map(async (servicingId) => {
                const data = await Promise.all([
                  this.retrieveServicingRecord1(drizzle, vehId, servicingId),
                  this.retrieveServicingRecord2(drizzle, vehId, servicingId),
                ]);
                dataToReturn.push({
                  vehicleId: vehId,
                  ...data[0],
                  ...data[1],
                });
              }),
            );
          }),
        );
        console.log("dataToReturn =", dataToReturn);
        // console.log("veh =", vehicles);
        return dataToReturn;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }
  static async retrieveOneVehicleServicingRecords(drizzle, vehicleId) {
    try {
      const servicingIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllServicingRecordsOn(vehicleId)
        .call();

      const servicingRecords = await Promise.all(
        servicingIds.map(async (sId) => {
          const data = await Promise.all([
            this.retrieveServicingRecord1(drizzle, vehicleId, sId),
            this.retrieveServicingRecord2(drizzle, vehicleId, sId),
          ]);

          return {
            vehicleId,
            ...data[0],
            ...data[1],
          };
        }),
      );

      if (servicingRecords) {
        return servicingRecords;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async retrieveOneVehicleAccidentRecords(drizzle, vehicleId) {
    try {
      const accidentIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllAccidentRecordsOn(vehicleId)
        .call();
      console.log("accidentIds =", accidentIds);

      const accidentRecords = await Promise.all(
        accidentIds.map(async (aId) => {
          const data = await Promise.all([
            this.retrieveAccidentRecord1(drizzle, vehicleId, aId),
            this.retrieveAccidentRecord2(drizzle, vehicleId, aId),
          ]);

          return {
            vehicleId,
            ...data[0],
            ...data[1],
          };
        }),
      );
      if (accidentRecords) {
        return accidentRecords;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async retrieveServicingRecord1(drizzle, vehicleId, servicingId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveServicingRecord1(vehicleId, servicingId)
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

  static async retrieveServicingRecord2(drizzle, vehicleId, servicingId) {
    const hexConvert = drizzle.web3.utils.toUtf8;
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveServicingRecord2(vehicleId, servicingId)
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

  static async retrieveAllVehAccidentRecordsByWorkshop(
    drizzle,
    workshopAddress,
  ) {
    try {
      const dataToReturn = [];
      const vehIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehIdsServicedByWorkshop(workshopAddress)
        .call();
      const accidentRecords = await Promise.all(
        vehIds.map(async (vId) => {
          const data = await this.retrieveOneVehicleAccidentRecords(
            drizzle,
            vId,
          );
          dataToReturn.push({
            vehicleId: vId,
            ...data,
          });
        }),
      );
      if (dataToReturn) {
        return dataToReturn;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e=", e);
      return [];
    }
  }

  static async retrieveAllVehServiceRecordsByWorkshop(
    drizzle,
    workshopAddress,
  ) {
    try {
      const vehIds = await drizzle.contracts.VehicleRegistry.methods
        .retrieveAllVehIdsServicedByWorkshop(workshopAddress)
        .call();
      console.log("vehIds =", vehIds);

      // retrieveVehServicingRecordsByWorkshop
      const servicingIds = await Promise.all(
        vehIds.map(async (vehId) => {
          return drizzle.contracts.VehicleRegistry.methods
            .retrieveAllServicingRecordsOn(vehId)
            .call();
        }),
      );

      console.log("servicingIds=", servicingIds);
      // _ids = { [vehId]: vehServicingIds }
      const _ids = {};
      vehIds.map((id, i) => {
        _ids[id] = servicingIds[i];
      });
      const recordsToReturn = [];
      await Promise.all(
        vehIds.map(async (vehId) => {
          await Promise.all(
            _ids[vehId].map(async (servicingId) => {
              const data = await Promise.all([
                this.retrieveServicingRecord1(drizzle, vehId, servicingId),
                this.retrieveServicingRecord2(drizzle, vehId, servicingId),
              ]);
              recordsToReturn.push({
                vehicleId: vehId,
                ...data[0],
                ...data[1],
              });
              return {
                vehicleId: vehId,
                ...data[0],
                ...data[1],
              };
            }),
          );
        }),
      );

      if (recordsToReturn) {
        return recordsToReturn;
      } else {
        return [];
      }
    } catch (e) {
      console.log("e =", e);
      return [];
    }
  }

  static async transferVehicle(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .transferVehicle(
          values.vehicleId,
          values.newOwnerAddress,
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

  static async updateVehCOEReg(drizzle, values) {
    const strConvert = drizzle.web3.utils.utf8ToHex;
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .updateVehCOEReg(
          values.vehicleId,
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
          values.vehicleId,
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

  static async removeAuthorization(drizzle, values) {
    try {
      const success = await drizzle.contracts.VehicleRegistry.methods
        .removeAuthorization(values.vehicleId, values.authorizedAddress)
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
        .retrieveNoOfTransfers(vehicleId)
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
        .retrieveNoOfServicingRecords(vehicleId)
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

  static async retrieveNoOfAccidentRecords(drizzle, vehicleId) {
    try {
      const res = await drizzle.contracts.VehicleRegistry.methods
        .retrieveNoOfAccidentRecords(vehicleId)
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
}

export default VehicleRegistryService;
