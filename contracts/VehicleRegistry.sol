pragma solidity ^0.5.0;
import "./Vehicle.sol";

// OpenZeppelin's Ownable contract provides onlyOwner() modifier
import "@openzeppelin/contracts/ownership/Ownable.sol";
// OpenZeppelin Role-Based Access Control library
import "@openzeppelin/contracts/access/Roles.sol";

contract VehicleRegistry is Ownable, Vehicle {
    Vehicle vehicleContract;
    address public vehicleRegistryOwner; // Contract owner

    // -------------- OpenZeppelin Role-Based Access Control --------------- //
    using Roles for Roles.Role;
    Roles.Role private _ownerDealer;
    Roles.Role private _workshop;
    Roles.Role private _administrator;

    constructor(Vehicle vehicleAddress) public {
        vehicleContract = vehicleAddress;
        vehicleRegistryOwner = msg.sender;

        // Initiatilization: Register vehicle registry owner to admin
        registerAdmin(
            vehicleRegistryOwner,
            stringToBytes32("Genesis Admin"),
            stringToBytes32("1 Jan 2020"),
            90000000
        );
    }

    // ---------------------------- Structs ---------------------------- //

    struct OwnerDealer {
        bytes32 name; // Vincar Pte Ltd.
        uint256 contact; // 95554302
        bytes32 companyRegNo; // 200312900K
        bytes32 physicalAddress; // 61 Ubi Avenue 2 #02-16/17, Automobile Megamart, Singapore 408898
        bool isDealer; // true (if its a dealer)
        uint256 noOfVehiclesOwn; // 3 (3 vehicles)
        bytes32 dateOfReg; // 3 April 1986
        mapping(uint256 => uint256) vehicleIdIndex; // vehicleIdIndex[Vehicle ID] = Index in the array
        uint256[] vehicleIds; // Array of vehicle IDs (E.g. 1, 5, 10, ...)
        mapping(uint256 => bool) ownsVehicle; // ownsVehicle[Vehicle ID] = true (owner owns the vehicle)
        mapping(uint256 => uint256) noOfAuthorizedParties; // noOfAuthorizedParties[Vehicle ID] = 1 (Vehicle ID 1 has 1 authorized party)
        mapping(uint256 => mapping(address => uint256)) authorizedPartyIndex; // authorizedPartyIndex[VehicleID][Authorized Party's Address] => Index
        mapping(uint256 => address[]) authorizedParties; // authorizedParties[vehicle id] = address[]
        mapping(uint256 => mapping(address => bool)) isAuthorized; // isAuthorized[vehicle ID][address] = true (means the address is authorized to access the info)
        bool active; // Act as archive the owner: Since the owner might own another vehicle again
    }

    struct Workshop {
        bytes32 workshopName; // Precise Auto Service
        bytes32 workshopRegNo; // 35766600C
        bytes32 physicalAddress; // 1 Kaki Bukit Avenue 6, #02-34/36, Autobay @ Kaki Bukit, Singapore 417883
        uint256 contact; // 67457367
        bytes32 dateOfReg; // 3 April 1986
        uint256[] vehicleIdsWorkedOn; // Array of vehicle IDs worked on (E.g. 1, 5, 10, ...)
        mapping(uint256 => bool) vehIdsWorkedOnExists; // e.g. vehIdsWorkedOnActive[Vehicle ID] = true;
        mapping(uint256 => uint256[]) vehServicingIdsCompleted; // vehServicingIdsCompleted[Vehicle ID] => uint256[] servicing ids
        address workshopOwnerAddress; // Workshop owner address
        bool active; // To check whether workshop is active
    }

    struct Administrator {
        bytes32 adminName; // Rebecca Lim
        bytes32 dateJoined; // 21 February 2021
        uint256 contact; // 97774302
        bool active; // To check whether admin is active
    }

    // ---------------------------- Mappings ---------------------------- //

    mapping(address => OwnerDealer) ownersDealers;
    mapping(address => Workshop) workshops;
    mapping(address => Administrator) admins;

    // ----------------------- OpenZeppelin Counters ----------------------- //

    using Counters for Counters.Counter;
    Counters.Counter private _numOfOwnersDealers;
    Counters.Counter private _numOfWorkshops;
    Counters.Counter private _numOfAdmins;

    // ---------------------------- Events ---------------------------- //

    // Owner / Dealer events
    event ownerDealerRegistered(address ownerDealerAddress);
    event ownerDealerInfoRetrieved(address ownerDealerAddress);
    event ownerDealerInfoUpdated(address ownerDealerAddress);
    event ownerDealerRemoved(address ownerDealerAddress);
    event noOfVehiclesOwnRetrieved(uint256 noOfVehiclesOwn);

    // Workshop events
    event workshopRegistered(address workshopAddress);
    event workshopInfoRetrieved(address workshopAddress);
    event workshopInfoUpdated(address workshopAddress);
    event workshopRemoved(address workshopAddress);
    event vehicleIdsByWorkshop(address workshopAddress);
    event servicingRecordsOnVehicleByWorkshop(address workshopAddress);

    // Administrator events
    event adminRegistered(address registeredAddress);
    event adminInfoRetrieved(address adminAddress);
    event adminInfoUpdated(address adminAddress);
    event adminRemoved(address adminAddress);

    // Authorization events
    event addressAuthorized(
        uint256 vehicleId,
        address authorizer,
        address authorizedAddress
    );
    event authorizedAddressesRetrieved(
        uint256 vehicleId,
        address ownerDealerAddress
    );
    event authorizationRemoved(
        uint256 vehicleId,
        address authorizer,
        address authorizedAddress
    );

    // Vehicle-related events
    event allVehiclesOwnedRetrieved(address ownerDealerAddress);
    event servicingRecordsForVehicleRetrieved(
        uint256 vehicleId,
        uint256 noOfServicingRecords
    );
    event accidentRecordsForVehicleRetrieved(
        uint256 vehicleId,
        uint256 noOfAccidentRecords
    );

    event vehicleTransferCompleted(
        uint256 vehicleId,
        address currentOwnerAddress,
        address newOwnerAddress
    );

    event noOfTransferRetrieved(uint256 vehicleId, uint256 noOfTransfers);
    event noOfServicingRecordsRetrieved(
        uint256 vehicleId,
        uint256 noOfServicingRecords
    );
    event noOfAccidentRecordsRetrieved(
        uint256 vehicleId,
        uint256 noOfAccidentRecords
    );

    // Vehicle.sol's functions events
    event vehicleRegistration1Completed(
        uint256 newVehId,
        address ownerDealerAddress
    );
    event vehicleRegistration2Completed(
        uint256 newVehId,
        address ownerDealerAddress
    );
    event vehicleCOERegUpdated(
        uint256 vehicleId,
        bytes32 effectiveRegDate,
        uint256 quotaPrem
    );

    // ---------------------------- Modifiers ---------------------------- //

    modifier onlyOwnerDealer() {
        require(
            _ownerDealer.has(msg.sender),
            "Address Invalid: Not registered as owner or dealer"
        );
        _;
    }

    modifier onlyWorkshop() {
        require(
            _workshop.has(msg.sender),
            "Address Invalid: Not registered as workshop"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            _administrator.has(msg.sender),
            "Address Invalid: Not registered as adminstrator"
        );
        _;
    }

    modifier ownerDealerActive(address _ownerDealerAddress) {
        require(
            ownersDealers[_ownerDealerAddress].active,
            "Invalid Address: Owner/Dealer address no longer active in the registry"
        );
        _;
    }

    modifier workshopActive(address _workshopAddress) {
        require(
            workshops[_workshopAddress].active,
            "Invalid Address: Workshop address no longer active in the registry"
        );
        _;
    }

    modifier adminActive(address _adminAddress) {
        require(
            admins[_adminAddress].active,
            "Invalid Address: Administrator address no longer active in the registry"
        );
        _;
    }

    modifier vehicleExists(uint256 _vehicleId) {
        require(
            vehicleContract.doesVehicleExists(_vehicleId),
            "Vehicle ID Invalid: Vehicle does not Active"
        );
        _;
    }

    // Checks access only for vehicle owner
    modifier onlyVehOwner(uint256 _vehicleId, address _validAddress){
        require(isVehicleOwnedBy(_vehicleId, _validAddress),
        "Only vehicle owner can access this function");
        _;
    }

    // Checks access only for vehicle owner and admin
    modifier onlyVehOwnerAndAdmin(uint256 _vehicleId, address _validAddress) {
        require(
            _administrator.has(_validAddress) ||
                isVehicleOwnedBy(_vehicleId, _validAddress),
            "Only vehicle owner or administrator can access this function"
        );
        _;
    }

    // Checks access only for owner and admin
    modifier onlyOwnerAdmin(address _ownerDealerAddress) {
        require( _ownerDealerAddress == msg.sender 
            || _administrator.has(msg.sender),
            "Only the owner and admin can access this function");
        _;
    }

    // Check access only for workshop and admin
    modifier onlyWorkshopAdmin(address _workshopAddress) {
        require( _workshopAddress == msg.sender 
            || _administrator.has(msg.sender),
            "Only the workshop and admin can access this function");
        _;
    }

    // Only registered users (owner, workshop, admin)
    modifier onlyRegisteredUsers(address _validAddress) {
        require(
            _ownerDealer.has(_validAddress)
            || _administrator.has(_validAddress)
            || _workshop.has(_validAddress),
            "Only owner/dealer, admin, and workshops can acess this function"
        );
        _;
    }

    // Checks access only for owner, admin, or authorized parties
    modifier onlyOwnerAdminAuthorized(
        uint256 _vehicleId,
        address _validAddress
    ) {
        address _ownerDealerAddress =
            vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

        require(
            _administrator.has(_validAddress) ||
                isVehicleOwnedBy(_vehicleId, _validAddress) ||
                isAddressAuthorized(
                    _vehicleId,
                    _ownerDealerAddress,
                    _validAddress
                ),
            "Only administrator or vehicle owner or authorized parties can access this function"
        );
        _;
    }

    // Checks access only for owner, admin, workshop or authorized parties
    modifier onlyAllAuthorizedRoles(uint256 _vehicleId, address _validAddress) {
        address _ownerDealerAddress =
            vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

        require(
            _administrator.has(_validAddress) ||
                _workshop.has(_validAddress) ||
                isVehicleOwnedBy(_vehicleId, _validAddress) ||
                isAddressAuthorized(
                    _vehicleId,
                    _ownerDealerAddress,
                    _validAddress
                ),
            "Only administrator or workshop or vehicle owner or authorized parties can access this function"
        );
        _;
    }

    // ---------------------------- Functions ---------------------------- //

    /**
     * Function 1: Register Owner or Dealer
     * Comments: Admin will register all existing vehicle owners and new vehicle owner
     * Allowed Roles: Admin
     */
    function registerOwnerDealer(
        address _ownerDealerAddress,
        bytes32 _name,
        uint256 _contact,
        bytes32 _companyRegNo,
        bytes32 _physicalAddress,
        bytes32 _dateOfReg,
        bool _isDealer
    ) public onlyAdmin returns (bool) {
        require(
            !_ownerDealer.has(_ownerDealerAddress),
            "Address already registered as owner or dealer"
        );

        // Mappings are added & updated seperately
        OwnerDealer memory newOwnerDealer =
            OwnerDealer(
                _name,
                _contact,
                _companyRegNo,
                _physicalAddress,
                _isDealer,
                0, // number of vehicles own
                _dateOfReg,
                new uint256[](0), // [Empty array of 0 length] vehicleIds[]
                true
            );

        ownersDealers[_ownerDealerAddress] = newOwnerDealer;

        // Register address into owner/dealer role
        _ownerDealer.add(_ownerDealerAddress);
        ownersDealers[_ownerDealerAddress].active = true;

        // Increment counter
        _numOfOwnersDealers.increment();

        emit ownerDealerRegistered(_ownerDealerAddress);

        return true;
    }

    /**
     * Function 2: Retrieve owner or dealer information
     * Comments: Separate 'authorized parties' and 'vehicles owned' retrieval function
     * Allowed Roles: Owner and admin
     */
    function retrieveOwnerDealerInfo(address _ownerDealerAddress)
        public onlyOwnerAdmin(_ownerDealerAddress)
        returns (
            bytes32,
            uint256,
            bytes32,
            bytes32,
            bytes32,
            bool
        )
    {

        // emit event
        emit ownerDealerInfoRetrieved(_ownerDealerAddress);

        return (
            ownersDealers[_ownerDealerAddress].name,
            ownersDealers[_ownerDealerAddress].contact,
            ownersDealers[_ownerDealerAddress].companyRegNo,
            ownersDealers[_ownerDealerAddress].physicalAddress,
            ownersDealers[_ownerDealerAddress].dateOfReg,
            ownersDealers[_ownerDealerAddress].isDealer
        );
    }

    /**
     * Function 3: Update owner or dealer information
     * Comments: Separate 'vehicles owned' update and 'authorized parties' function
     * Allowed Roles: Owner and admin
     */
    function updateOwnerDealerInfo(
        address _ownerDealerAddress,
        bytes32 _name,
        uint256 _contact,
        bytes32 _companyRegNo,
        bytes32 _physicalAddress,
        bytes32 _dateOfReg
    ) public ownerDealerActive(_ownerDealerAddress) onlyOwnerAdmin(_ownerDealerAddress) returns (bool) {

        // Update fields
        ownersDealers[_ownerDealerAddress].name = _name;
        ownersDealers[_ownerDealerAddress].contact = _contact;
        ownersDealers[_ownerDealerAddress].companyRegNo = _companyRegNo;
        ownersDealers[_ownerDealerAddress].physicalAddress = _physicalAddress;
        ownersDealers[_ownerDealerAddress].dateOfReg = _dateOfReg;

        bool updated =
            updateAllVehOwnersInfo(
                _ownerDealerAddress,
                _name,
                _contact,
                _physicalAddress
            );

        // emit event
        emit ownerDealerInfoUpdated(_ownerDealerAddress);

        return updated;
    }

    /**
     * Function 4: Remove owner or dealer information
     * Comments: Only remove/archive dealer while owner records will remain on the system,
     * Comments 2: as it removes the need to register the owner yet again when he buys a new car
     * Allowed Roles: Admin
     */
    function removeDealer(address _dealerAddress)
        public
        ownerDealerActive(_dealerAddress)
        onlyAdmin
        returns (bool)
    {
        // Update fields
        ownersDealers[_dealerAddress].active = false;

        // Remove access right as owner/dealer
        _ownerDealer.remove(_dealerAddress);

        // emit event
        emit ownerDealerRemoved(_dealerAddress);

        return true;
    }

    /**
     * Function 5: Register workshop
     * Comments:
     * Allowed Roles: Admin
     */
    function registerWorkshop(
        address _workshopAddress,
        bytes32 _workshopName,
        bytes32 _workshopRegNo,
        bytes32 _physicalAddress,
        uint256 _contact,
        bytes32 _dateOfReg
    ) public onlyAdmin returns (bool) {
        require(
            !_workshop.has(_workshopAddress),
            "Address already registered as workshop"
        );

        Workshop memory newWorkshop =
            Workshop(
                _workshopName,
                _workshopRegNo,
                _physicalAddress,
                _contact,
                _dateOfReg,
                new uint256[](0), // [Empty array of 0 length] vehicleIdsWorkedOn[]
                _workshopAddress,
                true
            );

        workshops[_workshopAddress] = newWorkshop;

        // Register address
        _workshop.add(_workshopAddress);
        workshops[_workshopAddress].active = true;

        // Increment counter
        _numOfWorkshops.increment();

        emit workshopRegistered(_workshopAddress);

        return true;
    }

    /**
     * Function 6: Retrieve workshop information
     * Comments: Separate 'servicing ID' retrieval function
     * Allowed Roles: Owner, admin, and workshop
     */
    function retrieveWorkshopInfo(address _workshopAddress)
        public
        onlyRegisteredUsers(msg.sender)
        returns (
            bytes32,
            bytes32,
            bytes32,
            uint256,
            bytes32,
            bool
        )
    {
        // emit event
        emit workshopInfoRetrieved(_workshopAddress);

        return (
            workshops[_workshopAddress].workshopName,
            workshops[_workshopAddress].workshopRegNo,
            workshops[_workshopAddress].physicalAddress,
            workshops[_workshopAddress].contact,
            workshops[_workshopAddress].dateOfReg,
            workshops[_workshopAddress].active
        );
    }

    /**
     * Function 7: Update workshop information
     * Comments: Separate 'servicing id' update function
     * Allowed Roles: 
     */
    function updateWorkshopInfo(
        address _workshopAddress,
        bytes32 _workshopName,
        bytes32 _workshopRegNo,
        bytes32 _physicalAddress,
        uint256 _contact,
        bytes32 _dateOfReg
    ) public workshopActive(_workshopAddress) onlyWorkshopAdmin(_workshopAddress) returns (bool) {

        // Update fields
        workshops[_workshopAddress].workshopName = _workshopName;
        workshops[_workshopAddress].workshopRegNo = _workshopRegNo;
        workshops[_workshopAddress].physicalAddress = _physicalAddress;
        workshops[_workshopAddress].contact = _contact;
        workshops[_workshopAddress].dateOfReg = _dateOfReg;

        // emit event
        emit workshopInfoUpdated(_workshopAddress);

        return true;
    }

    /**
     * Function 8: Remove workshop
     * Comments:
     * Allowed Roles: Admin
     */
    function removeWorkshop(address _workshopAddress)
        public
        workshopActive(_workshopAddress)
        onlyAdmin
        returns (bool)
    {
        // Update fields
        workshops[_workshopAddress].active = false;

        // Remove access right as workshop
        _workshop.remove(_workshopAddress);

        // emit event
        emit workshopRemoved(_workshopAddress);

        return true;
    }

    /**
     * Function 9: Register administrator
     * Comments: Only owner can grant admin right to address
     * Allowed Roles: Vehicle registry owner
     */
    function registerAdmin(
        address _adminAddress,
        bytes32 _adminName,
        bytes32 _dateJoined,
        uint256 _contact
    ) public onlyOwner returns (bool) {
        require(
            !_administrator.has(_adminAddress),
            "Address already registered as administrator"
        );

        Administrator memory newAdministrator =
            Administrator(_adminName, _dateJoined, _contact, true);

        admins[_adminAddress] = newAdministrator;

        // Register address
        _administrator.add(_adminAddress);
        admins[_adminAddress].active = true;

        // Increment counter
        _numOfAdmins.increment();

        emit adminRegistered(_adminAddress);

        return true;
    }

    /**
     * Function 10: Retrieve administrator information
     * Comments:
     * Allowed Roles: Admin
     */
    function retrieveAdminInfo(address _adminAddress)
        public
        onlyAdmin
        returns (
            bytes32,
            bytes32,
            uint256,
            bool
        )
    {
        bytes32 _adminName = admins[_adminAddress].adminName;
        bytes32 _dateJoined = admins[_adminAddress].dateJoined;
        uint256 _contact = admins[_adminAddress].contact;
        bool _active = admins[_adminAddress].active;

        // emit event
        emit adminInfoRetrieved(_adminAddress);

        return (_adminName, _dateJoined, _contact, _active);
    }

    /**
     * Function 11: Update administrator information
     * Comments:
     * Allowed Roles: Admin
     */
    function updateAdminInfo(
        address _adminAddress,
        bytes32 _adminName,
        bytes32 _dateJoined,
        uint256 _contact
    ) public adminActive(_adminAddress) returns (bool) {
        require(
            msg.sender == _adminAddress || _administrator.has(msg.sender),
            "Only the admin or owner can update the information"
        );

        // Update fields
        admins[_adminAddress].adminName = _adminName;
        admins[_adminAddress].dateJoined = _dateJoined;
        admins[_adminAddress].contact = _contact;

        // emit event
        emit adminInfoUpdated(_adminAddress);

        return true;
    }

    /**
     * Function 12: Remove admin
     * Comments:
     * Allowed Roles: Vehicle registry owner
     */
    function removeAdmin(address _adminAddress)
        public
        adminActive(_adminAddress)
        onlyOwner
        returns (bool)
    {
        // Update fields
        admins[_adminAddress].active = false;

        // Remove access right as admin
        _administrator.remove(_adminAddress);

        // emit event
        emit adminRemoved(_adminAddress);

        return true;
    }

    /**
     * Function 13: Authorize access to other party
     * Comments: Authorize to access functions like retrieve vehicle registration details, servicing history, and accident history
     * Allowed Roles: Vehicle owner
     */
    function authorizeAccess(
        uint256 _vehicleId,
        address _authorizedAddress
    ) public 
        ownerDealerActive(msg.sender)
        onlyVehOwner(_vehicleId, msg.sender) 
        onlyOwnerDealer returns (bool) {

        address _authorizer = msg.sender;

        // Update fields
        ownersDealers[_authorizer].authorizedPartyIndex[_vehicleId][
            _authorizedAddress
        ] = ownersDealers[_authorizer].noOfAuthorizedParties[_vehicleId]; // 0 for first authorized party
        ownersDealers[_authorizer].noOfAuthorizedParties[_vehicleId]++;
        ownersDealers[_authorizer].isAuthorized[_vehicleId][
            _authorizedAddress
        ] = true;
        ownersDealers[_authorizer].authorizedParties[_vehicleId].push(
            _authorizedAddress
        );

        // emit event
        emit addressAuthorized(_vehicleId, _authorizer, _authorizedAddress);

        return true;
    }

    /**
     * Function 14: Retrieve authorized parties for vehicle id
     * Comments: Returns the array of 'authorized addresses' and 'no of authorized parties'
     * Allowed Roles: Vehicle owner
     */
    function retrieveAuthorizedAddresses(
        uint256 _vehicleId
    )
        public
        ownerDealerActive(msg.sender)
        onlyVehOwner(_vehicleId, msg.sender)
        onlyOwnerDealer
        returns (uint256, address[] memory)
    {
        address _ownerDealerAddress = msg.sender;

        // emit event
        emit authorizedAddressesRetrieved(_vehicleId, _ownerDealerAddress);

        return (
            ownersDealers[_ownerDealerAddress].noOfAuthorizedParties[
                _vehicleId
            ],
            ownersDealers[_ownerDealerAddress].authorizedParties[_vehicleId]
        );
    }

    /**
     * Function 15: Remove authorization access to other party
     * Comments:
     * Allowed Roles: Vehicle owner
     */
    function removeAuthorization(
        uint256 _vehicleId,
        address _authorizedAddress
    ) public 
        ownerDealerActive(msg.sender)
        onlyVehOwner(_vehicleId, msg.sender) 
        onlyOwnerDealer 
        returns (bool) {

        address _authorizer = msg.sender;

        bool authRemoved =
            removeAuthorizedPartyFromArray(
                _authorizer,
                _vehicleId,
                _authorizedAddress
            );

        ownersDealers[_authorizer].isAuthorized[_vehicleId][
            _authorizedAddress
        ] = false;
        ownersDealers[_authorizer].noOfAuthorizedParties[_vehicleId]--;

        // emit event
        emit authorizationRemoved(_vehicleId, _authorizer, _authorizedAddress);

        return authRemoved;
    }

    /**
     * Function 16: Retrieve all vehicles owned by owner / dealer
     * Comments:
     * Allowed Roles: Owner, Admin
     */
    function retrieveAllVehiclesOwn(address _ownerDealerAddress)
        public
        ownerDealerActive(_ownerDealerAddress)
        returns (uint256[] memory)
    {
        // Only owner or admin can access this function
        require(
            _ownerDealer.has(msg.sender) || _administrator.has(msg.sender),
            "Only owner or admin can retrieve all the vehicles information"
        );

        // emit event
        emit allVehiclesOwnedRetrieved(_ownerDealerAddress);

        return ownersDealers[_ownerDealerAddress].vehicleIds;
    }

    /**
     * Function 17: Retrieve all servicing records on vehicle id
     * Comments: 
     * Allowed Roles: Only admin, owner, workshop & approved addresses
     */
    function retrieveAllServicingRecordsOn(uint256 _vehicleId)
        public
        vehicleExists(_vehicleId)
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (uint256[] memory servicingRecords)
    {
        servicingRecords = vehicleContract.getAllVehServicingRecords(
            _vehicleId
        );

        // emit event
        emit servicingRecordsForVehicleRetrieved(
            _vehicleId,
            servicingRecords.length
        );

        // Vehicle.sol: Return all servicing records for vehicle id
        return servicingRecords;
    }

    /**
     * Function 18: Retrieve all accident records on vehicle id
     * Comments:
     * Allowed Roles: Only admin, owner, workshop and authorized parties
     */
    function retrieveAllAccidentRecordsOn(uint256 _vehicleId)
        public
        vehicleExists(_vehicleId)
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (uint256[] memory accidentRecords)
    {
        accidentRecords = vehicleContract.getAllVehAccidentRecords(_vehicleId);

        // Emit event
        emit accidentRecordsForVehicleRetrieved(
            _vehicleId,
            accidentRecords.length
        );

        // Return all accident records for vehicle id
        return accidentRecords;
    }

    /**
     * Function 19: Retrieve all vehicle ids done by workshop
     * Comments: Retrieve all vehicle ids serviced by workshop
     * Allowed Roles: Workshop, Admin
     */
    function retrieveAllVehIdsServicedBy(address _workshopAddress)
        public
        workshopActive(_workshopAddress)
        onlyWorkshopAdmin(_workshopAddress)
        returns (uint256[] memory)
    {

        // Emit event
        emit vehicleIdsByWorkshop(_workshopAddress);

        return workshops[_workshopAddress].vehicleIdsWorkedOn;
    }

    /**
     * Function 20: Retrieve all servicing records done by workshop
     * Comments: Retrieve all servicing ids on vehicle id by workshop
     * Roles: Workshop, Admin
     */
    function retrieveVehServicingRecordsBy(
        address _workshopAddress,
        uint256 _vehicleId
    ) public 
        workshopActive(_workshopAddress)
        onlyWorkshopAdmin(_workshopAddress)
        returns (uint256[] memory) {

        // Emit event
        emit servicingRecordsOnVehicleByWorkshop(_workshopAddress);

        return workshops[_workshopAddress].vehServicingIdsCompleted[_vehicleId];
    }

    /**
     * Function 21: Transfer vehicle to the new owner
     * Comments: Assumption: All dealers will be registered, hence unregistered buyer is just a normal person (Integrated initiate and accept)
     * Allowed Roles: Vehicle owner
     */
    function transferVehicle(
        uint256 _vehicleId,
        address _newOwnerAddress,
        bytes32 _newOwnerName, // Omitted unless buyer is an unregistered owner
        uint256 _newOwnerContact, // Omitted unless buyer is an unregistered owner
        bytes32 _newOwnerPhysicalAddress, // Omitted unless buyer is an unregistered owner
        bytes32 _newOwnerDateOfReg // Omitted unless buyer is an unregistered owner
    ) public 
        vehicleExists(_vehicleId)
        onlyVehOwner(_vehicleId, msg.sender) 
        returns (bool) {

        // Check if buyer is already registered as a owner, if not register buyer
        if (!_ownerDealer.has(_newOwnerAddress)) {
            registerNewOwner(
                _newOwnerAddress,
                _newOwnerName,
                _newOwnerContact,
                _newOwnerPhysicalAddress,
                _newOwnerDateOfReg
            );
        }

        // Retrieve current owner address
        address _currentOwnerAddress =
            vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

        // ------- Updates to Vehicle.sol ------- //
        bool transferSucceeded = processVehicleTransfer(_vehicleId, _currentOwnerAddress, _newOwnerAddress);

        // ------- Updates to VehicleRegistry.sol ------- //
        bool transferSucceeded2 = processVehicleTransfer2(_vehicleId, _currentOwnerAddress, _newOwnerAddress);
        
        if (transferSucceeded && transferSucceeded2) {
            // Emit event
            emit vehicleTransferCompleted(
                _vehicleId,
                _currentOwnerAddress,
                _newOwnerAddress
            );
            return true;
        } else {
            return false;
        }

    }

    // ---------------------------- Functions from Vehicle.sol with Role-Based Access Control ---------------------------- //

    /**
     * Function 22: Register vehicle info 1 to owner
     * Comments: Assumption - Owner has to be registered first. Broken into 2 parts to avoid stack too deep issue
     * Allowed Roles: Admin
     */
    function registerVehicleToOwner1(
        address _ownerDealerAddress,
        bytes32 _vehicleNo,
        bytes32 _makeModel,
        uint256 _manufacturingYear,
        bytes32 _engineNo,
        bytes32 _chassisNo,
        uint256 _omv,
        bytes32 _originalRegDate,
        bytes32 _effectiveRegDate
    ) public onlyAdmin returns (uint256) {
        // Only can register the vehicle to a registered address
        require(
            _ownerDealer.has(_ownerDealerAddress),
            "Please register the owner first before registering the vehicle to owner"
        );

        // Register vehicle using Vehicle.sol's function
        uint256 _newVehId =
            vehicleContract.addRegisteredVeh1(
                _vehicleNo,
                _makeModel,
                _manufacturingYear,
                _engineNo,
                _chassisNo,
                _omv,
                _originalRegDate,
                _effectiveRegDate
            );

        // Update VehicleRegistry.sol
        addVehicleIdIntoVehiclesArray(_ownerDealerAddress, _newVehId);
        ownersDealers[_ownerDealerAddress].vehicleIdIndex[
            _newVehId
        ] = ownersDealers[_ownerDealerAddress].noOfVehiclesOwn; // 0
        ownersDealers[_ownerDealerAddress].noOfVehiclesOwn++; // 1
        ownersDealers[_ownerDealerAddress].ownsVehicle[_newVehId] = true;

        // Emit event
        emit vehicleRegistration1Completed(_newVehId, _ownerDealerAddress);

        return _newVehId;
    }

    /**
     * Function 23: Register vehicle info 2 to owner
     * Comments: Assumption - Owner has to be registered first. Broken into 2 parts to avoid stack too deep issue
     * Allowed Roles: Admin
     */
    function registerVehicleToOwner2(
        address _ownerDealerAddress,
        uint256 _noOfTransfers,
        bytes32 _engineCap,
        bytes32 _coeCat,
        uint256 _quotaPrem,
        bytes32 _ownerName
    ) public onlyAdmin returns (uint256) {
        // Only can register the vehicle to a registered address
        require(
            _ownerDealer.has(_ownerDealerAddress),
            "Please register the owner first before registering the vehicle"
        );

        uint256 _newVehId =
            vehicleContract.addRegisteredVeh2(
                _noOfTransfers,
                _engineCap,
                _coeCat,
                _quotaPrem,
                _ownerName,
                _ownerDealerAddress
            );

        // Internal helper function to register owner details to vehicle
        registerNewOwnerDetailsToVehicle(
            _newVehId,
            _noOfTransfers,
            _ownerDealerAddress
        );

        // Emit event
        emit vehicleRegistration2Completed(_newVehId, _ownerDealerAddress);

        return _newVehId;
    }

    /**
     * Function 24: Retrieve registered vehicle details 1
     * Comments: Broken into 2 parts to avoid stack too deep issue
     * Allowed Roles: Admin, Owner, Authorized Parties
     */
    function retrieveVehicleDetails1(uint256 _vehicleId)
        public
        onlyOwnerAdminAuthorized(_vehicleId, msg.sender)
        returns (
            bytes32 _vehicleNo,
            bytes32 _makeModel,
            uint256 _manufacturingYear,
            bytes32 _engineNo,
            bytes32 _chassisNo
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        // Vehicle.sol's retrieveVehInfo1
        (
            _vehicleNo,
            _makeModel,
            _manufacturingYear,
            _engineNo,
            _chassisNo
        ) = vehicleContract.retrieveVehInfo1(_vehicleId);

        return (
            _vehicleNo,
            _makeModel,
            _manufacturingYear,
            _engineNo,
            _chassisNo
        );
    }

    /**
     * Function 25: Retrieve registered vehicle details 1 Part 2
     * Comments: Broken into 2 parts to avoid stack too deep issue
     * Allowed Roles: Admin, Owner, Authorized Parties
     */
    function retrieveVehicleDetails1Part2(uint256 _vehicleId)
        public
        onlyOwnerAdminAuthorized(_vehicleId, msg.sender)
        returns (
            uint256 omv,
            bytes32 originalRegDate,
            bytes32 effectiveRegDate
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        return vehicleContract.retrieveVehInfo1Part2(_vehicleId);
    }

    /**
     * Function 26: Retrieve registered vehicle details 1
     * Comments: Broken into 2 parts to avoid stack too deep issue
     * Allowed Roles: Admin, Owner, Authorized Parties
     */
    function retrieveVehicleDetails2(uint256 _vehicleId)
        public
        onlyOwnerAdminAuthorized(_vehicleId, msg.sender)
        returns (
            uint256 noOfTransfers,
            bytes32 engineCap,
            bytes32 coeCat,
            uint256 quotaPrem,
            bytes32 ownerName
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        return vehicleContract.retrieveVehInfo2(_vehicleId);
    }

    /**
     * Function 27: Update vehicle registration details
     * Comments: Updates to COE during COE renewal
     * Allowed Roles: Admin
     */
    function updateVehCOEReg(
        uint256 _vehicleId,
        bytes32 _effectiveRegDate,
        uint256 _quotaPrem
    ) public onlyAdmin returns (bool) {
        bool vehInfo1Updated =
            vehicleContract.updateVehInfo1(_vehicleId, _effectiveRegDate);
        bool vehInfo2Updated =
            vehicleContract.updateVehInfo2(_vehicleId, _quotaPrem);

        if (vehInfo1Updated && vehInfo2Updated) {
            // Emit event
            emit vehicleCOERegUpdated(
                _vehicleId,
                _effectiveRegDate,
                _quotaPrem
            );
            return true;
        } else {
            return false;
        }
    }

    /**
     * Function 28: Update registered vehicle license plate no
     * Comments: Assumption - Users will renew as per current practice
     * Allowed Roles: Admin
     */
    function updateVehLicensePlate(uint256 _vehicleId, bytes32 _newLicensePlate)
        public
        onlyAdmin
        returns (bool)
    {
        // Emit event omitted since vehicleContract already has event emitted

        return vehicleContract.updateVehNo(_vehicleId, _newLicensePlate);
    }

    /**
     * Function 29: Swap license plate
     * Comments: Assumption - Users will bid for new license plate as per current practice
     * Allowed Roles: Admin
     */
    function swapVehLicensePlate(uint256 _vehicleId, uint256 _otherVehicleId)
        public
        onlyAdmin
        returns (bool)
    {
        // Emit event omitted since vehicleContract already has event emitted
        return vehicleContract.swapLicensePlateNo(_vehicleId, _otherVehicleId);
    }

    /**
     * Function 30: Deregister vehicle
     * Comments: After vehicle is scrapped or exported
     * Allowed Roles: Admin
     */
    function deregisterVehicle(uint256 _vehicleId, address _ownerDealerAddress)
        public
        onlyAdmin
        returns (bool)
    {
        // Remove vehicle from owner
        removeVehicleIdFromVehiclesArray(_ownerDealerAddress, _vehicleId); // Updates vehicleIdIndex & vehicleIds
        ownersDealers[_ownerDealerAddress].noOfVehiclesOwn--;
        ownersDealers[_ownerDealerAddress].ownsVehicle[_vehicleId] = false;

        // Emit event omitted since vehicleContract already has event emitted

        return vehicleContract.deregisterVeh(_vehicleId);
    }

    /**
     * Function 31: Retrieve no. of transfers
     * Comments: To facilitate the next function: retrieveOwnershipHistory
     * Allowed Roles: Admin, owner and authorized parties
     */
    function retrieveNoOfTransfers(uint256 _vehicleId)
        public
        onlyOwnerAdminAuthorized(_vehicleId, msg.sender)
        returns (uint256 _noOfTransfers)
    {
        // Retrieve from Vehicle.sol
        _noOfTransfers = vehicleContract.getNoOfTransfers(_vehicleId);

        // Emit event
        emit noOfTransferRetrieved(_vehicleId, _noOfTransfers);

        return _noOfTransfers;
    }

    /**
     * Function 32: Retrieve ownership history
     * Comments: Get no of transfers for vehicle id, then loop and retrieve each owner's details using this function
     * Allowed Roles: Admin
     */
    function retrieveOwnershipHistory(uint256 _vehicleId, uint256 _ownerId)
        public
        onlyAdmin
        returns (
            bytes32 ownerName,
            uint256 ownerContact,
            bytes32 ownerPhysicalAddress,
            address ownerAddress
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        return vehicleContract.getOwnershipHistory(_vehicleId, _ownerId);
    }

    /**
     * Function 33: Add servicing record
     * Comments:
     * Allowed Roles: Workshop
     */
    function addServicingRecord(
        uint256 _vehicleId,
        bytes32 _dateCompleted,
        bytes32 _workshopRegNo,
        bytes32 _typeOfWorkDone,
        bytes32 _appointedMechanic,
        bytes32 _currentMileage,
        bytes32 _workDone,
        bytes32 _totalCharges,
        uint256 _accidentId // Omitted unless typeOfWorkDone = "Accident" (Frontend hide this field unless accident is selected)
    ) public onlyWorkshop returns (uint256) {
        // ------- Vehicle.sol ------ //

        uint256 _newServicingId =
            vehicleContract.addServicingRec(
                _vehicleId,
                _dateCompleted,
                _workshopRegNo,
                _typeOfWorkDone,
                _appointedMechanic,
                _currentMileage,
                _workDone,
                _totalCharges,
                _accidentId // Default = 0 (No related accident id)
            );

        // ------- VehicleRegistry.sol ------ //

        // Add to workshop's vehicleIdsWorkedOn & vehServicingIdsCompleted
        address _workshopAddress = msg.sender;

        // If vehicle has not been worked on before, add to vehicleIdsWorkedOn
        if (!workshops[_workshopAddress].vehIdsWorkedOnExists[_vehicleId]) {
            workshops[_workshopAddress].vehicleIdsWorkedOn.push(_vehicleId);
            workshops[_workshopAddress].vehIdsWorkedOnExists[_vehicleId] = true;
        }
        workshops[_workshopAddress].vehServicingIdsCompleted[_vehicleId].push(
            _newServicingId
        );

        return _newServicingId;
    }

    /**
     * Function 34: Retrieve number of servicing records for vehicle id
     * Comments: To facilitate the next function: retrieveServicingRecord
     * Allowed Roles: Admin, Owner, Workshop, Authorized Parties
     */
    function retrieveNoOfServicingRecords(uint256 _vehicleId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (uint256 _noOfServicingRecords)
    {
        // Retrieve from Vehicle.sol
        _noOfServicingRecords = vehicleContract.getNoOfServicingRecords(
            _vehicleId
        );

        // Emit event
        emit noOfServicingRecordsRetrieved(_vehicleId, _noOfServicingRecords);

        return _noOfServicingRecords;
    }

    /**
     * Function 35: Retrieve servicing record part 1
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop, Authorized Parties
     */
    function retrieveServicingRecord1(uint256 _vehicleId, uint256 _servicingId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (
            bytes32 dateCompleted,
            bytes32 workshopRegNo,
            bytes32 appointedMechanic,
            bytes32 currentMileage,
            bytes32 workDone
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        // Vehicle.sol's retrieveServicingRecord1
        return vehicleContract.retrieveServRecord1(_vehicleId, _servicingId);
    }

    /**
     * Function 36: Retrieve servicing record part 2
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop, Authorized Parties
     */
    function retrieveServicingRecord2(uint256 _vehicleId, uint256 _servicingId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (bytes32 typeOfWorkDone, bytes32 totalCharges)
    {
        // Emit event omitted since vehicleContract already has event emitted
        return vehicleContract.retrieveServRecord2(_vehicleId, _servicingId);
    }

    /**
     * Function 37: Add accident record
     * Comments: Assumption: Admin (LTA) will record the accident
     * Allowed Roles: Admin
     */
    function addAccidentRecord(
        uint256 _vehicleId,
        bytes32 _accidentDateLocation,
        bytes32 _driverName,
        bytes32 _timeOfAccident,
        bytes32 _descriptionOfAccident
    )
        public
        onlyAdmin
        returns (uint256)
    {
        // ------- Vehicle.sol ------ //

        uint256 _newAccidentId =
            vehicleContract.addAccidentRec(
                _vehicleId,
                _accidentDateLocation,
                _driverName,
                _timeOfAccident,
                _descriptionOfAccident
                // _appointedWorkshopRegNo, // added under addServicingRec
                // _servicingId, // added under addServicingRec
                // _remarks // added under addServicingRec
            );

        return _newAccidentId;
    }

    /**
     * Function 38: Retrieve number of accident records for vehicle id
     * Comments: To facilitate the next function: retrieveAccidentRecord
     * Allowed Roles: Admin, Owner, Workshop, Authorized Parties
     */
    function retrieveNoOfAccidentRecords(uint256 _vehicleId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (uint256)
    {
        // Retrieve from Vehicle.sol
        uint256 _noOfAccidentRecords =
            vehicleContract.getNoOfAccidentRecords(_vehicleId);

        // Emit event
        emit noOfAccidentRecordsRetrieved(_vehicleId, _noOfAccidentRecords);

        return _noOfAccidentRecords;
    }

    /**
     * Function 39: Retrieve accident record part 1
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop & Authorized Parties
     */
    function retrieveAccidentRecord1(uint256 _vehicleId, uint256 _accidentId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (
            bytes32 accidentDateLocation,
            bytes32 driverName,
            bytes32 timeOfAccident,
            bytes32 descriptionOfAccident
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        // Vehicle.sol's retrieveServicingRecord1
        (
            accidentDateLocation,
            driverName,
            timeOfAccident,
            descriptionOfAccident
        ) = vehicleContract.getAccidentRecord1(_vehicleId, _accidentId);

        return (
            accidentDateLocation,
            driverName,
            timeOfAccident,
            descriptionOfAccident
        );
    }

    /**
     * Function 40: Retrieve accident record part 2
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop & Authorized Parties
     */
    function retrieveAccidentRecord2(uint256 _vehicleId, uint256 _accidentId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (
            bytes32 appointedWorkshopNo,
            uint256 servicingId,
            bytes32 remarks
        )
    {
        // Emit event omitted since vehicleContract already has event emitted

        (
            appointedWorkshopNo,
            servicingId,
            remarks
        ) = vehicleContract.getAccidentRecord2(_vehicleId, _accidentId);

        return (appointedWorkshopNo, servicingId, remarks);
    }

    /**
     * Function 41: Retrieve number of vehicles own by owner
     * Comments: To facilitate the next function: retrieveServicingRecord
     * Allowed Roles: Admin, Owner
     */
    function retrieveNoOfVehiclesOwnBy(address _ownerDealerAddress)
        public
        onlyOwnerAdmin(_ownerDealerAddress)
        returns (uint256 _noOfVehiclesOwn)
    {

        // Retrieve from Vehicle.sol
        _noOfVehiclesOwn = ownersDealers[_ownerDealerAddress].noOfVehiclesOwn;

        // Emit event
        emit noOfVehiclesOwnRetrieved(_noOfVehiclesOwn);

        return _noOfVehiclesOwn;
    }

    /**
     * Function 42: Check if address is a registered owner
     * Comments: To facilitate vehicle transfer
     * Allowed Roles: Admin, Owner
     */
    function isAddressRegisteredOwner(address _address)
        public
        view
        returns (bool)
    {
        // Only admin or owner
        require(
            _ownerDealer.has(msg.sender) || _administrator.has(msg.sender),
            "Only registered owners or admins can access this function"
        );

        return _ownerDealer.has(_address);
    }

    // ---------------------------- Helper Functions ---------------------------- //

    // Helper function to remove a vehicle id from the array
    function removeVehicleIdFromVehiclesArray(
        address ownerDealer,
        uint256 vehicleId
    ) internal returns (bool) {
        // ownersDealers[address] => vehicleIdIndex[Vehicle ID] => array index
        uint256 index = ownersDealers[ownerDealer].vehicleIdIndex[vehicleId];
        uint256 vehicleIdsLength = ownersDealers[ownerDealer].vehicleIds.length;

        // if (index >= ownersDealers[ownerDealer].vehicleIds.length) return false;
        require(index < vehicleIdsLength, "Index does not exists");

        // Loop and move items behind index to the front by 1 index
        for (uint256 i = index; i < vehicleIdsLength - 1; i++) {
            // Update vehicleIdIndex after current index to point 1 index ahead
            ownersDealers[ownerDealer].vehicleIdIndex[
                ownersDealers[ownerDealer].vehicleIds[i + 1]
            ] = i;

            // Update array pointing the current index to the next index
            ownersDealers[ownerDealer].vehicleIds[i] = ownersDealers[
                ownerDealer
            ]
                .vehicleIds[i + 1];
        }

        // Decreasing the length of the array
        delete ownersDealers[ownerDealer].vehicleIds[vehicleIdsLength - 1];
        ownersDealers[ownerDealer].vehicleIds.length--;

        return true;
    }

    // Helper function to add vehicle id into the array
    function addVehicleIdIntoVehiclesArray(
        address ownerDealer,
        uint256 vehicleId
    ) internal returns (bool) {
        uint256 vehicleIdsLength = ownersDealers[ownerDealer].vehicleIds.length;

        ownersDealers[ownerDealer].vehicleIds.push(vehicleId);

        // Update vehicleIdIndex for newly added vehicle to point to the last index
        ownersDealers[ownerDealer].vehicleIdIndex[vehicleId] =
            vehicleIdsLength -
            1;

        return true;
    }

    // Helper function to remove an authorized party from array
    function removeAuthorizedPartyFromArray(
        address ownerDealer,
        uint256 vehicleId,
        address authorizedParty
    ) internal returns (bool) {
        // ownersDealers[address] => vehicleIdIndex[Vehicle ID] => array index
        uint256 index =
            ownersDealers[ownerDealer].authorizedPartyIndex[vehicleId][
                authorizedParty
            ];
        uint256 authorizedPartyLength =
            ownersDealers[ownerDealer].authorizedParties[vehicleId].length;

        // if (index >= ownersDealers[ownerDealer].vehicleIds.length) return false;
        require(index < authorizedPartyLength, "Index does not exists");

        // Loop and move items behind index to the front by 1 index
        for (uint256 i = index; i < authorizedPartyLength - 1; i++) {
            // Update next array element's index to point at the current element's index
            ownersDealers[ownerDealer].authorizedPartyIndex[vehicleId][
                ownersDealers[ownerDealer].authorizedParties[vehicleId][i + 1]
            ] = i;

            // Update array pointing the current index to the next index
            ownersDealers[ownerDealer].authorizedParties[vehicleId][
                i
            ] = ownersDealers[ownerDealer].authorizedParties[vehicleId][i + 1];
        }

        // Deleting the last item in the array
        delete ownersDealers[ownerDealer].authorizedParties[vehicleId][
            authorizedPartyLength - 1
        ];
        // Decreasing the length of the array
        ownersDealers[ownerDealer].authorizedParties[vehicleId].length--;

        return true;
    }

    // Check that the vehicle belongs to owner / dealer
    function isVehicleOwnedBy(uint256 _vehicleId, address _ownerDealerAddress)
        public
        view
        returns (bool)
    {
        return ownersDealers[_ownerDealerAddress].ownsVehicle[_vehicleId];
    }

    // Check that the address is authorized
    function isAddressAuthorized(
        uint256 _vehicleId,
        address _ownerDealAddress,
        address _authorizedAddress
    ) public view returns (bool) {
        return
            ownersDealers[_ownerDealAddress].isAuthorized[_vehicleId][
                _authorizedAddress
            ];
    }

    // Helper function to retrieve the role of the address
    function roleOfAddress(address _address) public view returns (bytes32) {
        bytes32 roleName;

        if (_ownerDealer.has(_address)) {
            if (ownersDealers[_address].isDealer) {
                roleName = "Dealer";
            } else {
                roleName = "Owner";
            }
        } else if (_workshop.has(_address)) {
            roleName = "Workshop";
        } else if (_administrator.has(_address)) {
            roleName = "Administrator";
        }

        return roleName;
    }

    // Helper function to update the owner info for all the vehicles the owner owns
    function updateAllVehOwnersInfo(
        address _ownerDealerAddress,
        bytes32 _ownerName,
        uint256 _ownerContact,
        bytes32 _ownerPhysicalAddress
    ) public returns (bool) {
        // Retrieve all vehicles that the owner owns
        uint256[] memory allVehicles =
            retrieveAllVehiclesOwn(_ownerDealerAddress);
        bool updated;

        for (uint256 i; i < allVehicles.length; i++) {
            updated = vehicleContract.updateOwnerDetails(
                allVehicles[i],
                _ownerName,
                _ownerContact,
                _ownerPhysicalAddress
            );
        }

        return updated;
    }

    // Helper function to convert string to bytes32
    function stringToBytes32(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    // Helper function for registering unregistered new owner after vehicle transfer
    function registerNewOwner(
        address _newOwnerAddress,
        bytes32 _newOwnerName,
        uint256 _newOwnerContact,
        bytes32 _newOwnerPhysicalAddress,
        bytes32 _newOwnerDateOfReg
    ) internal returns (bool) {
        // Add the buyer to owner / dealer database
        _ownerDealer.add(_newOwnerAddress);

        OwnerDealer memory newOwnerDealer =
            OwnerDealer(
                _newOwnerName,
                _newOwnerContact,
                bytes32(""), // Reg no. = undefined, unregistered buyers cannot be dealers
                _newOwnerPhysicalAddress,
                false, // isDealer = false
                0,
                _newOwnerDateOfReg,
                new uint256[](0),
                true
            );

        ownersDealers[_newOwnerAddress] = newOwnerDealer;
        _numOfOwnersDealers.increment();

        return true;
    }

    // Helper function to register new owner details to vehicle
    function registerNewOwnerDetailsToVehicle(
        uint256 _vehicleId,
        uint256 _ownerId,
        address _ownerDealerAddress
    ) internal returns (bool) {
        // Update new owner details to vehicle
        bool ownerDetailsRegistered =
            vehicleContract.registerNewOwnerDetails(
                _vehicleId,
                _ownerId, // ownerId = noOfTransfers
                ownersDealers[_ownerDealerAddress].name,
                ownersDealers[_ownerDealerAddress].contact,
                ownersDealers[_ownerDealerAddress].physicalAddress,
                _ownerDealerAddress // address
            );

        return ownerDetailsRegistered;
    }

    // Helper function to process Vehicle.sol's transfer vehicle update
    // Prevent stack too deep
    function processVehicleTransfer(
        uint256 _vehicleId,
        address _currentOwnerAddress,
        address _newOwnerAddress
        ) internal returns (bool) {

        // Transfer ERC721 Vehicle token
        vehicleContract.transferFrom(
            _currentOwnerAddress,
            _newOwnerAddress,
            _vehicleId
        );

        // transferVehicleUpdate function
        vehicleContract.transferVehicleUpdate(
            _vehicleId,
            ownersDealers[_newOwnerAddress].name,
            ownersDealers[_newOwnerAddress].contact,
            ownersDealers[_newOwnerAddress].physicalAddress,
            _newOwnerAddress
        );

        return true;

    }

    // Helper function to process VehicleRegistry.sol's transfer vehicle update
    // Prevent stack too deep
    function processVehicleTransfer2(
        uint256 _vehicleId,
        address _currentOwnerAddress,
        address _newOwnerAddress
        ) internal returns (bool) {

        // Remove vehicle from current owner
        removeVehicleIdFromVehiclesArray(_currentOwnerAddress, _vehicleId); // Updates vehicleIdIndex & vehicleIds
        ownersDealers[_currentOwnerAddress].noOfVehiclesOwn--;
        ownersDealers[_currentOwnerAddress].ownsVehicle[_vehicleId] = false;

        // Add vehicle to new owner
        addVehicleIdIntoVehiclesArray(_newOwnerAddress, _vehicleId);
        ownersDealers[_newOwnerAddress].noOfVehiclesOwn++;
        ownersDealers[_newOwnerAddress].ownsVehicle[_vehicleId] = true;

        return true;

    }

    // Check whether ERC721 token exists
    function doesTokenExists(uint256 tokenId) public view returns (bool) {
        return vehicleContract.doesERC721TokenExists(tokenId);
    }

    function getNoOfOwnersDealers() public view returns (uint256) {
        return _numOfOwnersDealers.current();
    }

    function getNoOfWorkshops() public view returns (uint256) {
        return _numOfWorkshops.current();
    }

    function getNoOfAdmins() public view returns (uint256) {
        return _numOfAdmins.current();
    }
}
