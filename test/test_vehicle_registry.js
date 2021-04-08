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
    const vehicleRegistryOwnerDateJoined = web3.utils.utf8ToHex("1 Feb 2021");
    const vehicleRegistryOwnerContact = 90004302;

    // Admin
    const newAdmin = accounts[1];
    const newAdminName = web3.utils.utf8ToHex("Rachel Tan");
    const newAdminDateJoined = web3.utils.utf8ToHex("2 Feb 2021");
    const newAdminContact = 91114302;

    // Owner
    const owner = accounts[2];
    const ownerName = web3.utils.utf8ToHex("Takumi Fujiwara");
    const ownerContact = 92224302;
    const ownerCompanyRegNo = web3.utils.utf8ToHex(""); // Company Reg No. = Empty (Not a dealer)
    const ownerPhysicalAddress = web3.utils.utf8ToHex("95A Henderson Rd, S151095");
    const ownerDateOfReg = web3.utils.utf8ToHex("1 Mar 2021");

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

    // Vehicle variables
    let vehicleId;
    const vehicleNo = web3.utils.utf8ToHex("SOC4302S");
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

    // Servicing variables

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
        assert.equal(dateJoined, "1 Jan 2021", "Date joined does not match");
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
            web3.utils.utf8ToHex("1 Mar 2021"),
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
            web3.utils.utf8ToHex("1 Mar 2021"),
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
        assert.equal(_dateOfReg, "1 Mar 2021", "Date of registration does not match");

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

        assert.ok(registerVehicleToOwner1);

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

        assert.ok(registerVehicleToOwner2);

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

        // // Testing: Index & length
        // let retrieveIndexLength = await vehicleRegistryInstance.returnIndexLength.call(
        //     owner,
        //     vehicleId,
        //     authorizedParty,
        //     { from: newAdmin }
        // );
        // // console.log(`Array fields are: ${Object.entries(retrieveIndexLength)}`);
        // console.log(`Authorized party index is: ${retrieveIndexLength[0]}`);
        // console.log(`Authorized party length is: ${retrieveIndexLength[1]}`);

        // // Testing: Create another authorized party to test
        // const authorizedParty2 = accounts[7];
        // let authorizeAccess2 = await vehicleRegistryInstance.authorizeAccess(
        //     vehicleId,
        //     owner,
        //     authorizedParty2,
        //     { from: owner }
        // );
        // assert.ok(authorizeAccess2);


        // // Testing: Index & length
        // let retrieveIndexLength2 = await vehicleRegistryInstance.returnIndexLength.call(
        //     owner,
        //     vehicleId,
        //     authorizedParty2,
        //     { from: newAdmin }
        // );
        // console.log(`After 2nd authorization: Authorized party index is: ${retrieveIndexLength2[0]}`);
        // console.log(`After 2nd authorization: Authorized party length is: ${retrieveIndexLength2[1]}`);


        // // Testing: Index & length
        // let retrieveArray = await vehicleRegistryInstance.returnArray.call(
        //     owner,
        //     vehicleId,
        //     { from: newAdmin }
        // );

        // console.log(`After 2nd authorization: Array fields are: ${Object.entries(retrieveArray)}`);

        // ************ CONTINUE HERE ************** //
        let authorizationRemoval = await vehicleRegistryInstance.removeAuthorization(
            vehicleId,
            owner,
            authorizedParty,
            { from: owner }
        );

        assert.ok(authorizationRemoval, "authorization removal failed"); // Failed


        // // // Testing: Index & length
        // let retrieveIndexLength3 = await vehicleRegistryInstance.returnIndexLength.call(
        //     owner,
        //     vehicleId,
        //     authorizedParty,
        //     { from: newAdmin }
        // );
        // // // console.log(`Array fields are: ${Object.entries(retrieveIndexLength)}`);
        // console.log(`After deletion: Authorized party index is: ${retrieveIndexLength3[0]}`);
        // console.log(`After deletion: Authorized party length is: ${retrieveIndexLength3[1]}`);

        // // // Testing: Index & length
        // let retrieveArray2 = await vehicleRegistryInstance.returnArray.call(
        //     owner,
        //     vehicleId,
        //     { from: newAdmin }
        // );

        // console.log(`After deletion: Array fields are: ${Object.entries(retrieveArray2)}`);

        // ************ CONTINUE LATER ************** //

        // Notice the .call()
        let retrieveAuthorizedAddresses = await vehicleRegistryInstance.retrieveAuthorizedAddresses.call(
            vehicleId,
            owner,
            { from: owner }
        );

        // console.log(`Retrieve authorized addresses entries: ${Object.entries(retrieveAuthorizedAddresses)}`);

        const _noOfAuthorizedParties = retrieveAuthorizedAddresses[0].toNumber();
        const _authorizedAddress = retrieveAuthorizedAddresses[1][0]; // Second parameter, first in the array

        assert.strictEqual(_noOfAuthorizedParties, 0, "Number of authorized addresses does not match");
        assert.strictEqual(_authorizedAddress, undefined, "Authorized address does not match");

        truffleAssert.eventEmitted(authorizationRemoval, 'authorizationRemoved', ev => {
            return ev.vehicleId.toNumber() === vehicleId
            && ev.authorizer === owner
            && ev.authorizedAddress === authorizedParty;
        }, 'Vehicle ID or authorizer or authorized address does not match');

    });

    // Test 20: Update vehicle COE registration
    it('Test 20: Update vehicle COE registration', async () => {

        let 

    });

    // Test 21: Update vehicle license plate
    it('Test 21: Update vehicle license plate', async () => {

    });

    // Test 22: Swap vehicle license plate 
    it('Test 22: Swap vehicle license plate', async () => {

    });

    // Test 23: Deregister vehicle
    it('Test 23: Deregister vehicle', async () => {

    });

    // Test 24: Retrieve number of transfers for vehicle
    it('Test 24: Retrieve number of transfer for vehicle', async () => {

    });

    // Test 25: Retrieve ownership history for vehicle 
    it('Test 25: Retrieve ownership history for vehicle', async () => {

    });

    // Test 26: 
    it('Test 26: Approve consignment to other party', async () => {

    });

    // Test 27: 
    it('Test 27: Retrieve consignment party information', async () => {

    });

    // Test 28: 
    it('Test 28: Remove consignment rights', async () => {

    });

    // Test 29: 
    it('Test 29: Initiate transfer of vehicle by owner', async () => {

    });

    // Test 30: 
    it('Test 30: Accept transfer of vehicle by buyer', async () => {

    });

    // Test 31: 
    it('Test 31: Add servicing record to vehicle', async () => {

    });

    // Test 32: 
    it('Test 32: Retrieve all servicing records on vehicle', async () => {

    });

    // Test 33: 
    it('Test 33: Retrieve all unacknowledged servicing records on vehicle', async () => {

    });

    // Test 34: functions = (retrieveServicingHistory1 + retrieveServicingHistory2)
    it('Test 34: Retrieve service record on vehicle', async () => {

    });

    // Test 35: 
    it('Test 35: Acknowledge servicing record', async () => {

    });

    // Test 36: 
    it('Test 36: Retrieve all vehicles serviced by workshop', async () => {

    });

    // Test 37: 
    it('Test 37: Retrieve vehicle servicing records by workshop', async () => {

    });

    // Test 38: 
    it('Test 38: Retrieve number of servicing records on vehicle', async () => {

    });

    // Test 39: functions = (retrieveServicingHistory1 + retrieveServicingHistory2)
    it('Test 39: Retrieve servicing history', async () => {

    });

    // Test 40: 
    it('Test 40: Add accident record to vehicle', async () => {

    });

    // Test 41: 
    it('Test 41: Retrieve all accident records on vehicle', async () => {

    });

    // Test 42: function = (retrieveAccidentHistory1 + retrieveAccidentHistory2)
    it('Test 42: Retrieve accident record on vehicle', async () => {

    });

    // Test 43: 
    it('Test 43: Update accident claim status on vehicle', async () => {

    });

    // Test 44: 
    it('Test 44: Retrieve number of accident records on vehicle', async () => {

    });

    // Test 45: function = (retrieveAccidentHistory1 + retrieveAccidentHistory2)
    it('Test 45: Retrieve accident history', async () => {

    });

    // Test 46: 
    it('Test 46: Retrieve all vehicles insured by insurance company', async () => {

    });

    // Test 47: 
    it('Test 47: Retrieve accident records on vehicle by insurance company', async () => {

    });

    // Test : 
    it('Test : ', async () => {

    });

});