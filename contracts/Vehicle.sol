pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract Vehicle is ERC721Full {

    // Using OpenZeppelin Counter
    using Counters for Counters.Counter;
    Counters.Counter private _vehicleIds;

    constructor() public ERC721Full("Vehicle", "VEH") {}

    address _owner = msg.sender;

    enum typeOfServicing {modification, maintenance, repair}

    // ---------------------------- Structs ---------------------------- //

    // vehicle registration details (split into 2 to avoid stack too deep error)
    struct VehRegDetails1 {
        bytes32 vehicleNo; // SOC4302S
        bytes32 makeModel; // Toyota Corolla Altis 1.6A
        uint256 manufacturingYear; // 2020
        bytes32 engineNo; // 1NZX395892
        bytes32 chassisNo; // JN1FBAK12Z0000677
        uint256 omv; // $19,615
        bytes32 originalRegDate; // 20 Oct 2020
        bytes32 effectiveRegDate; // 20 Oct 2020
        bool registered; // To check if vehicle reg details 1 is completed
    }

    struct VehRegDetails2 {
        uint256 noOfTransfers; // 0
        // bytes32 primaryColour; // White (Removed to prevent stack too deep)
        bytes32 engineCap; // 1,598 cc
        // bytes32 maxPowerOutput; // 129 bhp (Removed to prevent stack too deep error)
        bytes32 coeCat; // A - Car up to 1600cc & 97kW (130bhp)
        uint256 quotaPrem; // $33,520
        bytes32 owner; // Jonathan Tan
        address ownerAddress; // E.g. 0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC
        bool registered; // To check if vehicle reg details exist
    }

    struct VehOwnerDetails {
        uint256 ownerId; // 0 - Identifier: (0 means details belong to first owner) [Correspond to no of transfer]
        bytes32 ownerName; // Jonathan Tan
        uint256 ownerContact; // 90004302
        bytes32 ownerPhysicalAddress; // 22 Cove Way
        address ownerAddress; // E.g. 0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC
        bool exists;
    }

    struct VehServicingDetails {
        uint256 servicingId; // 1 means it is the first servicing record
        bytes32 dateCompleted; // 11 December 2020
        bytes32 workshopRegNo; // 35766600C
        // uint256 invoiceNo; // 5445445 (Removed to avoid stack too deep)
        typeOfServicing typeOfWorkDone; // Modification/Maintenance/Repair
        bytes32 appointedMechanic; // Dominic Toretto
        // uint256 contactNo; // 93334302 (Removed to avoid stack too deep)
        bytes32 currentMileage; // 20,000 km
        bytes32 workDone; // Engine oil, oil filter, brake fluid, washer fluid, wheel alignment and balancing. Regular maintenance, recommended to change tyres for the next servicing
        bytes32 totalCharges; // $189.43 (Solidity uint does not accept decimals)
        bool acknowledgedByOwner; // To check whether owner acknowledged the servicing
        // bytes32 remarks; // Combined with work done: Regular maintenance, recommended to change tyres for the next servicing
    }

    struct VehAccidentDetails {
        uint256 accidentId; // 1 means it is the first accident record
        bytes32 accidentDateLocation; // 11 January 2021, South Buona Vista Road
        bytes32 driverName; // Jonathan Tan
        bytes32 timeOfAccident; // 11:59 PM
        // bytes32 location; // Combined with date (Stack too deep)
        bytes32 descriptionOfAccident; // Driver lost control of the vehicle and crashed against the tree. Front bumper, headlights, hood, radiator badly damaged
        bytes32 insuranceCoName; // NTUC Income
        // bytes32 descriptionOfDamages; // Combined wwith description of accident: Front bumper, headlights, hood, radiator badly damaged
        bytes32 appointedWorkshopNo; // 35766600C
        uint256 servicingId; // 2 [Invoice No (removed) changed to servicing id]
        bytes32 remarks; // Accident reported to the police, and filed insurance claim
        bool claimIssued; // Check whether claim has been issued
    }
    
    // ---------------------------- Mappings ---------------------------- //

    // vehicleNoId[vehicle no] = vehicle id (Unique)
    // E.g. vehicleNoId[SOC4302S] = 1
    mapping(bytes32 => uint256) vehicleNoId;

    // vehRegRecords1[vehicle id] = vehicle reg details 
    mapping(uint256 => VehRegDetails1) vehRegRecords1;
    mapping(uint256 => VehRegDetails2) vehRegRecords2;

    // vehOwnerRecords[vehicle id][no. of transfers] = owner details
    // To get the full history of ownership, loop from the 1st owner to the last then retrieve all records
    mapping(uint256 => mapping(uint256 => VehOwnerDetails)) vehOwnerRecords;

    // noOfServicingRecords[vehicle id] = 6 (6 servicing records exists for this vehicle id)
    mapping(uint256 => uint256) noOfServicingRecords;

    // vehServicingIds[Vehicle ID] = uint256[] array of servicing ids;
    mapping(uint256 => uint256[]) vehServicingIds;

    // vehServicingRecords[vehicle id][position of record] = servicing details
    mapping(uint256 => mapping(uint256 => VehServicingDetails)) vehServicingRecords;

    // noOfAccidentRecords[vehicle id] = 5 (5 accident records exists for this license plate)
    mapping(uint256 => uint256) noOfAccidentRecords;
    
    // vehAccidentIds[Vehicle ID] = uint256[] array of accident ids;
    mapping(uint256 => uint256[]) vehAccidentIds;

    // vehAccidentRecords[vehicle id][position of record] = accident details
    mapping(uint256 => mapping(uint256 => VehAccidentDetails)) vehAccidentRecords;

    // ---------------------------- Events ---------------------------- //

    event vehRegDetails1Added(uint256 vehicleId);
    event vehRegDetails1Returned(uint256 vehicleId);
    event vehRegDetails1Part2Returned(uint256 vehicleId);
    event vehRegDetails1Updated(uint256 vehicleId, bytes32 newEffectiveDate);

    event vehRegDetails2Added(uint256 vehicleId);
    event vehRegDetails2Returned(uint256 vehicleId);
    event vehRegDetails2Updated(uint256 vehicleId, uint256 quotaPrem);

    event licensePlateChanged(uint256 vehicleId, bytes32 newLicensePlate);
    event licensePlateSwapped(bytes32 myNewLicensePlate, bytes32 myOldLicensePlate);
    event vehicleDeregistered(uint256 vehicleId);

    event vehOwnerDetailsRecorded(uint256 vehicleId, uint256 ownerId);
    event vehOwnershipHistoryRetrieved(uint256 vehicleId, bytes32 owner, uint256 contact, bytes32 ownerPhysicalAddress, address ownerAddress);
    event vehOwnerDetailsUpdated(uint256 vehicleId, uint256 ownerId);

    event vehServicingDetailsRecorded(uint256 vehicleId, uint256 servicingId);
    event vehServicingRecordsRetrieved(uint256 vehicleId);
    event vehServicingDetailsAcknowledged(uint256 vehicleId, uint256 servicingId);
    event vehServicingHistoryRetrieved(uint256 vehicleId, uint256 servicingId);
    event vehServicingHistory2Retrieved(uint256 vehicleId, uint256 servicingId);

    event vehAccidentDetailsRecorded(uint256 vehicleId, uint256 accidentId);
    event vehAccidentRecordsRetrieved(uint256 vehicleId);
    event vehInsuranceClaimIssued(uint256 vehicleId, uint256 accidentId);
    event vehAccidentHistoryRetrieved(uint256 vehicleId, uint256 accidentId);
    event vehAccidentHistory2Retrieved(uint256 vehicleId, uint256 accidentId);

    event vehTransferInfoUpdated(uint256 vehicleId, address currentOwnerAddress, address newOwnerAddress);

    
    // ---------------------------- Modifiers ---------------------------- //

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only the owner can carry out this function");
        _;
    }

    modifier vehicleRegDetails1Exists(uint256 vehicleId) {
        require (vehRegRecords1[vehicleId].registered, 'Vehicle ID Invalid: No Vehicle Registered to this ID');
        _;
    }

    modifier vehicleRegDetails2Exists(uint256 vehicleId) {
        require (vehRegRecords2[vehicleId].registered, 'Vehicle ID Invalid: No Vehicle Registered to this ID');
        _;
    }

    modifier ownershipDetailsExists(uint256 vehicleId, uint256 ownerId) {
        require (vehOwnerRecords[vehicleId][ownerId].exists, 'Owner ID Invalid: Please enter a valid owner id');
        _;
    }

    modifier vehicleServicingIdExists(uint256 vehicleId, uint256 servicingId) {
        require(servicingId < noOfServicingRecords[vehicleId], 'Invalid Servicing ID: Servicing ID does not exists');
        _;
    }

    modifier vehicleAccidentIdExists(uint256 vehicleId, uint256 accidentId) {
        require(accidentId < noOfAccidentRecords[vehicleId], 'Invalid Accident ID: Accident ID does not exists');
        _;
    }

    // ---------------------------- Functions ---------------------------- //

    /**
     * Function 1: 1st part of reg veh details function
     * Comments:
     */
    function addRegisteredVeh1(
        bytes32 vehicleNo,
        bytes32 makeModel,
        uint256 manufacturingYear,
        bytes32 engineNo,
        bytes32 chassisNo,
        uint256 omv,
        bytes32 originalRegDate,
        bytes32 effectiveRegDate
    ) external returns (uint256) {

        VehRegDetails1 memory newVehRegDetails1 =
            VehRegDetails1(
                vehicleNo,
                makeModel,
                manufacturingYear,
                engineNo,
                chassisNo,
                omv,
                originalRegDate,
                effectiveRegDate,
                true
            );

        _vehicleIds.increment();
        uint256 newVehId = _vehicleIds.current();
        vehRegRecords1[newVehId] = newVehRegDetails1;

        emit vehRegDetails1Added(newVehId);

        return newVehId;
    }

    /**
     * Function 2: 2nd part of add reg veh details
     * Comments:
     */

    function addRegisteredVeh2(
        uint256 noOfTransfers,
        bytes32 engineCap,
        bytes32 coeCat,
        uint256 quotaPrem,
        bytes32 owner,
        address ownerAddress
    ) external returns (uint256) {

        require(vehRegRecords1[_vehicleIds.current()].registered, 
            'Vehicle Registration Details Part 1 Not Completed Yet');

        VehRegDetails2 memory newVehRegDetails2 =
            VehRegDetails2(
                noOfTransfers, // As there might be vehicles already having more than 0 transfers
                engineCap,
                coeCat,
                quotaPrem,
                owner,
                ownerAddress,
                true
            );

        uint256 currentVehId = _vehicleIds.current();

        vehRegRecords2[currentVehId] = newVehRegDetails2;

        emit vehRegDetails2Added(currentVehId);

        // Assign ERC721 token
        _mint(ownerAddress, currentVehId);

        return currentVehId;
    }

    /**
     * Function 3: Retrieve registered vehicle details 1
     * Comments:
     */
    function retrieveVehInfo1(uint256 vehicleId)
        external vehicleRegDetails1Exists(vehicleId) returns (
            bytes32,
            bytes32,
            uint256,
            bytes32,
            bytes32
        )
    {

        // Emit event for testing purpose
        emit vehRegDetails1Returned(vehicleId);

        return (
            vehRegRecords1[vehicleId].vehicleNo,
            vehRegRecords1[vehicleId].makeModel,
            vehRegRecords1[vehicleId].manufacturingYear,
            vehRegRecords1[vehicleId].engineNo,
            vehRegRecords1[vehicleId].chassisNo
        );
    }

    /**
     * Function 4: Retrieve registered vehicle details 1 part 2
     * Comments: To avoid stack too deep issue
     */
    function retrieveVehInfo1Part2(uint256 vehicleId)
        external vehicleRegDetails1Exists(vehicleId) returns (
            uint256,
            bytes32,
            bytes32
        )
    {

        // Emit event for testing purpose
        emit vehRegDetails1Part2Returned(vehicleId);

        return (
            vehRegRecords1[vehicleId].omv,
            vehRegRecords1[vehicleId].originalRegDate,
            vehRegRecords1[vehicleId].effectiveRegDate
        );
    }

    /**
     * Function 5: Retrieve registered vehicle details 2
     * Comments:
     */
    function retrieveVehInfo2(uint256 vehicleId)
        external vehicleRegDetails2Exists(vehicleId) returns (
            uint256,
            bytes32,
            bytes32,
            uint256,
            bytes32
        )
    {
        // Emit event for testing purpose
        emit vehRegDetails2Returned(vehicleId);

        return (
            vehRegRecords2[vehicleId].noOfTransfers,
            vehRegRecords2[vehicleId].engineCap,
            vehRegRecords2[vehicleId].coeCat,
            vehRegRecords2[vehicleId].quotaPrem,
            vehRegRecords2[vehicleId].owner
        );
    }

    /**
     * Function 6: Update 1st part of reg veh details
     * Comments: Updates can only be made to 'effective reg date' & 'vehicle no'.
     * Comments2: Update of vehicle no when owner purchase new license plate no
     */
    function updateVehInfo1 (
        uint256 vehicleId,
        bytes32 _effectiveRegDate) 
        external vehicleRegDetails1Exists(vehicleId) returns (bool) {

        // Update fields
        vehRegRecords1[vehicleId].effectiveRegDate = _effectiveRegDate;

        // emit event
        emit vehRegDetails1Updated(vehicleId, 
            vehRegRecords1[vehicleId].effectiveRegDate);

        return true;
    }

    /**
     * Function 7: Change vehicle license plate no
     * Comments: When owner change his vehicle license plate after sucessfully bidding a vehicle license plate
     */
    function updateVehNo (
        uint256 vehicleId, 
        bytes32 _vehicleNo) 
        external vehicleRegDetails1Exists(vehicleId) returns (bool) {
        
        // Update mapping of vehicle license plate => vehicle ID
        vehicleNoId[_vehicleNo] = vehicleId;

        // Update fields
        vehRegRecords1[vehicleId].vehicleNo = _vehicleNo;

        // emit event
        emit licensePlateChanged(vehicleId, 
            vehRegRecords1[vehicleId].vehicleNo);

        return true;
    }

    /**
     * Function 8: Swap vehicle license plate no
     * Comments: When owner swap his vehicle license plate with another vehicle license plate
     * Comments2: Ownership mapping does not change
     */
    function swapLicensePlateNo (
        uint256 myVehicleId, 
        uint256 otherVehicleId) 
        external returns (bool) {
        
        // Check that both vehicle ids exist
        require (vehRegRecords1[myVehicleId].registered
            && vehRegRecords1[otherVehicleId].registered
            , 'Vehicle ID Invalid: No Vehicles Registered to the IDs provided');

        // Retrieve my license plate
        bytes32 myLicensePlate = vehRegRecords1[myVehicleId].vehicleNo;

        // Retrieve the other license plate
        bytes32 otherLicensePlate = vehRegRecords1[otherVehicleId].vehicleNo;

        // Update mapping of my new vehicle license plate => vehicle ID
        vehicleNoId[otherLicensePlate] = myVehicleId;

        // Update my license plate to the other party's license plate
        vehRegRecords1[myVehicleId].vehicleNo = otherLicensePlate;

        // Update mapping of other new vehicle license plate => vehicle ID
        vehicleNoId[myLicensePlate] = otherVehicleId;

        // Update other party's license plate to my license plate
        vehRegRecords1[otherVehicleId].vehicleNo = myLicensePlate;

        // Emit event
        emit licensePlateSwapped(vehRegRecords1[myVehicleId].vehicleNo, 
            myLicensePlate);
        
        return true;

    }

    /**
     * Function 9: Update 2nd part of reg veh details
     * Comments: Updates can only be made to 'Quota Premium'. Other fields updated seperately below
     */
    function updateVehInfo2 (uint256 vehicleId, uint256 _quotaPrem) 
        external vehicleRegDetails2Exists(vehicleId) returns (bool) {
        
        // Update fields
        vehRegRecords2[vehicleId].quotaPrem = _quotaPrem;

        // emit event
        emit vehRegDetails2Updated(vehicleId, 
            vehRegRecords2[vehicleId].quotaPrem);

        return true;
    }

    /**
     * Function 10: Update owner details after transfer of vehicle
     * Commments: Updates made to 'No of Transfers', 'Owner Name', 'Owner address', & 'Owner Details Mapping'
     */
    function transferVehicleUpdate (
        uint256 vehicleId, 
        bytes32 newOwner,
        uint256 newOwnerContact, 
        bytes32 newOwnerPhysicalAddress,
        address newOwnerAddress) 
        external vehicleRegDetails2Exists(vehicleId) returns (bool) {
        
        address currentOwnerAddress = vehRegRecords2[vehicleId].ownerAddress;

        // Update fields
        vehRegRecords2[vehicleId].owner = newOwner;
        vehRegRecords2[vehicleId].ownerAddress = newOwnerAddress;
        vehRegRecords2[vehicleId].noOfTransfers++;

        // Set no. of transfers as owner id (No. of transfers = 0 = first owner)
        uint256 newOwnerId = vehRegRecords2[vehicleId].noOfTransfers;

        // Update the mapping using the function below
        registerNewOwnerDetails(vehicleId, newOwnerId, newOwner, newOwnerContact, newOwnerPhysicalAddress, newOwnerAddress);

        // emit event
        emit vehTransferInfoUpdated(vehicleId, currentOwnerAddress, newOwnerAddress);

        return true;
    }

    /**
     * Function 11: De-register vehicle
     * Commments: Delete token and update registered boolean after vehicle is scrapped or exported. (Not deleted)
     */
     function deregisterVeh(uint256 vehicleId) 
        external vehicleRegDetails1Exists(vehicleId) vehicleRegDetails2Exists(vehicleId)
        returns (bool) {

            // Update 'registered' boolean
            vehRegRecords1[vehicleId].registered = false;
            vehRegRecords2[vehicleId].registered = false;

            // Update mapping of license plate no => vehicle id
            bytes32 _vehicleNo = vehRegRecords1[vehicleId].vehicleNo;
            delete vehicleNoId[_vehicleNo];

            // Burn token
            _burn(vehicleId);

            // emit event
            emit vehicleDeregistered(vehicleId);

            return true;
     }

    /**
     * Function 12: Register new owner of vehicle
     * Commments: For adding new owner during ownership transfer (Input no. of transfer as owner ID)
     */
    function registerNewOwnerDetails(
        uint256 vehicleId,
        uint256 ownerId, // Corresponds to no. of transfer (0 = first owner)
        bytes32 ownerName,
        uint256 ownerContact,
        bytes32 ownerPhysicalAddress,
        address ownerAddress
    ) public vehicleRegDetails2Exists(vehicleId) returns (bool) {

        VehOwnerDetails memory newOwnerDetails =
            VehOwnerDetails(
                ownerId,
                ownerName,
                ownerContact,
                ownerPhysicalAddress,
                ownerAddress,
                true
            );

        vehOwnerRecords[vehicleId][ownerId] = newOwnerDetails;

        emit vehOwnerDetailsRecorded(vehicleId, ownerId);

        return true;
    }

    /**
     * Function 13: Retrieve ownership history
     * Commments: Loop from the front end, starting from 0 to the current no. of transfer to get the full ownership history
     */
    function getOwnershipHistory(uint256 vehicleId, uint256 ownerId) 
        external 
            vehicleRegDetails2Exists(vehicleId) 
            ownershipDetailsExists(vehicleId, ownerId)
            returns (
                bytes32, 
                uint256, 
                bytes32,
                address) {

                    bytes32 owner = vehOwnerRecords[vehicleId][ownerId].ownerName;
                    uint256 contact = vehOwnerRecords[vehicleId][ownerId].ownerContact;
                    bytes32 ownerPhysicalAddress = vehOwnerRecords[vehicleId][ownerId].ownerPhysicalAddress;
                    address ownerAddress = vehOwnerRecords[vehicleId][ownerId].ownerAddress;
                    // emit event
                    emit vehOwnershipHistoryRetrieved(vehicleId, owner, contact, ownerPhysicalAddress, ownerAddress);
                    
                    return (owner, contact, ownerPhysicalAddress, ownerAddress);

    }

    /**
     * Function 14: Update vehicle ownership details
     * Comments: Only can update the current owner's details (previous owner's details fixed)
     */
    function updateOwnerDetails (
        uint256 vehicleId, 
        bytes32 _ownerName, 
        uint256 _ownerContact,
        bytes32 _ownerPhysicalAddress) 
        external vehicleRegDetails2Exists(vehicleId) returns (bool) {
            
            // No. of transfers = 0 (0 refers to the first owner with ownerId = 0)
            uint256 ownerId = getNoOfTransfers(vehicleId);

            require (vehOwnerRecords[vehicleId][ownerId].exists, 'Owner ID Invalid: Owner does not exists for this vehicle');
            
            // Update fields
            vehOwnerRecords[vehicleId][ownerId].ownerName = _ownerName;
            vehOwnerRecords[vehicleId][ownerId].ownerContact = _ownerContact;
            vehOwnerRecords[vehicleId][ownerId].ownerPhysicalAddress = _ownerPhysicalAddress;

            // emit event
            emit vehOwnerDetailsUpdated(vehicleId, ownerId);

            return true;
    }

    /**
     * Function 15: Add servicing record function
     * Comments: 'servicing id' derived from mapping of noOfServicingRecords[Vehicle ID]. (1 = first servicing record)
     */
    function addServicingRec(
        uint256 vehicleId,
        bytes32 dateCompleted,
        bytes32 workshopRegNo,
        bytes32 typeOfWorkDone,
        bytes32 appointedMechanic,
        bytes32 currentMileage,
        bytes32 workDone,
        bytes32 totalCharges
    ) external vehicleRegDetails2Exists(vehicleId) returns (uint256) {

        // Increment the number of servicing record for this vehicle
        noOfServicingRecords[vehicleId]++;

        // ServicingID = 1 means it is the first record
        uint256 newServicingId = noOfServicingRecords[vehicleId];

        VehServicingDetails memory newServicingDetails =
            VehServicingDetails(
                newServicingId,
                dateCompleted,
                workshopRegNo,
                setTypeOfServicingEnum(typeOfWorkDone),
                appointedMechanic,
                currentMileage,
                workDone,
                totalCharges,
                false
            );

        vehServicingRecords[vehicleId][newServicingId] = newServicingDetails;

        // Update vehServicingIds mapping
        vehServicingIds[vehicleId].push(newServicingId);

        emit vehServicingDetailsRecorded(vehicleId, newServicingId);

        return newServicingId;
    }

    /**
     * Function 16: Acknowledge servicing record
     * Comments: For owner to acknowledge the servicing record
     */
    function acknowledgeServicing(uint256 vehicleId, uint256 servicingId) 
        external vehicleRegDetails2Exists(vehicleId) 
        vehicleServicingIdExists(vehicleId, servicingId) returns (bool) {

            // Update acknowledged boolean
            vehServicingRecords[vehicleId][servicingId].acknowledgedByOwner = true;
            
            // emit event
            emit vehServicingDetailsAcknowledged(vehicleId, servicingId);

            return true;
    }

    /**
     * Function 17: Retrieve servicing history
     * Commments: Loop from the front end to get the full servicing history
     */
    function retrieveServHistory1(uint256 vehicleId, uint256 servicingId) 
        external 
            vehicleRegDetails2Exists(vehicleId) 
            vehicleServicingIdExists(vehicleId, servicingId)
            returns (
                bytes32,
                bytes32, 
                bytes32,
                bytes32,
                bytes32) {

                    // emit event
                    emit vehServicingHistoryRetrieved(vehicleId, servicingId);
                    
                    return (
                        vehServicingRecords[vehicleId][servicingId].dateCompleted,
                        vehServicingRecords[vehicleId][servicingId].workshopRegNo,
                        vehServicingRecords[vehicleId][servicingId].appointedMechanic,
                        vehServicingRecords[vehicleId][servicingId].currentMileage,
                        vehServicingRecords[vehicleId][servicingId].workDone
                    );
    }

    /**
     * Function 18: Retrieve type of servicing done
     * Commments: To avoid stack too deep issue (Helper function: getBytes32FromEnum)
     */
    function retrieveServHistory2(uint256 vehicleId, uint256 servicingId) external
        vehicleRegDetails2Exists(vehicleId) 
        vehicleServicingIdExists(vehicleId, servicingId)
        returns (bytes32, bytes32, bool) {

            // emit event
            emit vehServicingHistory2Retrieved(vehicleId, servicingId);

            return (
                getBytes32FromEnum(vehServicingRecords[vehicleId][servicingId].typeOfWorkDone),
                vehServicingRecords[vehicleId][servicingId].totalCharges,
                vehServicingRecords[vehicleId][servicingId].acknowledgedByOwner
            );

    }

    /**
     * Function 19: Add accident record function
     * Commments:
     */
    function addAccidentRec(
        uint256 vehicleId,
        bytes32 accidentDateLocation,
        bytes32 driverName,
        bytes32 timeOfAccident,
        bytes32 descriptionOfAccident,
        bytes32 insuranceCoName,
        bytes32 appointedWorkshopNo,
        uint256 servicingId,
        bytes32 remarks
    ) external vehicleRegDetails2Exists(vehicleId) returns (uint256) {

        // Increment the number of accident record for this vehicle
        noOfAccidentRecords[vehicleId]++;

        // Accident ID = 1 means it is the first record
        uint256 newAccidentId = noOfAccidentRecords[vehicleId];

        VehAccidentDetails memory newAccidentDetails =
            VehAccidentDetails(
                newAccidentId,
                accidentDateLocation,
                driverName,
                timeOfAccident,
                descriptionOfAccident,
                insuranceCoName,
                appointedWorkshopNo,
                servicingId,
                remarks,
                false
            );

        vehAccidentRecords[vehicleId][newAccidentId] = newAccidentDetails;

        // Update vehAccidentIds mapping
        vehAccidentIds[vehicleId].push(newAccidentId);

        emit vehAccidentDetailsRecorded(vehicleId, newAccidentId);

        return newAccidentId;
    }

    /**
     * Function 20: Update accident claim status
     * Comments: For insurance company to update the accident claim status
     */
    function updateClaimStatus(uint256 vehicleId, uint256 accidentId) 
        external vehicleRegDetails2Exists(vehicleId) 
        vehicleAccidentIdExists(vehicleId, accidentId) returns (bool) {

            // Update claim status boolean
            vehAccidentRecords[vehicleId][accidentId].claimIssued = true;
            
            // emit event
            emit vehInsuranceClaimIssued(vehicleId, accidentId);

            return true;
    }

    /**
     * Function 21: Retrieve accident history
     * Commments: Loop from the front end to get the full accident history
     */
    function getAccidentHistory1(uint256 vehicleId, uint256 accidentId) 
        external 
            vehicleRegDetails2Exists(vehicleId) 
            vehicleAccidentIdExists(vehicleId, accidentId)
            returns (
                bytes32,
                bytes32, 
                bytes32,
                bytes32,
                bytes32) {

                    // Emit event
                    emit vehAccidentHistoryRetrieved(vehicleId, accidentId);
                    
                    return (
                        vehAccidentRecords[vehicleId][accidentId].accidentDateLocation,
                        vehAccidentRecords[vehicleId][accidentId].driverName,
                        vehAccidentRecords[vehicleId][accidentId].timeOfAccident,
                        vehAccidentRecords[vehicleId][accidentId].descriptionOfAccident,
                        vehAccidentRecords[vehicleId][accidentId].insuranceCoName
                    );
    }

    /**
     * Function 22: Retrieve accident history 2
     * Commments: To avoid stack too deep issue
     */
    function getAccidentHistory2(uint256 vehicleId, uint256 accidentId) 
        external 
            vehicleRegDetails2Exists(vehicleId) 
            vehicleAccidentIdExists(vehicleId, accidentId)
            returns (
                bytes32,
                uint256,
                bytes32,
                bool) {
                
                // Emit event
                emit vehAccidentHistory2Retrieved(vehicleId, accidentId);

                return (
                    vehAccidentRecords[vehicleId][accidentId].appointedWorkshopNo,
                    vehAccidentRecords[vehicleId][accidentId].servicingId,
                    vehAccidentRecords[vehicleId][accidentId].remarks,
                    vehAccidentRecords[vehicleId][accidentId].claimIssued
                );

    }

    /**
     * Function 23: Retrieve all servicing records on vehicle id
     * Commments:
     */
    function getAllVehServicingRecords(uint256 vehicleId) external
        vehicleRegDetails2Exists(vehicleId) returns (uint256[] memory) {

            // Emit event
            emit vehServicingRecordsRetrieved(vehicleId);

            return vehServicingIds[vehicleId];

    }

    /**
     * Function 24: Retrieve all accident records on vehicle id
     * Commments:
     */
    function getAllVehAccidentRecords(uint256 vehicleId) external
        vehicleRegDetails2Exists(vehicleId) returns (uint256[] memory) {

            // Emit event
            emit vehAccidentRecordsRetrieved(vehicleId);

            return vehAccidentIds[vehicleId];

    }

    // ---------------------------- Helper functions ---------------------------- //
    
    function getOwnerOfContract() public view returns (address) {
        return _owner;
    }

    function getCurrentVehOwnerAddress(uint256 vehicleId) external view returns (address){
        return vehRegRecords2[vehicleId].ownerAddress;
    }

    function getNoOfTransfers(uint256 vehicleId) public view returns (uint256) {
        return vehRegRecords2[vehicleId].noOfTransfers;
    }

    function getNoOfServicingRecords(uint256 vehicleId) public view returns (uint256) {
        return noOfServicingRecords[vehicleId];
    }

    function getNoOfAccidentRecords(uint256 vehicleId) public view returns (uint256) {
        return noOfAccidentRecords[vehicleId];
    }

    // Custom function to avoid stack too deep
    function setTypeOfServicingEnum(bytes32 typeOfWorkDone)
        internal
        pure
        returns (typeOfServicing)
    {
        // Setting the enum
        typeOfServicing _typeOfServicing;

        // (compareStrings(bytes32ToString(typeOfWorkDone), "modification"))
        if (typeOfWorkDone == bytes32("modification")) {
            _typeOfServicing = typeOfServicing.modification;
        } else if (typeOfWorkDone == bytes32("maintenance")) {
            _typeOfServicing = typeOfServicing.maintenance;
        } else {
            _typeOfServicing = typeOfServicing.repair;
        }

        return _typeOfServicing;
    }

    // Custom function to derive bytes32 from enum to avoid stack too deep
    function getBytes32FromEnum(typeOfServicing typeOfWorkDone)
        internal
        pure
        returns (bytes32)
    {
        // Setting the enum
        bytes32 _typeOfServicing;

        // (compareStrings(bytes32ToString(typeOfWorkDone), "modification"))
        if (typeOfWorkDone == typeOfServicing.modification) {
            _typeOfServicing = "modification";
        } else if (typeOfWorkDone == typeOfServicing.maintenance) {
            _typeOfServicing = "maintenance";
        } else {
            _typeOfServicing = "repair";
        }

        return _typeOfServicing;
    }

    // Function for converting bytes32 to string
    function bytes32ToString(bytes32 _bytes32)
        internal
        pure
        returns (string memory)
    {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }

        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    // Function to compare strings
    function compareStrings(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    // Function to test whether vehicle exists
    function doesVehicleExist(uint256 vehicleId) external view returns (bool) {
        return vehRegRecords2[vehicleId].registered;
    }

}