const truffleAssert = require('truffle-assertions');
// const Web3 = require('web3');
// var web3 = new Web3('http://localhost:8545');
const Vehicle = artifacts.require('./Vehicle.sol');
const VehicleRegistry = artifacts.require('./VehicleRegistry.sol');

contract('VehicleRegistry', function (accounts) {

    let vehicleInstance;
    let vehicleRegistryInstance;

    // Vehicle Registry Owner
    const vehicleRegistryOwner = accounts[0];
    const vehicleRegistryOwnerName = web3.utils.utf8ToHex("John Tan");
    const vehicleRegistryOwnerDateJoined = web3.utils.utf8ToHex("1 Feb 2020");
    const vehicleRegistryOwnerContact = 90004302;

    // Admin
    const newAdmin = accounts[1];
    const newAdminName = web3.utils.utf8ToHex("Rachel Tan");
    const newAdminDateJoined = web3.utils.utf8ToHex("2 Feb 2020");
    const newAdminContact = 91114302;

    // Owner
    const owner = accounts[2];
    const ownerName = web3.utils.utf8ToHex("Takumi Fujiwara");
    const ownerContact = 92224302;
    const ownerCompanyRegNo = web3.utils.utf8ToHex(""); // Company Reg No. = Empty (Not a dealer)
    const ownerPhysicalAddress = web3.utils.utf8ToHex("95A Henderson Rd, S151095");
    const ownerDateOfReg = web3.utils.utf8ToHex("1 Mar 2020");

    // Workshop
    const workshop = accounts[3];
    const workshopName = web3.utils.utf8ToHex("Precise Auto Service");
    const workshopRegNo = web3.utils.utf8ToHex("35766600C");
    const workshopPhysicalAddress = web3.utils.utf8ToHex("1 Kaki Bukit Ave 6, S417883");
    const workshopContact = 67457367;
    const workshopDateOfReg = web3.utils.utf8ToHex("3 Apr 1986");

    // Insurance Company
    const insuranceCo = accounts[4];
    const insuranceCoName = web3.utils.utf8ToHex("NTUC Income Insurance");
    const insuranceCoRegNo = web3.utils.utf8ToHex("S97CS0162D");
    const insuranceCoPhysicalAddress = web3.utils.utf8ToHex("75 Bras Basah Rd, S189557");
    const insuranceCoContact = 67881777;
    const insuranceCoDateOfReg = web3.utils.utf8ToHex("1 Jan 1990");

    // Authorized party
    const authorizedParty = accounts[6]; // accounts[5] was used for testing

    // First vehicle variables
    let vehicleId;
    let noOfServicingRecordsOnVeh1;
    const vehicleNo = web3.utils.utf8ToHex("SOC4302S");
    const vehicleUpdatedLicensePlate = web3.utils.utf8ToHex("SOC8888C");
    const vehicleMakeModel = web3.utils.utf8ToHex("Toyota Corolla Altis");
    const vehicleManufacturingYear = 2020;
    const vehicleEngineNo = web3.utils.utf8ToHex("1NZX395892");
    const vehicleChassisNo = web3.utils.utf8ToHex("JN1FBAK12Z0000677");
    const vehicleOmv = 19615;
    const vehicleOrgRegDate = web3.utils.utf8ToHex("20 Oct 2020");
    const vehicleEffRegDate = web3.utils.utf8ToHex("20 Oct 2020");
    const vehicleNoOfTransfers = 0;
    const vehicleEngineCap = web3.utils.utf8ToHex("1,598 cc");
    const vehicleCoeCat = web3.utils.utf8ToHex("Category A");
    const vehicleQuotaPrem = 33520;
    const vehicleOwnerName = ownerName; // "Takumi Fujiwara"

    // Second vehicle variables
    let secondVehicleId;
    const secondLicensePlate = web3.utils.utf8ToHex("SOC5555C");
    const secondVehMakeModel = web3.utils.utf8ToHex("Honda Civic");
    const secondVehManufacturingYear = 2020;
    const secondVehEngineNo = web3.utils.utf8ToHex("ABC123");
    const secondVehChassisNo = web3.utils.utf8ToHex("123ABC");
    const secondVehOmv = 20000;
    const secondVehOrgRegDate = web3.utils.utf8ToHex("1 Jan 2020");
    const secondVehEffRegDate = web3.utils.utf8ToHex("1 Jan 2020");
    const secondVehNoOfTransfers = 0;
    const secondVehEngineCap = web3.utils.utf8ToHex("1,600 cc");
    const secondVehCoeCat = web3.utils.utf8ToHex("Category A");
    const secondVehQuotaPrem = 35000;
    const secondVehOwnerName = web3.utils.utf8ToHex("Samuel Wong");

    // Servicing variables
    let servicingId;
    const dateCompleted = web3.utils.utf8ToHex("1 June 2020");
    const typeOfWorkDone = web3.utils.utf8ToHex("Maintenance"); // Modification/Maintenance/Repair
    const appointedMechanic = web3.utils.utf8ToHex("Dominic Toretto");
    const currentMileage = web3.utils.utf8ToHex("20,000km");
    const workDone = web3.utils.utf8ToHex("Engine oil, oil filter");
    const totalCharges = web3.utils.utf8ToHex("$189.43");

    // Add another servicing to test the history function
    const dateCompleted2 = web3.utils.utf8ToHex("1 July 2020");
    const typeOfWorkDone2 = web3.utils.utf8ToHex("Modification");
    const appointedMechanic2 = web3.utils.utf8ToHex("Dominic Toretto");
    const currentMileage2 = web3.utils.utf8ToHex("40,000km");
    const workDone2 = web3.utils.utf8ToHex("Installed turbocharger");
    const totalCharges2 = web3.utils.utf8ToHex("$588.88");

    // Accident variables

    before(async () => {
        vehicleInstance = await Vehicle.deployed();
        vehicleRegistryInstance = await VehicleRegistry.deployed();
    });

    // Test 1: Test whether the vehicle registry owner is admin
    it('Test 1: Vehicle Registry Owner is registered as administrator', async () => {

        const role = await vehicleRegistryInstance.roleOfAddress(vehicleRegistryOwner);
        const noOfAdmins = await vehicleRegistryInstance.getNoOfAdmins();
        // console.log(`Role is: ${role}`);
        // console.log(`Role is: ${web3.utils.toAscii(role)}`);
        // console.log(`Object type of role is: ${typeof(role)}`);
        // console.log(`Number of admins: ${noOfAdmins}`);
        assert.equal(web3.utils.hexToUtf8(role), "Administrator", "Address is not an administrator");
        assert.strictEqual(noOfAdmins.toNumber(), 1);
    });

    // Test 2: Retrieve and update admin info
    it('Test 2: Retrieve and update admin info', async () => {

        let result = await vehicleRegistryInstance.retrieveAdminInfo(
            vehicleRegistryOwner, {
            from: vehicleRegistryOwner
        });

        // Testing
        // console.log(`Result: ${result}`);
        // console.log(`Result object values: ${Object.values(result)}`);
        // console.log(`Result keys: ${Object.keys(result)}`);
        // console.log(`Result entries: ${Object.entries(result)}`)

        // console.log(`Log: ${web3.utils.hexToUtf8(result.logs[0].args['1'])}`);
        // console.log(`Log: ${web3.utils.hexToUtf8(result.logs[0].args['2'])}`);
        // console.log(`Log: ${result.logs[0].args['3']}`);

        const adminName = web3.utils.hexToUtf8(result.logs[0].args['1']);
        const dateJoined = web3.utils.hexToUtf8(result.logs[0].args['2']);
        const contact = result.logs[0].args['3'].toNumber();

        assert.equal(adminName, "Genesis Admin", "Admin name does not match");
        assert.equal(dateJoined, "1 Jan 2020", "Date joined does not match");
        assert.equal(contact, 90000000, "Contact number does not match");

        let updateAdmin = await vehicleRegistryInstance.updateAdminInfo(
            vehicleRegistryOwner,
            vehicleRegistryOwnerName,
            vehicleRegistryOwnerDateJoined,
            vehicleRegistryOwnerContact
        );

        truffleAssert.eventEmitted(updateAdmin, 'adminInfoUpdated', ev => {
            return ev.adminAddress === vehicleRegistryOwner;
        }, 'Admin address does not match with the address to update');

    });

    // Test 3: Register new admin and remove admin
    it('Test 3: Register new admin', async () => {

        let registerAdmin = await vehicleRegistryInstance.registerAdmin(
            newAdmin,
            newAdminName,
            newAdminDateJoined,
            newAdminContact
        );

        assert.ok(registerAdmin);

        truffleAssert.eventEmitted(registerAdmin, 'adminRegistered', ev => {
            return ev.registeredAddress === newAdmin;
        }, 'Admin address does not match with the registered address');

    });

    // Test 4: Admin removal
    it('Test 4: Remove an admin', async () => {

        let adminToDelete = await vehicleRegistryInstance.registerAdmin(
            accounts[5],
            web3.utils.utf8ToHex("Account To Test Deletion"),
            web3.utils.utf8ToHex("1 Mar 2020"),
            90000000, {
            from: vehicleRegistryOwner
        });

        assert.ok(adminToDelete, "Admin registration failed");

        let adminRemoval = await vehicleRegistryInstance.removeAdmin(
            accounts[5], {
            from: vehicleRegistryOwner
        });

        assert.ok(adminRemoval, "Admin removal failed");

        const role = await vehicleRegistryInstance.roleOfAddress(accounts[5]);
        // console.log(web3.utils.hexToUtf8(role));
        assert.notEqual(web3.utils.hexToUtf8(role), "Administrator", "Address should not be an administrator");

    });

    // Test 5: Register owner
    it('Test 5: Register owner', async () => {

        let registerNewOwner = await vehicleRegistryInstance.registerOwnerDealer(
            owner,
            web3.utils.utf8ToHex("Name to be updated"),
            80000000,
            web3.utils.utf8ToHex(""), // Company Reg No. = Empty
            web3.utils.utf8ToHex("Address to be updated"),
            web3.utils.utf8ToHex("1 Jan 2000"),
            false
        );

        assert.ok(registerNewOwner);

        truffleAssert.eventEmitted(registerNewOwner, 'ownerDealerRegistered', ev => {
            return ev.ownerDealerAddress === owner;
        }, 'Owner address does not match with the registered address');

    });

    // Test 6: Retrieve and update owner info
    it('Test 6: Retrieve and update owner info', async () => {

        let result = await vehicleRegistryInstance.retrieveOwnerDealerInfo.call(
            owner, {
            from: vehicleRegistryOwner
        });

        // Converted to string variables
        const _ownerName = web3.utils.hexToUtf8(result[0]);
        const _contact = result[1].toNumber();
        const _physicalAddress = web3.utils.hexToUtf8(result[3]);
        const _dateOfReg = web3.utils.hexToUtf8(result[4]);
        const _isDealer = result[5];

        assert.equal(_ownerName, "Name to be updated", "Owner name does not match");
        assert.equal(_contact, 80000000, "Contact number does not match");
        assert.equal(_physicalAddress, "Address to be updated", "Physical address does not match");
        assert.equal(_dateOfReg, "1 Jan 2000", "Date of registration does not match");
        assert.equal(_isDealer, false, "Dealer boolean does not match");

        let updateOwner = await vehicleRegistryInstance.updateOwnerDealerInfo(
            owner,
            ownerName,
            ownerContact,
            ownerCompanyRegNo, // Company Reg No. = Empty
            ownerPhysicalAddress, // Physical address "95A Henderson Rd, Singapore 151095" 
            ownerDateOfReg,
            {
                from: vehicleRegistryOwner
            });

        assert.ok(updateOwner);

        truffleAssert.eventEmitted(updateOwner, 'ownerDealerInfoUpdated', ev => {
            return ev.ownerDealerAddress === owner;
        }, 'Owner address does not match with the address to update');

    });

    // Test 7: Dealer removal
    it('Test 7: Remove a dealer', async () => {

        let dealerToDelete = await vehicleRegistryInstance.registerOwnerDealer(
            accounts[5],
            web3.utils.utf8ToHex("Name to be deleted"),
            11111111,
            web3.utils.utf8ToHex("Reg no"),
            web3.utils.utf8ToHex("Address"),
            web3.utils.utf8ToHex("1 Jan 2000"),
            true, {
            from: vehicleRegistryOwner
        });

        assert.ok(dealerToDelete, "Dealer registration failed");

        let dealerRemoval = await vehicleRegistryInstance.removeDealer(
            accounts[5], {
            from: vehicleRegistryOwner
        });

        assert.ok(dealerRemoval, "Dealer removal failed");

        const role = await vehicleRegistryInstance.roleOfAddress(accounts[5]);
        // console.log(web3.utils.hexToUtf8(role)); // Should returns empty string
        assert.notEqual(web3.utils.hexToUtf8(role), "Dealer", "Address should not be a dealer");

    });

    // Test 8: Register workshop
    it('Test 8: Register workshop', async () => {

        let registerNewWorkshop = await vehicleRegistryInstance.registerWorkshop(
            workshop,
            web3.utils.utf8ToHex("Workshop name to be updated"),
            web3.utils.utf8ToHex(""), // Workshop Reg No. = Empty
            web3.utils.utf8ToHex("Address to be updated"),
            70000000,
            web3.utils.utf8ToHex("1 Mar 2020"),
            {
                from: vehicleRegistryOwner
            }
        );

        assert.ok(registerNewWorkshop);

        truffleAssert.eventEmitted(registerNewWorkshop, 'workshopRegistered', ev => {
            return ev.workshopAddress === workshop;
        }, 'Workshop address does not match with the registered address');

    });

    // Test 9: Retrieve and update workshop info
    it('Test 9: Retrieve and update workshop info', async () => {

        let result = await vehicleRegistryInstance.retrieveWorkshopInfo.call(
            workshop, {
            from: vehicleRegistryOwner
        });

        // Converted to string variables
        const _workshopName = web3.utils.hexToUtf8(result[0]);
        const _workshopRegNo = web3.utils.hexToUtf8(result[1]);
        const _physicalAddress = web3.utils.hexToUtf8(result[2]);
        const _contact = result[3].toNumber();
        const _dateOfReg = web3.utils.hexToUtf8(result[4]);

        assert.equal(_workshopName, "Workshop name to be updated", "Workshop name does not match");
        assert.equal(_workshopRegNo, "", "Workshop registration number does not match");
        assert.equal(_physicalAddress, "Address to be updated", "Physical address does not match");
        assert.equal(_contact, 70000000, "Contact number does not match");
        assert.equal(_dateOfReg, "1 Mar 2020", "Date of registration does not match");

        let updateWorkshop = await vehicleRegistryInstance.updateWorkshopInfo(
            workshop,
            workshopName,
            workshopRegNo,
            workshopPhysicalAddress,
            workshopContact,
            workshopDateOfReg,
            {
                from: vehicleRegistryOwner
            });

        assert.ok(updateWorkshop);

        truffleAssert.eventEmitted(updateWorkshop, 'workshopInfoUpdated', ev => {
            return ev.workshopAddress === workshop;
        }, 'Workshop address does not match with the address to update');

    });

    // Test 10: Workshop removal
    it('Test 10: Remove a workshop', async () => {

        let workshopToDelete = await vehicleRegistryInstance.registerWorkshop(
            accounts[5],
            web3.utils.utf8ToHex("Workshop name to be deleted"),
            web3.utils.utf8ToHex(""), // Workshop Reg No. = Empty
            web3.utils.utf8ToHex("Address to be deleted"),
            70000000,
            web3.utils.utf8ToHex("1 Jan 2000"),
            {
                from: vehicleRegistryOwner
            }
        );

        assert.ok(workshopToDelete, "Workshop registration failed");

        let workshopRemoval = await vehicleRegistryInstance.removeWorkshop(
            accounts[5], {
            from: vehicleRegistryOwner
        });

        assert.ok(workshopRemoval, "Workshop removal failed");

        const role = await vehicleRegistryInstance.roleOfAddress(accounts[5]);
        // console.log(web3.utils.hexToUtf8(role)); // Should returns empty string
        assert.notEqual(web3.utils.hexToUtf8(role), "Workshop", "Address should not be a workshop");

    });

    // Test 11: Register insurance company
    it('Test 11: Register insurance company', async () => {

        let registerNewInsuranceCo = await vehicleRegistryInstance.registerInsuranceCo(
            insuranceCo,
            web3.utils.utf8ToHex("Insurance company to be updated"),
            web3.utils.utf8ToHex(""), // Insurance Reg No. = Empty
            web3.utils.utf8ToHex("Address to be updated"),
            20000000,
            web3.utils.utf8ToHex("1 Jan 2000"),
            {
                from: vehicleRegistryOwner
            }
        );

        assert.ok(registerNewInsuranceCo);

        truffleAssert.eventEmitted(registerNewInsuranceCo, 'insuranceCoRegistered', ev => {
            return ev.insuranceCoAddress === insuranceCo;
        }, 'Insurance company address does not match with the registered address');

    });

    // Test 12: Retrieve and update insurance company info
    it('Test 12: Retrieve and update insurance company info', async () => {

        let result = await vehicleRegistryInstance.retrieveInsuranceCoInfo.call(
            insuranceCo, {
            from: vehicleRegistryOwner
        });

        // Converted to string variables
        const _insuranceCoName = web3.utils.hexToUtf8(result[0]);
        const _insuranceCoRegNo = web3.utils.hexToUtf8(result[1]);
        const _physicalAddress = web3.utils.hexToUtf8(result[2]);
        const _contact = result[3].toNumber();
        const _dateOfReg = web3.utils.hexToUtf8(result[4]);

        assert.equal(_insuranceCoName, "Insurance company to be updated", "Workshop name does not match");
        assert.equal(_insuranceCoRegNo, "", "Workshop registration number does not match");
        assert.equal(_physicalAddress, "Address to be updated", "Physical address does not match");
        assert.equal(_contact, 20000000, "Contact number does not match");
        assert.equal(_dateOfReg, "1 Jan 2000", "Date of registration does not match");

        let updateInsuranceCo = await vehicleRegistryInstance.updateInsuranceCoInfo(
            insuranceCo,
            insuranceCoName,
            insuranceCoRegNo,
            insuranceCoPhysicalAddress,
            insuranceCoContact,
            insuranceCoDateOfReg,
            {
                from: vehicleRegistryOwner
            });

        assert.ok(updateInsuranceCo);

        truffleAssert.eventEmitted(updateInsuranceCo, 'insuranceCoInfoUpdated', ev => {
            return ev.insuranceCoAddress === insuranceCo;
        }, 'Insurance company address does not match with the address to update');

    });

    // Test 13: Insurance company removal
    it('Test 13: Remove a insurance company', async () => {

        let insuranceCoToDelete = await vehicleRegistryInstance.registerInsuranceCo(
            accounts[5],
            web3.utils.utf8ToHex("Insurance company to be deleted"),
            web3.utils.utf8ToHex(""), // Insurance Reg No. = Empty
            web3.utils.utf8ToHex("Address to be deleted"),
            00000000,
            web3.utils.utf8ToHex("1 Jan 2000"),
            {
                from: vehicleRegistryOwner
            }
        );

        assert.ok(insuranceCoToDelete, "Insurance company registration failed");

        let insuranceCoRemoval = await vehicleRegistryInstance.removeInsuranceCo(
            accounts[5], {
            from: vehicleRegistryOwner
        });

        assert.ok(insuranceCoRemoval, "Insurance company removal failed");

        const role = await vehicleRegistryInstance.roleOfAddress(accounts[5]);
        // console.log(web3.utils.hexToUtf8(role)); // Should returns empty string
        assert.notEqual(web3.utils.hexToUtf8(role), "Insurance Company", "Address should not be a insurance company");

    });

    // Test 14: Register vehicle to owner
    it('Test 14: Register vehicle to owner', async () => {

        // Register vehicle part 1
        let registerVehicleToOwner1 = await vehicleRegistryInstance.registerVehicleToOwner1(
            owner,
            vehicleNo,
            vehicleMakeModel,
            vehicleManufacturingYear,
            vehicleEngineNo,
            vehicleChassisNo,
            vehicleOmv,
            vehicleOrgRegDate,
            vehicleEffRegDate,
            { from: vehicleRegistryOwner }
        );

        truffleAssert.eventEmitted(registerVehicleToOwner1, 'vehicleRegistration1Completed', ev => {
            return ev.newVehId.toNumber() === 1 && ev.ownerDealerAddress === owner;
        }, 'Vehicle ID or Owner addess does not match');

        // Register vehicle part 2
        let registerVehicleToOwner2 = await vehicleRegistryInstance.registerVehicleToOwner2(
            owner,
            vehicleNoOfTransfers,
            vehicleEngineCap,
            vehicleCoeCat,
            vehicleQuotaPrem,
            vehicleOwnerName,
            { from: vehicleRegistryOwner }
        );

        // First vehicle in the system so vehicle ID should be = 1
        truffleAssert.eventEmitted(registerVehicleToOwner2, 'vehicleRegistration2Completed', ev => {
            return ev.newVehId.toNumber() === 1 && ev.ownerDealerAddress === owner;
        }, 'Vehicle ID or Owner addess does not match');

    });

    // Test 15: Retrieve all vehicles own by owner
    it('Test 15: Retrieve all vehicles own by owner ', async () => {

        let retrieveAllVehiclesOwn = await vehicleRegistryInstance.retrieveAllVehiclesOwn.call(
            owner,
            { from: vehicleRegistryOwner }
        );

        // console.log(`Result entries: ${Object.entries(retrieveAllVehiclesOwn)}`);

        // There is only 1 vehicle own, and the vehicle ID is 1
        vehicleId = retrieveAllVehiclesOwn[0].toNumber();
        assert.strictEqual(retrieveAllVehiclesOwn[0].toNumber(), 1, "Vehicle ID does not match");

    });

    // Test 16: Authorize acess to other party
    it('Test 16: Authorize access to other party', async () => {

        let authorizeAccess = await vehicleRegistryInstance.authorizeAccess(
            vehicleId,
            owner,
            authorizedParty,
            { from: owner }
        );

        assert.ok(authorizeAccess);

        truffleAssert.eventEmitted(authorizeAccess, 'addressAuthorized', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.authorizer === owner
                && ev.authorizedAddress === authorizedParty;
        }, 'Vehicle ID or authorizer or authorized address does not match');

    });

    // Test 17: Retrieve authorized addresses for vehicle 
    it('Test 17: Retrieve authorized addresses for vehicle', async () => {

        // Notice the .call()
        let retrieveAuthorizedAddresses = await vehicleRegistryInstance.retrieveAuthorizedAddresses.call(
            vehicleId,
            owner,
            { from: owner }
        );

        // Result entries: VehicleID: 1, Authorized Address: [ '0x79293CCD9958C1f49E0C61584af44f216fe91617', '...', '...' ]
        // console.log(`Result entries: ${Object.entries(retrieveAuthorizedAddresses)}`);
        const _noOfAuthorizedParties = retrieveAuthorizedAddresses[0].toNumber();
        const _authorizedAddress = retrieveAuthorizedAddresses[1][0]; // Second parameter, first in the array

        assert.strictEqual(_noOfAuthorizedParties, 1, "Number of authorized parties does not match");
        assert.strictEqual(_authorizedAddress, authorizedParty, "Authorized party does not match");

        // truffleAssert.eventEmitted(retrieveAuthorizedAddresses, 'authorizedAddressesRetrieved', ev => {
        //     return ev.vehicleId.toNumber() === vehicleId
        //         && ev.ownerDealerAddress === owner;
        // }, 'Vehicle ID or authorizer or authorized address does not match');

    });

    // Test 18: Retrieve vehicle details by authorized party
    it('Test 18: Retrieve vehicle details by authorized party', async () => {

        let result = await vehicleRegistryInstance.retrieveVehicleDetails1(
            vehicleId, {
            from: authorizedParty
        });

        // console.log(`Result entries: ${Object.entries(result)}`); // return entries worked
        // console.log(`${ vehicleNo } and ${ vehicleMakeModel}`);

        truffleAssert.eventEmitted(result, 'vehRegDetails1Returned', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && web3.utils.hexToUtf8(ev.vehicleNo) === web3.utils.hexToUtf8(vehicleNo)
                && web3.utils.hexToUtf8(ev.makeModel) === web3.utils.hexToUtf8(vehicleMakeModel);
        }, 'Vehicle ID or number plate or make and model does not match');

        let result2 = await vehicleRegistryInstance.retrieveVehicleDetails1Part2(
            vehicleId, {
            from: authorizedParty
        });

        truffleAssert.eventEmitted(result2, 'vehRegDetails1Part2Returned', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.omv.toNumber() === vehicleOmv
                && web3.utils.hexToUtf8(ev.originalRegDate) === web3.utils.hexToUtf8(vehicleOrgRegDate)
                && web3.utils.hexToUtf8(ev.effectiveRegDate) === web3.utils.hexToUtf8(vehicleEffRegDate);
        }, 'Vehicle ID or omv or original or effective registration date does not match');

        let result3 = await vehicleRegistryInstance.retrieveVehicleDetails2(
            vehicleId, {
            from: authorizedParty
        });

        truffleAssert.eventEmitted(result3, 'vehRegDetails2Returned', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && web3.utils.hexToUtf8(ev.ownerName) === web3.utils.hexToUtf8(ownerName)
                && web3.utils.hexToUtf8(ev.engineCap) === web3.utils.hexToUtf8(vehicleEngineCap);
        }, 'Vehicle ID or owner name or engine capacity does not match');

    });

    // Test 19:
    it('Test 19: Remove authorization', async () => {

        // Testing: Create another authorized party to remove
        const authorizedParty2 = accounts[7];
        let authorizeAccess2 = await vehicleRegistryInstance.authorizeAccess(
            vehicleId,
            owner,
            authorizedParty2,
            { from: owner }
        );
        assert.ok(authorizeAccess2);

        let authorizationRemoval = await vehicleRegistryInstance.removeAuthorization(
            vehicleId,
            owner,
            authorizedParty2,
            { from: owner }
        );

        assert.ok(authorizationRemoval, "authorization removal failed"); // Failed

        // Notice the .call()
        let retrieveAuthorizedAddresses = await vehicleRegistryInstance.retrieveAuthorizedAddresses.call(
            vehicleId,
            owner,
            { from: owner }
        );

        // console.log(`Retrieve authorized addresses entries: ${Object.entries(retrieveAuthorizedAddresses)}`);

        const _noOfAuthorizedParties = retrieveAuthorizedAddresses[0].toNumber();
        const _authorizedAddress = retrieveAuthorizedAddresses[1][0]; // Second parameter, first in the array

        assert.strictEqual(_noOfAuthorizedParties, 1, "Number of authorized addresses does not match");
        assert.strictEqual(_authorizedAddress, authorizedParty, "Authorized address does not match");

        truffleAssert.eventEmitted(authorizationRemoval, 'authorizationRemoved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.authorizer === owner
                && ev.authorizedAddress === authorizedParty2;
        }, 'Vehicle ID or authorizer or authorized address does not match');

    });

    // Test 20: Update vehicle COE registration
    it('Test 20: Update vehicle COE registration', async () => {

        const newEffRegDate = web3.utils.utf8ToHex("20 Oct 2030");
        const newQuotaPrem = 50000;

        let updateVehCOE = await vehicleRegistryInstance.updateVehCOEReg(
            vehicleId,
            newEffRegDate,
            newQuotaPrem,
            { from: newAdmin }
        );

        assert.ok(updateVehCOE, "Update COE registration failed");

        truffleAssert.eventEmitted(updateVehCOE, 'vehicleCOERegUpdated', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && web3.utils.hexToUtf8(ev.effectiveRegDate) === web3.utils.hexToUtf8(newEffRegDate)
                && ev.quotaPrem.toNumber() === newQuotaPrem;
        }, 'Vehicle ID or effective registration date or quota premium does not match');

    });

    // Test 21: Update vehicle license plate
    it('Test 21: Update vehicle license plate', async () => {

        let updateLicensePlate = await vehicleRegistryInstance.updateVehLicensePlate(
            vehicleId,
            vehicleUpdatedLicensePlate,
            { from: newAdmin }
        );

        assert.ok(updateLicensePlate);

        truffleAssert.eventEmitted(updateLicensePlate, 'licensePlateChanged', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && web3.utils.hexToUtf8(ev.newLicensePlate) === web3.utils.hexToUtf8(vehicleUpdatedLicensePlate);
        }, 'Vehicle ID or new license plate does not match');

    });

    // Test 22: Swap vehicle license plate 
    it('Test 22: Swap vehicle license plate', async () => {

        // Registering another vehicle to swap plate:
        let registerVehicleToOwner1 = await vehicleRegistryInstance.registerVehicleToOwner1(
            owner,
            secondLicensePlate,
            secondVehMakeModel,
            secondVehManufacturingYear,
            secondVehEngineNo,
            secondVehChassisNo,
            secondVehOmv,
            secondVehOrgRegDate,
            secondVehEffRegDate,
            { from: newAdmin }
        );

        let registerVehicleToOwner2 = await vehicleRegistryInstance.registerVehicleToOwner2(
            owner,
            secondVehNoOfTransfers,
            secondVehEngineCap,
            secondVehCoeCat,
            secondVehOmv,
            secondVehOwnerName,
            { from: newAdmin }
        );

        // console.log(registerVehicleToOwner2.logs[0].args['0'].toNumber());
        secondVehicleId = registerVehicleToOwner2.logs[0].args['0'].toNumber();

        let swapLicensePlate = await vehicleRegistryInstance.swapVehLicensePlate(
            vehicleId,
            secondVehicleId,
            { from: newAdmin }
        );

        assert.ok(swapLicensePlate);

        truffleAssert.eventEmitted(swapLicensePlate, 'licensePlateSwapped', ev => {
            return web3.utils.hexToUtf8(ev.myNewLicensePlate) === web3.utils.hexToUtf8(secondLicensePlate)
                && web3.utils.hexToUtf8(ev.myOldLicensePlate) === web3.utils.hexToUtf8(vehicleUpdatedLicensePlate);
        }, 'New vehicle license plate does not match');

    });

    // Test 23: Deregister vehicle
    it('Test 23: Deregister vehicle', async () => {

        let deregisterVehicle = await vehicleRegistryInstance.deregisterVehicle(
            secondVehicleId,
            owner,
            { from: newAdmin }
        );

        assert.ok(deregisterVehicle, "Vehicle deregistration failed");

        truffleAssert.eventEmitted(deregisterVehicle, 'vehicleDeregistered', ev => {
            return ev.vehicleId.toNumber() === secondVehicleId;
        }, 'Vehicle de-registration was unsuccessful as vehicle id does not match');

        // Test if ERC721 token still exists (Successfully burnt)
        // let token1Exists = await vehicleRegistryInstance.doesTokenExists(vehicleId);
        // let token2Exists = await vehicleRegistryInstance.doesTokenExists(secondVehicleId);
        // console.log(token1Exists);
        // console.log(token2Exists);

    });

    // Test 24: Add servicing record
    it('Test 24: Add servicing record to vehicle', async () => {

        let addServicingRecord = await vehicleRegistryInstance.addServicingRecord(
            vehicleId,
            dateCompleted,
            workshopRegNo,
            typeOfWorkDone,
            appointedMechanic,
            currentMileage,
            workDone,
            totalCharges,
            { from: workshop }
        );

        // console.log(addServicingRecord.logs[0].args['1'].toNumber()); // = 1

        truffleAssert.eventEmitted(addServicingRecord, 'vehServicingDetailsRecorded', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.newServicingId.toNumber() === 1; // First servicing id for the vehicle will = 1
        }, 'Vehicle id or servicing id does not match');

        // Create a 2nd servicing record to test the servicing history function:
        let addServicingRecord2 = await vehicleRegistryInstance.addServicingRecord(
            vehicleId,
            dateCompleted2,
            workshopRegNo,
            typeOfWorkDone2,
            appointedMechanic2,
            currentMileage2,
            workDone2,
            totalCharges2,
            { from: workshop }
        );

        truffleAssert.eventEmitted(addServicingRecord2, 'vehServicingDetailsRecorded', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.newServicingId.toNumber() === 2; // Second servicing id for the vehicle will = 2
        }, 'Vehicle id or servicing id does not match');

    });

    // Test 25: Retrieve all servicing records on vehicle
    it('Test 25: Retrieve all servicing records on vehicle', async () => {

        // End of additional servicing record

        let allServicingRecordsOnVehicle = await vehicleRegistryInstance.retrieveAllServicingRecordsOn(
            vehicleId,
            { from: authorizedParty }
        );

        // console.log(allServicingRecordsOnVehicle.logs[0].args['0'].toNumber()); // servicing IDs = [ 1 ] 
        // console.log(Object.entries(allServicingRecordsOnVehicle.logs[0].args['0']));

        servicingId = allServicingRecordsOnVehicle.logs[0].args['0'].words[0];
        const noOfServicingRecords = allServicingRecordsOnVehicle.logs[0].args['0'].length;
        assert.strictEqual(noOfServicingRecords, 1, "Number of servicing records for vehicle does not match");

        truffleAssert.eventEmitted(allServicingRecordsOnVehicle, 'servicingRecordsForVehicleRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId;
        }, 'Vehicle id does not match');

    });


    // Test 26: functions = (retrieveServicingHistory1 + retrieveServicingHistory2)
    it('Test 26: Retrieve service record on vehicle', async () => {

        let retrieveServicingRecord1 = await vehicleRegistryInstance.retrieveServicingHistory1(
            vehicleId,
            servicingId,
            { from: owner }
        );

        // console.log(retrieveServicingRecord1);
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord1[0])); // 1 June 2020
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord1.dateCompleted)); // 1 June 2020

        truffleAssert.eventEmitted(retrieveServicingRecord1, 'vehServicingHistoryRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.servicingId.toNumber() === servicingId;
        }, 'Vehicle id or servicing id does not match');

        // Retrieving with authorized party instead to test access control
        let retrieveServicingRecord2 = await vehicleRegistryInstance.retrieveServicingHistory2(
            vehicleId,
            servicingId,
            { from: owner }
        );

        // console.log(retrieveServicingRecord2);
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord2[0])); // Maintenance
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord2.typeOfWorkDone)); // Maintenance

        truffleAssert.eventEmitted(retrieveServicingRecord2, 'vehServicingHistory2Retrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.servicingId.toNumber() === servicingId;
        }, 'Vehicle id or servicing id does not match');

    });

    // Test 27: Retrieve all vehicles serviced by workshop
    it('Test 27: Retrieve all vehicles serviced by workshop', async () => {

        let allVehiclesServicedByWorkshop = await vehicleRegistryInstance.retrieveAllVehIdsServicedBy.call(
            workshop,
            { from: workshop }
        );

        const vehicleIdServiced = allVehiclesServicedByWorkshop[0].toNumber();
        assert.strictEqual(vehicleIdServiced, 1, "Vehicle ID does not match");

    });

    // Test 28: Retrieve vehicle servicing records by workshop
    it('Test 28: Retrieve vehicle servicing records by workshop', async () => {

        let vehServicingRecordsByWorkshop = await vehicleRegistryInstance.retrieveVehServicingRecordsBy.call(
            workshop,
            vehicleId,
            { from: workshop }
        );

        const vehServicingIdDone = vehServicingRecordsByWorkshop[0].toNumber();
        assert.strictEqual(vehServicingIdDone, 1, "Vehicle ID does not match");

    });

    // Test 29: Retrieve number of servicing records on vehicle
    it('Test 29: Retrieve number of servicing records on vehicle', async () => {

        let noOfServicingRecordsOnVehicle = await vehicleRegistryInstance.retrieveNoOfServicingRecords(
            vehicleId,
            { from: workshop }
        );

        noOfServicingRecordsOnVeh1 = noOfServicingRecordsOnVehicle.logs[0].args['noOfServicingRecords'].words[0];

        truffleAssert.eventEmitted(noOfServicingRecordsOnVehicle, 'noOfServicingRecordsRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.noOfServicingRecords.toNumber() === 2;
        }, 'Vehicle id or number of servicing records does not match');

    });

    // Test 30: Loop & use functions = (retrieveServicingHistory1 + retrieveServicingHistory2)
    it('Test 30: Retrieve servicing history', async () => {

        let servDateCompleted1;
        let servDateCompleted2;
        let servTypeOfWorkDone;
        let servTypeOfWorkDone2;

        // Loop and retrieve servicing record (No of servicing records = 2)
        for (let i = 1; i <= noOfServicingRecordsOnVeh1; i++) {

            let retrieveServicingRecord1 = await vehicleRegistryInstance.retrieveServicingHistory1.call(
                vehicleId,
                i, // servicing id
                { from: workshop }
            );

            // console.log(Object.entries(retrieveServicingRecord1));

            if (i == 1) {
                servDateCompleted1 = retrieveServicingRecord1.dateCompleted;
            } else {
                servDateCompleted2 = retrieveServicingRecord1.dateCompleted;
            }

            let retrieveServicingRecord2 = await vehicleRegistryInstance.retrieveServicingHistory2.call(
                vehicleId,
                i, // servicing id
                { from: workshop }
            );

            // console.log(Object.entries(retrieveServicingRecord2));

            if (i == 1) {
                servTypeOfWorkDone = retrieveServicingRecord2.typeOfWorkDone;
            } else {
                servTypeOfWorkDone2 = retrieveServicingRecord2.typeOfWorkDone;
            }

        }

        assert.strictEqual(web3.utils.hexToUtf8(servDateCompleted1), web3.utils.hexToUtf8(dateCompleted), "First servicing date completed does not match");
        assert.strictEqual(web3.utils.hexToUtf8(servDateCompleted2), web3.utils.hexToUtf8(dateCompleted2), "Second servicing date completed does not match");
        assert.strictEqual(web3.utils.hexToUtf8(servTypeOfWorkDone), web3.utils.hexToUtf8(typeOfWorkDone), "First servicing type of work does not match");
        assert.strictEqual(web3.utils.hexToUtf8(servTypeOfWorkDone2), web3.utils.hexToUtf8(typeOfWorkDone2), "Second servicing type of work does not match");

    });

    // Test 31: 
    it('Test 31: Add accident record to vehicle', async () => {

    });

    // Test 32: 
    it('Test 32: Retrieve all accident records on vehicle', async () => {

    });

    // Test 33: function = (retrieveAccidentHistory1 + retrieveAccidentHistory2)
    it('Test 33: Retrieve accident record on vehicle', async () => {

    });

    // Test 34: 
    it('Test 34: Retrieve number of accident records on vehicle', async () => {

    });

    // Test 35: function = (retrieveAccidentHistory1 + retrieveAccidentHistory2)
    it('Test 35: Retrieve accident history', async () => {

    });

    // Test 36: 
    it('Test 36: Transfer vehicle to new owner', async () => {

    });

    // Test 37: Retrieve number of transfers for vehicle
    it('Test 37: Retrieve number of transfer for vehicle', async () => {


    });

    // Test 38: Retrieve ownership history for vehicle 
    it('Test 38: Retrieve ownership history for vehicle', async () => {

    });

    // // Test XX: Archived
    // it('Test XX: Retrieve all vehicles insured by insurance company', async () => {

    // });

    // // Test XX: Archived
    // it('Test XX: Retrieve accident records on vehicle by insurance company', async () => {

    // });

    // // Test XX: Archived 
    // it('Test XX: Approve consignment to other party', async () => {

    // });

    // // Test XX: Archived
    // it('Test XX: Retrieve consignment party information', async () => {

    // });

    // // Test XX: Archived
    // it('Test XX: Remove consignment rights', async () => {

    // });


    // // Test XX: Archived
    // it('Test XX: Retrieve all unacknowledged servicing records on vehicle', async () => {

    // });

    // // Test XX: Archived
    // it('Test XX: Acknowledge servicing record', async () => {

    // });

    // // Test XX: Archived
    // it('Test XX: Update accident claim status on vehicle', async () => {

    // });

});