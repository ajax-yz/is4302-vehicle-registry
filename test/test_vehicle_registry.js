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
    const vehicleRegistryOwnerDateJoined = web3.utils.utf8ToHex("1 February 2021");
    const vehicleRegistryOwnerContact = 90004302;

    // Admin
    const newAdmin = accounts[1];
    const newAdminName = web3.utils.utf8ToHex("Rachel Tan");
    const newAdminDateJoined = web3.utils.utf8ToHex("2 February 2021");
    const newAdminContact = 91114302;

    // Owner
    const owner = accounts[2];
    const ownerName = web3.utils.utf8ToHex("Takumi Fujiwara");
    const ownerContact = 92224302;
    const ownerCompanyRegNo = web3.utils.utf8ToHex(""); // Company Reg No. = Empty (Not a dealer)
    const ownerPhysicalAddress = web3.utils.utf8ToHex("95A Henderson Rd, S151095");
    const ownerDateOfReg = web3.utils.utf8ToHex("1 March 2021");

    // Workshop
    const workshop = accounts[3];
    const workshopName = web3.utils.utf8ToHex("Precise Auto Service");
    const workshopRegNo = web3.utils.utf8ToHex("35766600C");
    const workshopPhysicalAddress = web3.utils.utf8ToHex("1 Kaki Bukit Ave 6, S417883");
    const workshopContact = 67457367;
    const workshopDateOfReg = web3.utils.utf8ToHex("3 April 1986");

    // Insurance Company
    const insuranceCo = accounts[4];
    const insuranceCoName = web3.utils.utf8ToHex("NTUC Income Insurance");
    const insuranceCoRegNo = web3.utils.utf8ToHex("S97CS0162D");
    const insuranceCoPhysicalAddress = web3.utils.utf8ToHex("75 Bras Basah Rd, S189557");
    const insuranceCoContact = 67881777;
    const insuranceCoDateOfReg = web3.utils.utf8ToHex("1 January 1990");

    // Vehicle variables

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

        assert.equal(adminName, "Genesis Admin", "Admin name does not tally");
        assert.equal(dateJoined, "1 January 2021", "Date joined does not tally");
        assert.equal(contact, 90000000, "Contact number does not tally");

        let updateAdmin = await vehicleRegistryInstance.updateAdminInfo(
            vehicleRegistryOwner,
            vehicleRegistryOwnerName,
            vehicleRegistryOwnerDateJoined,
            vehicleRegistryOwnerContact
        );

        truffleAssert.eventEmitted(updateAdmin, 'adminInfoUpdated', ev => {
            return ev.adminAddress === vehicleRegistryOwner;
        }, 'Admin address does not tally with the address to update');

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
        }, 'Admin address does not tally with the registered address');

    });

    // Test 4: Admin removal
    it('Test 4: Remove an admin', async () => {

        let adminToDelete = await vehicleRegistryInstance.registerAdmin(
            accounts[5],
            web3.utils.utf8ToHex("Account To Test Deletion"),
            web3.utils.utf8ToHex("1 March 2021"),
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
            web3.utils.utf8ToHex("1 January 2000"),
            false
        );

        assert.ok(registerNewOwner);

        truffleAssert.eventEmitted(registerNewOwner, 'ownerDealerRegistered', ev => {
            return ev.ownerDealerAddress === owner;
        }, 'Owner address does not tally with the registered address');

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

        assert.equal(_ownerName, "Name to be updated", "Owner name does not tally");
        assert.equal(_contact, 80000000, "Contact number does not tally");
        assert.equal(_physicalAddress, "Address to be updated", "Physical address does not tally");
        assert.equal(_dateOfReg, "1 January 2000", "Date of registration does not tally");
        assert.equal(_isDealer, false, "Dealer boolean does not tally");

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
        }, 'Owner address does not tally with the address to update');

    });

    // Test 7: Dealer removal
    it('Test 7: Remove a dealer', async () => {

        let dealerToDelete = await vehicleRegistryInstance.registerOwnerDealer(
            accounts[5],
            web3.utils.utf8ToHex("Name to be deleted"),
            11111111,
            web3.utils.utf8ToHex("Reg no"),
            web3.utils.utf8ToHex("Address"),
            web3.utils.utf8ToHex("1 January 2000"),
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
            web3.utils.utf8ToHex("1 March 2021"),
            {
                from: vehicleRegistryOwner
            }
        );

        assert.ok(registerNewWorkshop);

        truffleAssert.eventEmitted(registerNewWorkshop, 'workshopRegistered', ev => {
            return ev.workshopAddress === workshop;
        }, 'Workshop address does not tally with the registered address');

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

        assert.equal(_workshopName, "Workshop name to be updated", "Workshop name does not tally");
        assert.equal(_workshopRegNo, "", "Workshop registration number does not tally");
        assert.equal(_physicalAddress, "Address to be updated", "Physical address does not tally");
        assert.equal(_contact, 70000000, "Contact number does not tally");
        assert.equal(_dateOfReg, "1 March 2021", "Date of registration does not tally");

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
        }, 'Workshop address does not tally with the address to update');

    });

    // Test 10: Workshop removal
    it('Test 10: Remove a workshop', async () => {

        let workshopToDelete = await vehicleRegistryInstance.registerWorkshop(
            accounts[5],
            web3.utils.utf8ToHex("Workshop name to be deleted"),
            web3.utils.utf8ToHex(""), // Workshop Reg No. = Empty
            web3.utils.utf8ToHex("Address to be deleted"),
            70000000,
            web3.utils.utf8ToHex("1 January 2000"),
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
            web3.utils.utf8ToHex("1 January 2000"),
            {
                from: vehicleRegistryOwner
            }
        );

        assert.ok(registerNewInsuranceCo);

        truffleAssert.eventEmitted(registerNewInsuranceCo, 'insuranceCoRegistered', ev => {
            return ev.insuranceCoAddress === insuranceCo;
        }, 'Insurance company address does not tally with the registered address');

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

        assert.equal(_insuranceCoName, "Insurance company to be updated", "Workshop name does not tally");
        assert.equal(_insuranceCoRegNo, "", "Workshop registration number does not tally");
        assert.equal(_physicalAddress, "Address to be updated", "Physical address does not tally");
        assert.equal(_contact, 20000000, "Contact number does not tally");
        assert.equal(_dateOfReg, "1 January 2000", "Date of registration does not tally");

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
        }, 'Insurance company address does not tally with the address to update');

    });

    // Test 13: Insurance company removal
    it('Test 13: Remove a insurance company', async () => {

        let insuranceCoToDelete = await vehicleRegistryInstance.registerInsuranceCo(
            accounts[5],
            web3.utils.utf8ToHex("Insurance company to be deleted"),
            web3.utils.utf8ToHex(""), // Insurance Reg No. = Empty
            web3.utils.utf8ToHex("Address to be deleted"),
            00000000,
            web3.utils.utf8ToHex("1 January 2000"),
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


});