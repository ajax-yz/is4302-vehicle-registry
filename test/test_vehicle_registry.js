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

    const newOwner = accounts[8];
    const newOwnerName = web3.utils.utf8ToHex("Lewis Hamilton");
    const newOwnerContact = 88884302;
    const newOwnerPhysicalAddress = web3.utils.utf8ToHex("50 Ocean Drive, S098433");
    const newOwnerDateOfReg = web3.utils.utf8ToHex("1 Nov 2020");

    // Workshop
    const workshop = accounts[3];
    const workshopName = web3.utils.utf8ToHex("Precise Auto Service");
    const workshopRegNo = web3.utils.utf8ToHex("35766600C");
    const workshopPhysicalAddress = web3.utils.utf8ToHex("1 Kaki Bukit Ave 6, S417883");
    const workshopContact = 67457367;
    const workshopDateOfReg = web3.utils.utf8ToHex("3 Apr 1986");

    // Authorized party
    const authorizedParty = accounts[6]; // accounts[5] was used for testing

    // First vehicle variables
    let vehicleId;
    let noOfServicingRecordsOnVeh1;
    let noOfTransfersOnVeh1
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
    const typeOfWorkDone = web3.utils.utf8ToHex("Maintenance"); // Modification/Maintenance/Repair/Accident
    const appointedMechanic = web3.utils.utf8ToHex("Dominic Toretto");
    const currentMileage = web3.utils.utf8ToHex("20,000km");
    const workDone = web3.utils.utf8ToHex("Engine oil, oil filter");
    const totalCharges = web3.utils.utf8ToHex("$189.43");

    // Add another servicing to test the history function
    let servicingId2;
    const dateCompleted2 = web3.utils.utf8ToHex("1 July 2020");
    const typeOfWorkDone2 = web3.utils.utf8ToHex("Modification"); // Accident-related servicing work
    const appointedMechanic2 = web3.utils.utf8ToHex("Dominic Toretto");
    const currentMileage2 = web3.utils.utf8ToHex("40,000km");
    const workDone2 = web3.utils.utf8ToHex("Installed exhaust system");
    const totalCharges2 = web3.utils.utf8ToHex("$1888.88");

    // Add another servicing to test the linkage to accident record
    let servicingId3;
    const dateCompleted3 = web3.utils.utf8ToHex("1 Aug 2020");
    const typeOfWorkDone3 = web3.utils.utf8ToHex("Accident"); // Accident-related servicing work
    const appointedMechanic3 = web3.utils.utf8ToHex("Dominic Toretto");
    const currentMileage3 = web3.utils.utf8ToHex("50,000km");
    const workDone3 = web3.utils.utf8ToHex("Panel damages caused by accident");
    const totalCharges3 = web3.utils.utf8ToHex("$888.88");

    // Accident variables
    let accidentId;
    let noOfAccidentRecordsOnVeh1;
    const accidentDateLocation = web3.utils.utf8ToHex("1 Sept 2020, Orchard Rd");
    const driverName = web3.utils.utf8ToHex("Jonathan Tan");
    const timeOfAccident = web3.utils.utf8ToHex("11:59 PM");
    const descriptionOfAccident = web3.utils.utf8ToHex("Lost control and crashed");

    let accidentId2;
    const accidentDateLocation2 = web3.utils.utf8ToHex("1 Oct 2020, PIE");
    const driverName2 = web3.utils.utf8ToHex("Takumi Fujiwara");
    const timeOfAccident2 = web3.utils.utf8ToHex("11:11 PM");
    const descriptionOfAccident2 = web3.utils.utf8ToHex("Highway chain collison");

    before(async () => {
        vehicleInstance = await Vehicle.deployed();
        vehicleRegistryInstance = await VehicleRegistry.deployed();
    });

    // Test 1: Test whether the vehicle registry owner is admin
    it('Test 1: Vehicle registry owner is registered as administrator', async () => {

        const role = await vehicleRegistryInstance.roleOfAddress(vehicleRegistryOwner);
        const noOfAdmins = await vehicleRegistryInstance.getNoOfAdmins();
        assert.equal(web3.utils.hexToUtf8(role), "Administrator", "Address is not an administrator");
        assert.strictEqual(noOfAdmins.toNumber(), 1);
    });

    // Test 2: Retrieve and update admin information
    it('Test 2: Retrieve and update admin information', async () => {

        let result = await vehicleRegistryInstance.retrieveAdminInfo.call(
            vehicleRegistryOwner, {
            from: vehicleRegistryOwner
        });

        // console.log(`Result entries: ${Object.entries(result)}`);
        const adminName = web3.utils.hexToUtf8(result[0]);
        const dateJoined = web3.utils.hexToUtf8(result[1]);
        const contact = result[2].toNumber();

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

    // Test 3: Register new admin
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

        // Register a new admin to test removal
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

    // Test 5: Retrieve all admins and active admins
    it('Test 5: Register all admins and active admins', async () => {

        let allAdmins = await vehicleRegistryInstance.getAllAdmins.call({ from: vehicleRegistryOwner });
        let allActiveAdmins = await vehicleRegistryInstance.getAllActiveAdmins.call({ from: vehicleRegistryOwner });

        assert.strictEqual(allAdmins.length, 3, "Total number of admins do not match");
        assert.strictEqual(allActiveAdmins.length, 2, "Total number of active admins do not match");

    });

    // Test 6: Register owner
    it('Test 6: Register owner', async () => {

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

    // Test 7: Retrieve and update owner information
    it('Test 7: Retrieve and update owner information', async () => {

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

    // Test 8: Dealer removal
    it('Test 8: Remove a dealer', async () => {

        // Register a new dealer to test removal
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

    // Test 9: Retrieve all owners/dealers and active owners/dealers
    it('Test 9: Register all owners/dealers and active owners/dealers', async () => {

        let allOwnersDealers = await vehicleRegistryInstance.getAllOwnerDealers.call({
            from: newAdmin
        });

        let allActiveOwnersDealers = await vehicleRegistryInstance.getAllActiveOwnerDealers.call({
            from: newAdmin
        });

        assert.strictEqual(allOwnersDealers.length, 2, "Total number of owners/dealers do not match");
        assert.strictEqual(allActiveOwnersDealers.length, 1, "Total number of active owners/dealers do not match");

    });

    // Test 10: Register workshop
    it('Test 10: Register workshop', async () => {

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

    // Test 11: Retrieve and update workshop information
    it('Test 11: Retrieve and update workshop information', async () => {

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

    // Test 12: Workshop removal
    it('Test 12: Remove a workshop', async () => {

        // Register a new workshop to test removal
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

    // Test 13: Retrieve all workshops and active workshops
    it('Test 13: Register all workshops and active workshops', async () => {

        let allWorkshops = await vehicleRegistryInstance.getAllWorkshops.call({ from: vehicleRegistryOwner });
        let allActiveWorkshops = await vehicleRegistryInstance.getAllActiveWorkshops.call({ from: vehicleRegistryOwner });

        assert.strictEqual(allWorkshops.length, 2, "Total number of workshops do not match");
        assert.strictEqual(allActiveWorkshops.length, 1, "Total number of active workshops do not match");

    });

    // Test 14: Register first vehicle to owner
    it('Test 14: Register first vehicle to owner', async () => {

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

    // Test 16: Authorize acess to other party (Accounts[6])
    it('Test 16: Authorize access to other party by owner', async () => {

        let authorizeAccess = await vehicleRegistryInstance.authorizeAccess(
            vehicleId,
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

    // Test 17: Retrieve authorized addresses for vehicle by owner
    it('Test 17: Retrieve authorized addresses for vehicle by owner', async () => {

        // Notice the .call()
        let retrieveAuthorizedAddresses = await vehicleRegistryInstance.retrieveAuthorizedAddresses.call(
            vehicleId,
            { from: owner }
        );

        // Result entries: VehicleID: 1, Authorized Address: [ '0x79293CCD9958C1f49E0C61584af44f216fe91617', '...', '...' ]
        // console.log(`Result entries: ${Object.entries(retrieveAuthorizedAddresses)}`);
        const _noOfAuthorizedParties = retrieveAuthorizedAddresses[0].toNumber();
        const _authorizedAddress = retrieveAuthorizedAddresses[1][0]; // Second parameter, first in the array

        assert.strictEqual(_noOfAuthorizedParties, 1, "Number of authorized parties does not match");
        assert.strictEqual(_authorizedAddress, authorizedParty, "Authorized party does not match");
    });

    // Test 18: Retrieve vehicle details by authorized party
    it('Test 18: Retrieve vehicle details by authorized party', async () => {

        // Split into 3 to prevent stack too deep
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

    // Test 19: Remove authorization
    it('Test 19: Remove authorization', async () => {

        // Create another authorized party to test removal
        const authorizedParty2 = accounts[7];
        let authorizeAccess2 = await vehicleRegistryInstance.authorizeAccess(
            vehicleId,
            authorizedParty2,
            { from: owner }
        );
        assert.ok(authorizeAccess2);

        let authorizationRemoval = await vehicleRegistryInstance.removeAuthorization(
            vehicleId,
            authorizedParty2,
            { from: owner }
        );

        assert.ok(authorizationRemoval, "authorization removal failed"); // Failed

        // Notice the .call()
        let retrieveAuthorizedAddresses = await vehicleRegistryInstance.retrieveAuthorizedAddresses.call(
            vehicleId,
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

    // Test 20: Update first vehicle COE registration
    it('Test 20: Update first vehicle COE registration', async () => {

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
    it('Test 21: Update vehicle license plate of first vehicle', async () => {

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

    // Test 22: Swap first vehicle license plate 
    it('Test 22: Swap first vehicle license plate with second vehicle', async () => {

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

    // Test 23: Deregister second vehicle
    it('Test 23: Deregister second vehicle', async () => {

        let deregisterVehicle = await vehicleRegistryInstance.deregisterVehicle(
            secondVehicleId,
            owner,
            { from: newAdmin }
        );

        assert.ok(deregisterVehicle, "Vehicle deregistration failed");

        truffleAssert.eventEmitted(deregisterVehicle, 'vehicleDeregistered', ev => {
            return ev.vehicleId.toNumber() === secondVehicleId;
        }, 'Vehicle de-registration was unsuccessful as vehicle id does not match');

    });

    // Test 24: Add 2 servicing records
    it('Test 24: Add 2 servicing records to first vehicle by workshop', async () => {

        let addServicingRecord = await vehicleRegistryInstance.addServicingRecord(
            vehicleId,
            dateCompleted,
            workshopRegNo,
            typeOfWorkDone,
            appointedMechanic,
            currentMileage,
            workDone,
            totalCharges,
            0, // No accident id related to this servicing record
            { from: workshop }
        );

        // console.log(addServicingRecord.logs[0].args['1'].toNumber()); // = 1
        servicingId = addServicingRecord.logs[0].args.newServicingId.toNumber();

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
            0, // No accident id related to this servicing record
            { from: workshop }
        );

        // console.log(Object.entries(addServicingRecord2.logs[0].args.newServicingId));
        // console.log(addServicingRecord2.logs[0].args.newServicingId.toNumber());
        // console.log(addServicingRecord2.logs[0].args.newServicingId.words[0]);

        servicingId2 = addServicingRecord2.logs[0].args.newServicingId.toNumber();

        truffleAssert.eventEmitted(addServicingRecord2, 'vehServicingDetailsRecorded', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.newServicingId.toNumber() === 2; // Second servicing id for the vehicle will = 2
        }, 'Vehicle id or servicing id does not match');

    });

    // Test 25: Retrieve all servicing records on first vehicle
    it('Test 25: Retrieve all servicing records on first vehicle by authorized party', async () => {

        let allServicingRecordsOnVehicle = await vehicleRegistryInstance.retrieveAllServicingRecordsOn(
            vehicleId,
            { from: authorizedParty }
        );

        const noOfServicingRecords = allServicingRecordsOnVehicle.logs[1].args.noOfServicingRecords.toNumber();
        assert.strictEqual(noOfServicingRecords, 2, "Number of servicing records on vehicle does not match");

        truffleAssert.eventEmitted(allServicingRecordsOnVehicle, 'servicingRecordsForVehicleRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.noOfServicingRecords.toNumber() == 2;
        }, 'Vehicle id or number of servicing records does not match');

    });


    // Test 26: functions = (retrieveServicingRecord1 + retrieveServicingRecord2)
    it('Test 26: Retrieve first servicing record on first vehicle by owner', async () => {

        let retrieveServicingRecord1 = await vehicleRegistryInstance.retrieveServicingRecord1(
            vehicleId,
            servicingId,
            { from: owner }
        );

        // console.log(retrieveServicingRecord1);
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord1[0])); // 1 June 2020
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord1.dateCompleted)); // 1 June 2020

        truffleAssert.eventEmitted(retrieveServicingRecord1, 'vehServicingRecordRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.servicingId.toNumber() === servicingId;
        }, 'Vehicle id or servicing id does not match');

        // Retrieving with authorized party instead to test access control
        let retrieveServicingRecord2 = await vehicleRegistryInstance.retrieveServicingRecord2(
            vehicleId,
            servicingId,
            { from: owner }
        );

        // console.log(retrieveServicingRecord2);
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord2[0])); // Maintenance
        // console.log(web3.utils.hexToUtf8(retrieveServicingRecord2.typeOfWorkDone)); // Maintenance

        truffleAssert.eventEmitted(retrieveServicingRecord2, 'vehServicingRecord2Retrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.servicingId.toNumber() === servicingId;
        }, 'Vehicle id or servicing id does not match');

    });

    // Test 27: Retrieve all vehicles serviced by workshop
    it('Test 27: Retrieve all vehicles serviced by workshop', async () => {

        let allVehiclesServicedByWorkshop = await vehicleRegistryInstance.retrieveAllVehIdsServicedByWorkshop.call(
            workshop,
            { from: workshop }
        );

        const vehicleIdServiced = allVehiclesServicedByWorkshop[0].toNumber();
        assert.strictEqual(vehicleIdServiced, 1, "Vehicle ID does not match");

    });

    // Test 28: Retrieve all servicing records on first vehicle by workshop
    it('Test 28: Retrieve all servicing records on first vehicle by workshop', async () => {

        let vehServicingRecordsByWorkshop = await vehicleRegistryInstance.retrieveVehServicingRecordsByWorkshop.call(
            workshop,
            vehicleId,
            { from: workshop }
        );

        const vehServicingIdDone = vehServicingRecordsByWorkshop[0].toNumber();
        assert.strictEqual(vehServicingIdDone, 1, "Vehicle ID does not match");

    });

    // Test 29: Retrieve total number of servicing records on first vehicle by workshop
    it('Test 29: Retrieve total number of servicing records on first vehicle by workshop', async () => {

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

    // Test 30: Loop & use functions = (retrieveServicingRecord1 + retrieveServicingRecord2)
    it('Test 30: Retrieve servicing history of first vehicle', async () => {

        let servDateCompleted1;
        let servDateCompleted2;
        let servTypeOfWorkDone;
        let servTypeOfWorkDone2;

        // Loop and retrieve servicing record (No of servicing records = 2)
        for (let i = 1; i <= noOfServicingRecordsOnVeh1; i++) {

            let retrieveServicingRecord1 = await vehicleRegistryInstance.retrieveServicingRecord1.call(
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

            let retrieveServicingRecord2 = await vehicleRegistryInstance.retrieveServicingRecord2.call(
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
    it('Test 31: Add accident record to first vehicle by administrator and link a servicing record to accident record by workshop', async () => {

        let addAccidentRecord = await vehicleRegistryInstance.addAccidentRecord(
            vehicleId,
            accidentDateLocation,
            driverName,
            timeOfAccident,
            descriptionOfAccident,
            { from: newAdmin }
        );

        accidentId = addAccidentRecord.logs[0].args.newAccidentId.toNumber();

        truffleAssert.eventEmitted(addAccidentRecord, 'vehAccidentDetailsRecorded', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.newAccidentId.toNumber() === 1; // First accident id for the vehicle will = 1
        }, 'Vehicle id or accident id does not match');

        // Create a 2nd accident record to test the accident history function:
        let addAccidentRecord2 = await vehicleRegistryInstance.addAccidentRecord(
            vehicleId,
            accidentDateLocation2,
            driverName2,
            timeOfAccident2,
            descriptionOfAccident2,
            { from: newAdmin }
        );

        accidentId2 = addAccidentRecord2.logs[0].args.newAccidentId.toNumber();

        truffleAssert.eventEmitted(addAccidentRecord2, 'vehAccidentDetailsRecorded', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.newAccidentId.toNumber() === 2; // Second accident id for the vehicle will = 2
        }, 'Vehicle id or accident id does not match');

        // **************** Link servicing record to accident record **************** //

        // Create 3rd servicing record to link to accident record:
        let addServicingRecord3 = await vehicleRegistryInstance.addServicingRecord(
            vehicleId,
            dateCompleted3,
            workshopRegNo,
            typeOfWorkDone3,
            appointedMechanic3,
            currentMileage3,
            workDone3,
            totalCharges3,
            accidentId, // accident id = 1
            { from: workshop }
        );

        servicingId3 = addServicingRecord3.logs[0].args.newServicingId.toNumber(); // = 3

        truffleAssert.eventEmitted(addServicingRecord3, 'vehServicingDetailsRecorded', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.newServicingId.toNumber() === 3; // third servicing id for the vehicle will = 3
        }, 'Vehicle id or servicing id does not match');

    });

    // Test 32: Retrieve all accident records on first vehicle by authorized party
    it('Test 32: Retrieve all accident records on first vehicle by authorized party', async () => {

        let allAccidentRecordsOnVehicle = await vehicleRegistryInstance.retrieveAllAccidentRecordsOn(
            vehicleId,
            { from: authorizedParty }
        );

        // console.log(Object.entries(allAccidentRecordsOnVehicle.logs));
        // console.log(Object.entries(allAccidentRecordsOnVehicle.logs[1].args.noOfAccidentRecords));
        // console.log(allAccidentRecordsOnVehicle.logs[1].args.noOfAccidentRecords.toNumber());

        const noOfAccidentsRecords = allAccidentRecordsOnVehicle.logs[1].args.noOfAccidentRecords.toNumber();
        assert.strictEqual(noOfAccidentsRecords, 2, "Number of accident records on vehicle does not match");

        truffleAssert.eventEmitted(allAccidentRecordsOnVehicle, 'accidentRecordsForVehicleRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.noOfAccidentRecords.toNumber() === 2;
        }, 'Vehicle id or number of accident records does not match');

    });

    // Test 33: function = (retrieveAccidentRecord1 + retrieveAccidentRecord2)
    it('Test 33: Retrieve first accident record on first vehicle by workshop', async () => {

        let retrieveAccidentRecord1 = await vehicleRegistryInstance.retrieveAccidentRecord1(
            vehicleId,
            accidentId,
            { from: workshop }
        );

        // console.log(retrieveAccidentRecord1);
        // console.log(web3.utils.hexToUtf8(retrieveAccidentRecord1[0]));
        // console.log(web3.utils.hexToUtf8(retrieveAccidentRecord1.accidentDateLocation));

        truffleAssert.eventEmitted(retrieveAccidentRecord1, 'vehAccidentRecordRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.accidentId.toNumber() === accidentId;
        }, 'Vehicle id or accident id does not match');

        // Retrieving with authorized party instead to test access control
        let retrieveAccidentRecord2 = await vehicleRegistryInstance.retrieveAccidentRecord2(
            vehicleId,
            accidentId,
            { from: workshop }
        );

        // console.log(retrieveAccidentRecord2);
        // console.log(web3.utils.hexToUtf8(retrieveAccidentRecord2[0]));
        // console.log(web3.utils.hexToUtf8(retrieveAccidentRecord2.appointedWorkshopNo));
        // console.log(retrieveAccidentRecord2.servicingId.toNumber());

        truffleAssert.eventEmitted(retrieveAccidentRecord2, 'vehAccidentRecord2Retrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.accidentId.toNumber() === accidentId;
        }, 'Vehicle id or accident id does not match');

    });

    // Test 34: Retrieve total number of accident records on vehicle by workshop
    it('Test 34: Retrieve total number of accident records on first vehicle by workshop', async () => {

        let noOfAccidentRecordsOnVehicle = await vehicleRegistryInstance.retrieveNoOfAccidentRecords(
            vehicleId,
            { from: workshop }
        );

        // console.log(Object.entries(noOfAccidentRecordsOnVehicle.logs[0]));
        // console.log(noOfAccidentRecordsOnVehicle.logs[0].args['noOfAccidentRecords'].words[0]); // 2
        // console.log(noOfAccidentRecordsOnVehicle.logs[0].args.noOfAccidentRecords.toNumber()); // 2

        noOfAccidentRecordsOnVeh1 = noOfAccidentRecordsOnVehicle.logs[0].args.noOfAccidentRecords.toNumber();

        truffleAssert.eventEmitted(noOfAccidentRecordsOnVehicle, 'noOfAccidentRecordsRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.noOfAccidentRecords.toNumber() === 2;
        }, 'Vehicle id or number of accident records does not match');

    });

    // Test 35: function = (retrieveAccidentRecord1 + retrieveAccidentRecord2)
    it('Test 35: Retrieve accident history on first vehicle by workshop', async () => {

        let _accidentDateLocation1;
        let _accidentDateLocation2;
        let _servicingId1;
        let _servicingId2;

        // Loop and retrieve servicing record (No of servicing records = 2)
        for (let i = 1; i <= noOfAccidentRecordsOnVeh1; i++) {

            let retrieveAccidentRecord1 = await vehicleRegistryInstance.retrieveAccidentRecord1.call(
                vehicleId,
                i, // accident id
                { from: workshop }
            );

            // console.log(Object.entries(retrieveAccidentRecord1));

            if (i == 1) {
                _accidentDateLocation1 = retrieveAccidentRecord1.accidentDateLocation;
            } else {
                _accidentDateLocation2 = retrieveAccidentRecord1.accidentDateLocation;
            }

            let retrieveAccidentRecord2 = await vehicleRegistryInstance.retrieveAccidentRecord2.call(
                vehicleId,
                i, // accident id
                { from: workshop }
            );

            // console.log(Object.entries(retrieveAccidentRecord2));

            if (i == 1) {
                _servicingId1 = retrieveAccidentRecord2.servicingId;
            } else {
                _servicingId2 = retrieveAccidentRecord2.servicingId;
            }

        }

        assert.strictEqual(web3.utils.hexToUtf8(_accidentDateLocation1), web3.utils.hexToUtf8(accidentDateLocation), "First accident date and location does not match");
        assert.strictEqual(web3.utils.hexToUtf8(_accidentDateLocation2), web3.utils.hexToUtf8(accidentDateLocation2), "Second accident date and location does not match");
        // Accident id = 1 <-- Linked to --> Servicing id = 3
        assert.strictEqual(_servicingId1.toNumber(), servicingId3, "First accident's servicing id does not match");
        // No servicing done to the vehicle after accident record yet
        assert.strictEqual(_servicingId2.toNumber(), 0, "Second accident's servicing id does not match");

    });

    // Test 36: Transfer first vehicle to new owner (can either be registered owner or unregistered owner)
    it('Test 36: Transfer first vehicle to new owner', async () => {

        // Check if new owner is registered first
        let isNewOwnerRegistered = await vehicleRegistryInstance.isAddressRegisteredOwner.call(
            newOwner,
            { from: owner }
        );

        // Change to "if (isNewOwnerRegistered == true)" to test if the buyer is registered case
        if (isNewOwnerRegistered == false) {

            let transferVehicleToNewOwner = await vehicleRegistryInstance.transferVehicle(
                vehicleId,
                newOwner,
                newOwnerName,
                newOwnerContact,
                newOwnerPhysicalAddress,
                newOwnerDateOfReg,
                { from: owner }
            );

            truffleAssert.eventEmitted(transferVehicleToNewOwner, 'vehicleTransferCompleted', ev => {
                return ev.vehicleId.toNumber() === vehicleId
                    && ev.currentOwnerAddress === owner
                    && ev.newOwnerAddress === newOwner;
            }, 'Vehicle id or current or new owner address does not match');

        } else {

            // Register new owner (To simulate the new owner already registered)
            let registerNewOwner = await vehicleRegistryInstance.registerOwnerDealer(
                newOwner,
                newOwnerName,
                newOwnerContact,
                web3.utils.utf8ToHex(""), // Company Reg No. = Empty
                newOwnerPhysicalAddress,
                newOwnerDateOfReg,
                false // isDealer = false
            );

            assert.ok(registerNewOwner);

            truffleAssert.eventEmitted(registerNewOwner, 'ownerDealerRegistered', ev => {
                return ev.ownerDealerAddress === newOwner;
            }, 'Owner address does not match with the registered address');

            // Transfer (Registered owner: other fields are retrieved on the backend)

            let transferVehicleToNewOwner = await vehicleRegistryInstance.transferVehicle(
                vehicleId,
                newOwner, // Only need the address if buyer already registered
                web3.utils.utf8ToHex(""), // name
                0, // contact
                web3.utils.utf8ToHex(""), // physical address
                web3.utils.utf8ToHex(""), // date of registration
                { from: owner }
            );

            truffleAssert.eventEmitted(transferVehicleToNewOwner, 'vehicleTransferCompleted', ev => {
                return ev.vehicleId.toNumber() === vehicleId
                    && ev.currentOwnerAddress === owner
                    && ev.newOwnerAddress === newOwner;
            }, 'Vehicle id or current or new owner address does not match');

        }

    });

    // Test 37: Retrieve total number of transfers for first vehicle by new owner
    it('Test 37: Retrieve total number of transfer for first vehicle by new owner', async () => {

        let noOfTransfersOnVehicle = await vehicleRegistryInstance.retrieveNoOfTransfers(
            vehicleId,
            { from: newOwner }
        );

        // console.log(Object.entries(noOfTransfersOnVehicle.logs[0].args));
        noOfTransfersOnVeh1 = noOfTransfersOnVehicle.logs[0].args.noOfTransfers.toNumber();

        truffleAssert.eventEmitted(noOfTransfersOnVehicle, 'noOfTransferRetrieved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
                && ev.noOfTransfers.toNumber() === 1;
        }, 'Vehicle id or number of transfers on vehicle does not match');

    });

    // Test 38: Retrieve ownership history for first vehicle by administrator
    it('Test 38: Retrieve ownership history for first vehicle by administrator', async () => {

        let _ownerName1;
        let _ownerName2;

        // Loop and retrieve ownership records (No of transfers = 1)
        // First ownerid = 0 (Starts from 0)
        for (let i = 0; i <= noOfTransfersOnVeh1; i++) {

            let retrieveOwnershipDetails = await vehicleRegistryInstance.retrieveOwnershipHistory.call(
                vehicleId,
                i, // owner id
                { from: newAdmin }
            );

            // console.log(Object.entries(retrieveOwnershipDetails));

            if (i == 0) {
                _ownerName1 = retrieveOwnershipDetails.ownerName;
            } else {
                _ownerName2 = retrieveOwnershipDetails.ownerName;
            }

        }

        // console.log(web3.utils.hexToUtf8(_ownerName1));
        // console.log(web3.utils.hexToUtf8(_ownerName2));

        assert.strictEqual(web3.utils.hexToUtf8(_ownerName1), web3.utils.hexToUtf8(ownerName), "First owner name does not match");
        assert.strictEqual(web3.utils.hexToUtf8(_ownerName2), web3.utils.hexToUtf8(newOwnerName), "Second owner name does not match");

    });

});