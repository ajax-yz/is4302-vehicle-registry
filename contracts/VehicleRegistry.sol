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
    Roles.Role private _insuranceCo;
    Roles.Role private _administrator;

    constructor(Vehicle vehicleAddress) public {
        vehicleContract = vehicleAddress;
        vehicleRegistryOwner = msg.sender;

        // Register vehicle registry owner to admin
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
        mapping(uint256 => uint256) vehicleIdToTransferIndex; // Keeps track of vehicle ids to transfer index
        uint256[] vehicleIdsToTransfer; // Array of vehicle IDs to transfer: vehicleIdsToTransfer.push(Vehicle ID)
        mapping(uint256 => uint256) vehicleIdToAcceptIndex; // Keeps track of vehicle ids to accept index
        uint256[] vehicleIdsToAccept; // Array of vehicle IDs to accept: vehicleIdsToAccept.push(Vehicle ID)
        bool exists; // To check whether exists
    }

    struct Workshop {
        bytes32 workshopName; // Precise Auto Service
        bytes32 workshopRegNo; // 35766600C
        bytes32 physicalAddress; // 1 Kaki Bukit Avenue 6, #02-34/36, Autobay @ Kaki Bukit, Singapore 417883
        uint256 contact; // 67457367
        bytes32 dateOfReg; // 3 April 1986
        uint256[] vehicleIdsWorkedOn; // Array of vehicle IDs worked on (E.g. 1, 5, 10, ...)
        mapping(uint256 => bool) vehIdsWorkedOnExists; // e.g. vehIdsWorkedOnExists[Vehicle ID] = true;
        mapping(uint256 => uint256[]) vehServicingIdsCompleted; // vehServicingIdsCompleted[Vehicle ID] => uint256[] servicing ids
        address workshopOwnerAddress; // Workshop owner address
        bool exists; // To check whether exists
    }

    struct InsuranceCo {
        bytes32 companyName; // NTUC Income Insurance Co-Operative Ltd.
        bytes32 regNo; // S97CS0162D
        bytes32 physicalAddress; // 75 Bras Basah Rd, Income Centre, Singapore 189557
        uint256 contact; // 67881777
        uint256[] vehicleIdsHandled; // Array of vehicle IDs handled (E.g. 1, 5, 10, ...)
        mapping(uint256 => uint256[]) vehAccidentIdsHandled; // vehAccidentIdsHandled[Vehicle ID] => uint256[] accident ids
        bytes32 dateOfReg; // 3 April 1986
        address insuranceCoAddress; // Insurance company owner address
        bool exists; // To check whether exists
    }

    struct Administrator {
        bytes32 adminName; // Rebecca Lim
        bytes32 dateJoined; // 21 February 2021
        uint256 contact; // 97774302
        bool exists; // To check whether exists
    }

    // ---------------------------- Mappings ---------------------------- //

    mapping(address => OwnerDealer) ownersDealers;
    mapping(address => Workshop) workshops;
    mapping(address => InsuranceCo) insuranceCos;
    mapping(address => Administrator) admins;

    // ----------------------- OpenZeppelin Counters ----------------------- //

    using Counters for Counters.Counter;
    Counters.Counter private _numOfOwnersDealers;
    Counters.Counter private _numOfWorkshops;
    Counters.Counter private _numOfInsuranceCos;
    Counters.Counter private _numOfAdmins;

    // ---------------------------- Events ---------------------------- //

    // Owner / Dealer events
    event ownerDealerRegistered(
        address ownerDealerAddress,
        bytes32 name,
        uint256 contact,
        bytes32 companyRegNo,
        bytes32 physicalAddress,
        bytes32 dateOfReg,
        bool isDealer
    );
    // event ownerDealerRegistered (address ownerDealerAddress);
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

    // Insurance company events
    event insuranceCoRegistered(address insuranceCoAddress);
    event insuranceCoInfoRetrieved(address insuranceCoAddress);
    event insuranceCoInfoUpdated(address insuranceCoAddress);
    event insuranceCoRemoved(address insuranceCoAddress);
    event vehicleIdsByInsuranceCo(address insuranceCoAddress);
    event accidentRecordsOnVehicleByInsuranceCo(address insuranceCoAddress);

    // Administrator events
    event adminRegistered(address registeredAddress);
    event adminInfoRetrieved(
        address adminAddress,
        bytes32 adminName,
        bytes32 dateJoined,
        uint256 contact
    );
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

    // Consignment events
    event consignmentApproved(
        uint256 vehicleId,
        address authorizer,
        address authorizedAddress
    );
    event consignmentPartyInfoRetrieved(
        uint256 vehicleId,
        address authorizer,
        address approvedAddress
    );
    event consignmentRemoved(uint256 vehicleId, address authorizer);

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

    // event vehicleTransferInitiated(
    //     uint256 vehicleId,
    //     address currentOwnerAddress,
    //     address newOwnerAddress
    // );
    // event vehicleTransferAccepted(
    //     uint256 vehicleId,
    //     address currentOwnerAddress,
    //     address newOwnerAddress
    // );

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

    modifier onlyInsuranceCo() {
        require(
            _insuranceCo.has(msg.sender),
            "Address Invalid: Not registered as insurance company"
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

    modifier ownerDealerExists(address _ownerDealerAddress) {
        require(
            ownersDealers[_ownerDealerAddress].exists,
            "Invalid Address: Owner/Dealer address does not exists in the registry"
        );
        _;
    }

    modifier workshopExists(address _workshopAddress) {
        require(
            workshops[_workshopAddress].exists,
            "Invalid Address: Workshop address does not exists in the registry"
        );
        _;
    }

    modifier insuranceCoExists(address _insuranceCoAddress) {
        require(
            insuranceCos[_insuranceCoAddress].exists,
            "Invalid Address: Insurance company address does not exists in the registry"
        );
        _;
    }

    modifier adminExists(address _adminAddress) {
        require(
            admins[_adminAddress].exists,
            "Invalid Address: Administrator address does not exists in the registry"
        );
        _;
    }

    // TODO: Remove
    modifier addressIsAuthorized(
        uint256 _vehicleId,
        address _authorizer,
        address _authorizedAddress
    ) {
        require(
            ownersDealers[_authorizer].isAuthorized[_vehicleId][
                _authorizedAddress
            ],
            "Address has not been authorized by authorizer for the vehicle id"
        );
        _;
    }

    modifier vehicleExists(uint256 _vehicleId) {
        require(
            vehicleContract.doesVehicleExists(_vehicleId),
            "Vehicle ID Invalid: Vehicle does not exists"
        );
        _;
    }

    modifier onlyOwnerAndAdmin(uint256 _vehicleId, address _validAddress) {
        require(
            _administrator.has(_validAddress) ||
                isVehicleOwnedBy(_vehicleId, _validAddress),
            "Only vehicle owner or administrator can access this function"
        );
        _;
    }

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
     * Comments:
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

        // Register address
        _ownerDealer.add(_ownerDealerAddress);

        OwnerDealer memory newOwnerDealer =
            OwnerDealer(
                _name,
                _contact,
                _companyRegNo,
                _physicalAddress,
                _isDealer,
                0, // number of vehicles own
                _dateOfReg,
                // vehicleIdIndex[0] = 0; [No need to declare mapping here]
                new uint256[](0), // [Empty array of 0 length] vehicleIds[]
                // ownsVehicle[Vehicle ID] = true (Owns that vehicle id) [No need to declare mapping here]
                // noOfAuthorizedParties[Vehicle ID] = 0 [No need to declare mapping here]
                // authorizedParties[Vehicle ID] = address[] [No need to declare mapping here]
                // isAuthorized[Vehicle ID][address(0x0)] = false; [No need to declare mapping here]
                // vehicleIdToTransferIndex[Vehicle ID] = Transfer array index
                new uint256[](0), // [Empty array of 0 length] vehicleIdsToTransfer[]
                // vehicleIdToAcceptIndex[Vehicle ID] = Accept array index
                new uint256[](0), // [Empty array of 0 length] vehicleIdsToAccept[]
                true
            );

        ownersDealers[_ownerDealerAddress] = newOwnerDealer;

        // Increment counter
        _numOfOwnersDealers.increment();

        emit ownerDealerRegistered(
            _ownerDealerAddress,
            newOwnerDealer.name,
            newOwnerDealer.contact,
            newOwnerDealer.companyRegNo,
            newOwnerDealer.physicalAddress,
            newOwnerDealer.dateOfReg,
            newOwnerDealer.isDealer
        );

        return true;
    }

    /**
     * Function 2: Retrieve owner or dealer information
     * Comments: Separate 'authorized parties' and 'vehicles owned' retrieval function
     * Roles:
     */
    function retrieveOwnerDealerInfo(address _ownerDealerAddress)
        public
        ownerDealerExists(_ownerDealerAddress)
        returns (
            bytes32,
            uint256,
            bytes32,
            bytes32,
            bytes32,
            bool
        )
    {
        // uint256 _noOfVehiclesOwn = ownersDealers[_ownerDealerAddress].noOfVehiclesOwn;

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
     */
    function updateOwnerDealerInfo(
        address _ownerDealerAddress,
        bytes32 _name,
        uint256 _contact,
        bytes32 _companyRegNo,
        bytes32 _physicalAddress,
        bytes32 _dateOfReg
    ) public ownerDealerExists(_ownerDealerAddress) returns (bool) {
        require(
            msg.sender == _ownerDealerAddress || _administrator.has(msg.sender),
            "Only the owner or admin can update the information"
        );

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
     * Comments: Only remove dealer while owner records will remain on the system,
     * Comments 2: as it removes the need to register the owner yet again when he buys a new car
     */
    function removeDealer(address _dealerAddress)
        public
        ownerDealerExists(_dealerAddress)
        onlyAdmin
        returns (bool)
    {
        // Update fields
        ownersDealers[_dealerAddress].exists = false;

        // Remove access right as owner/dealer
        _ownerDealer.remove(_dealerAddress);

        // emit event
        emit ownerDealerRemoved(_dealerAddress);

        return true;
    }

    /**
     * Function 5: Register workshop
     * Comments:
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

        // Register address
        _workshop.add(_workshopAddress);

        Workshop memory newWorkshop =
            Workshop(
                _workshopName,
                _workshopRegNo,
                _physicalAddress,
                _contact,
                _dateOfReg,
                new uint256[](0), // [Empty array of 0 length] vehicleIdsWorkedOn[]
                // vehIdsWorkedOnExists[Vehicle ID] => bool (True means the vehicle has been worked on previously)
                // vehServicingIdsCompleted[Vehicle ID] => uint256[] servicing ids [Mapping not declared]
                _workshopAddress,
                true
            );

        workshops[_workshopAddress] = newWorkshop;

        // Increment counter
        _numOfWorkshops.increment();

        emit workshopRegistered(_workshopAddress);

        return true;
    }

    /**
     * Function 6: Retrieve workshop information
     * Comments: Separate 'servicing ID' retrieval function
     */
    function retrieveWorkshopInfo(address _workshopAddress)
        public
        workshopExists(_workshopAddress)
        returns (
            bytes32,
            bytes32,
            bytes32,
            uint256,
            bytes32
        )
    {
        // emit event
        emit workshopInfoRetrieved(_workshopAddress);

        return (
            workshops[_workshopAddress].workshopName,
            workshops[_workshopAddress].workshopRegNo,
            workshops[_workshopAddress].physicalAddress,
            workshops[_workshopAddress].contact,
            workshops[_workshopAddress].dateOfReg
        );
    }

    /**
     * Function 7: Update workshop information
     * Comments: Separate 'servicing id' update function
     */
    function updateWorkshopInfo(
        address _workshopAddress,
        bytes32 _workshopName,
        bytes32 _workshopRegNo,
        bytes32 _physicalAddress,
        uint256 _contact,
        bytes32 _dateOfReg
    ) public workshopExists(_workshopAddress) returns (bool) {
        require(
            msg.sender == _workshopAddress || _administrator.has(msg.sender),
            "Only the workshop or admin can update the information"
        );

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
     */
    function removeWorkshop(address _workshopAddress)
        public
        workshopExists(_workshopAddress)
        onlyAdmin
        returns (bool)
    {
        // Update fields
        workshops[_workshopAddress].exists = false;

        // Remove access right as workshop
        _workshop.remove(_workshopAddress);

        // emit event
        emit workshopRemoved(_workshopAddress);

        return true;
    }

    /**
     * Function 9: Register insurance company
     * Comments:
     */
    function registerInsuranceCo(
        address _insuranceCoAddress,
        bytes32 _companyName,
        bytes32 _regNo,
        bytes32 _physicalAddress,
        uint256 _contact,
        bytes32 _dateOfReg
    ) public onlyAdmin returns (bool) {
        require(
            !_insuranceCo.has(_insuranceCoAddress),
            "Address already registered as insurance company"
        );

        // Register address
        _insuranceCo.add(_insuranceCoAddress);

        InsuranceCo memory newInsuranceCo =
            InsuranceCo(
                _companyName,
                _regNo,
                _physicalAddress,
                _contact,
                new uint256[](0), // [Empty array of 0 length] -Handled[]
                _dateOfReg,
                _insuranceCoAddress,
                // vehAccidentIdsHandled[Vehicle ID] => uint256[] servicing ids [Mapping not declared]
                true
            );

        insuranceCos[_insuranceCoAddress] = newInsuranceCo;

        // Increment counter
        _numOfInsuranceCos.increment();

        emit insuranceCoRegistered(_insuranceCoAddress);

        return true;
    }

    /**
     * Function 10: Retrieve insurance company information
     * Comments: Separate 'accident ID' retrieval function
     */
    function retrieveInsuranceCoInfo(address _insuranceCoAddress)
        public
        insuranceCoExists(_insuranceCoAddress)
        returns (
            bytes32,
            bytes32,
            bytes32,
            uint256,
            bytes32
        )
    {
        // emit event
        emit insuranceCoInfoRetrieved(_insuranceCoAddress);

        return (
            insuranceCos[_insuranceCoAddress].companyName,
            insuranceCos[_insuranceCoAddress].regNo,
            insuranceCos[_insuranceCoAddress].physicalAddress,
            insuranceCos[_insuranceCoAddress].contact,
            insuranceCos[_insuranceCoAddress].dateOfReg
        );
    }

    /**
     * Function 11: Update insurance company information
     * Comments: Separate 'accident id' update function
     */
    function updateInsuranceCoInfo(
        address _insuranceCoAddress,
        bytes32 _companyName,
        bytes32 _regNo,
        bytes32 _physicalAddress,
        uint256 _contact,
        bytes32 _dateOfReg
    ) public insuranceCoExists(_insuranceCoAddress) returns (bool) {
        require(
            msg.sender == _insuranceCoAddress || _administrator.has(msg.sender),
            "Only the insurance company or admin can update the information"
        );

        // Update fields
        insuranceCos[_insuranceCoAddress].companyName = _companyName;
        insuranceCos[_insuranceCoAddress].regNo = _regNo;
        insuranceCos[_insuranceCoAddress].physicalAddress = _physicalAddress;
        insuranceCos[_insuranceCoAddress].contact = _contact;
        insuranceCos[_insuranceCoAddress].dateOfReg = _dateOfReg;

        // emit event
        emit insuranceCoInfoUpdated(_insuranceCoAddress);

        return true;
    }

    /**
     * Function 12: Remove insurance company
     * Comments:
     */
    function removeInsuranceCo(address _insuranceCoAddress)
        public
        insuranceCoExists(_insuranceCoAddress)
        onlyAdmin
        returns (bool)
    {
        // Update fields
        insuranceCos[_insuranceCoAddress].exists = false;

        // Remove access right as insurance company
        _insuranceCo.remove(_insuranceCoAddress);

        // emit event
        emit insuranceCoRemoved(_insuranceCoAddress);

        return true;
    }

    /**
     * Function 13: Register administrator
     * Comments: Only owner can grant admin right to address
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

        // Register address
        _administrator.add(_adminAddress);

        Administrator memory newAdministrator =
            Administrator(_adminName, _dateJoined, _contact, true);

        admins[_adminAddress] = newAdministrator;

        // Increment counter
        _numOfAdmins.increment();

        emit adminRegistered(_adminAddress);

        return true;
    }

    /**
     * Function 14: Retrieve administrator information
     * Comments:
     */
    function retrieveAdminInfo(address _adminAddress)
        public
        adminExists(_adminAddress)
        onlyAdmin
        returns (
            bytes32,
            bytes32,
            uint256
        )
    {
        bytes32 _adminName = admins[_adminAddress].adminName;
        bytes32 _dateJoined = admins[_adminAddress].dateJoined;
        uint256 _contact = admins[_adminAddress].contact;

        // emit event
        emit adminInfoRetrieved(
            _adminAddress,
            _adminName,
            _dateJoined,
            _contact
        );

        return (_adminName, _dateJoined, _contact);
    }

    /**
     * Function 11: Update administrator information
     * Comments:
     */
    function updateAdminInfo(
        address _adminAddress,
        bytes32 _adminName,
        bytes32 _dateJoined,
        uint256 _contact
    ) public adminExists(_adminAddress) returns (bool) {
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
     */
    function removeAdmin(address _adminAddress)
        public
        adminExists(_adminAddress)
        onlyOwner
        returns (bool)
    {
        // Update fields
        admins[_adminAddress].exists = false;

        // Remove access right as admin
        _administrator.remove(_adminAddress);

        // emit event
        emit adminRemoved(_adminAddress);

        return true;
    }

    /**
     * Function 13: Authorize access to other party
     * Comments: Authorize to access functions like retrieve vehicle registration details, servicing history, and accident history
     */
    function authorizeAccess(
        uint256 _vehicleId,
        address _authorizer,
        address _authorizedAddress
    ) public ownerDealerExists(_authorizer) onlyOwnerDealer returns (bool) {
        // Check that the vehicle belongs to authorizer
        require(
            isVehicleOwnedBy(_vehicleId, _authorizer),
            "Authorizer does not have ownership rights over the vehicle ID"
        );

        // Update fields
        ownersDealers[_authorizer].authorizedPartyIndex[_vehicleId][
            _authorizedAddress
        ] = ownersDealers[_authorizer].noOfAuthorizedParties[_vehicleId]; // 0
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
     */
    function retrieveAuthorizedAddresses(
        uint256 _vehicleId,
        address _ownerDealerAddress
    )
        public
        ownerDealerExists(_ownerDealerAddress)
        onlyOwnerDealer
        returns (uint256, address[] memory)
    {
        // Check that the vehicle belongs to owner/dealer
        require(
            isVehicleOwnedBy(_vehicleId, _ownerDealerAddress),
            "Owner/Dealer does not have ownership rights over the vehicle ID"
        );

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
     */
    function removeAuthorization(
        uint256 _vehicleId,
        address _authorizer,
        address _authorizedAddress
    ) public ownerDealerExists(_authorizer) onlyOwnerDealer returns (bool) {
        // Check that the vehicle belongs to authorizer
        require(
            isVehicleOwnedBy(_vehicleId, _authorizer),
            "Authorizer does not have ownership rights over the vehicle ID"
        );

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
     * Function 16: Approve consignment to conduct sale of the vehicle on behalf of the owner
     * Comments: ERC721 limits only 1 approved address per token at a given time
     */
    function approveConsignment(
        uint256 _vehicleId,
        address _authorizer,
        address _authorizedAddress
    ) public ownerDealerExists(_authorizer) onlyOwnerDealer returns (bool) {
        // Check that the vehicle belongs to authorizer
        require(
            isVehicleOwnedBy(_vehicleId, _authorizer),
            "Authorizer does not have ownership rights over the vehicle ID"
        );

        // ERC721: approve(address to, uint256 tokenId)
        vehicleContract.approve(_authorizedAddress, _vehicleId);

        // Emit event
        emit consignmentApproved(_vehicleId, _authorizer, _authorizedAddress);

        return true;
    }

    /**
     * Function 17: Retrieve consignment approved seller or dealer information
     * Comments:
     */
    function retrieveConsignmentPartyInfo(
        uint256 _vehicleId,
        address _authorizer
    )
        public
        ownerDealerExists(_authorizer)
        onlyOwnerDealer
        returns (
            address,
            bytes32,
            uint256,
            bytes32,
            bytes32,
            bool
        )
    {
        // Check that the vehicle belongs to authorizer
        require(
            isVehicleOwnedBy(_vehicleId, _authorizer),
            "Authorizer does not have ownership rights over the vehicle ID"
        );

        address _approvedAddress = vehicleContract.getApproved(_vehicleId);

        // emit event
        emit consignmentPartyInfoRetrieved(
            _vehicleId,
            _authorizer,
            _approvedAddress
        );

        return (
            _approvedAddress,
            ownersDealers[_approvedAddress].name,
            ownersDealers[_approvedAddress].contact,
            ownersDealers[_approvedAddress].companyRegNo,
            ownersDealers[_approvedAddress].physicalAddress,
            ownersDealers[_approvedAddress].isDealer
        );
    }

    /**
     * Function 18: Remove consignment to conduct sale of the vehicle on behalf of the owner
     * Comments:
     */
    function removeConsignment(uint256 _vehicleId, address _authorizer)
        public
        ownerDealerExists(_authorizer)
        onlyOwnerDealer
        returns (bool)
    {
        // Check that the vehicle belongs to authorizer
        require(
            isVehicleOwnedBy(_vehicleId, _authorizer),
            "Authorizer does not have ownership rights over the vehicle ID"
        );

        // ERC721: approve(address to, uint256 tokenId)
        vehicleContract.removeApproval(_vehicleId);

        // Emit event
        emit consignmentRemoved(_vehicleId, _authorizer);

        return true;
    }

    /**
     * Function 19: Retrieve all vehicles owned by owner / dealer
     * Comments:
     */
    function retrieveAllVehiclesOwn(address _ownerDealerAddress)
        public
        ownerDealerExists(_ownerDealerAddress)
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
     * Function 20: Retrieve all servicing records on vehicle id
     * Comments: Only admin, owner, & approved addresses
     */
    function retrieveAllServicingRecordsOn(uint256 _vehicleId)
        public
        vehicleExists(_vehicleId)
        returns (uint256[] memory servicingRecords)
    {
        // Retrieve owner address
        address _ownerDealerAddress =
            vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

        // Only admin, owner, & approved addresses
        require(
            _administrator.has(msg.sender) ||
                isVehicleOwnedBy(_vehicleId, msg.sender) ||
                isAddressAuthorized(
                    _vehicleId,
                    _ownerDealerAddress,
                    msg.sender
                ),
            "Only administrator or vehicle owner or authorized parties can retrieve the servicing records"
        );

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
     * Function 22: Retrieve all accident records on vehicle id
     * Comments:
     * Roles: Only admin, owner, workshop and authorized parties
     */
    function retrieveAllAccidentRecordsOn(uint256 _vehicleId)
        public
        vehicleExists(_vehicleId)
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (uint256[] memory accidentRecords)
    {
        // Retrieve owner address
        // address _ownerDealerAddress =
        //     vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

        // Added workshop into the access right
        // require(
        //     _administrator.has(msg.sender) ||
        //         isVehicleOwnedBy(_vehicleId, msg.sender) ||
        //         isAddressAuthorized(
        //             _vehicleId,
        //             _ownerDealerAddress,
        //             msg.sender
        //         ),
        //     "Only administrator or vehicle owner or authorized parties can retrieve the accident records"
        // );

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
     * Function 23: Retrieve all vehicle ids done by workshop
     * Comments: Retrieve all vehicle ids serviced by workshop
     */
    function retrieveAllVehIdsServicedBy(address _workshopAddress)
        public
        workshopExists(_workshopAddress)
        returns (uint256[] memory)
    {
        // Only workshop and admin can access
        require(
            _administrator.has(msg.sender) ||
                isWorkshopOwner(_workshopAddress, msg.sender),
            "Only administrator or workshop owner can retrieve the vehicle ids serviced by workshop"
        );

        // Emit event
        emit vehicleIdsByWorkshop(_workshopAddress);

        return workshops[_workshopAddress].vehicleIdsWorkedOn;
    }

    /**
     * Function 24: Retrieve all servicing records done by workshop
     * Comments: Retrieve all servicing ids on vehicle id by workshop
     */
    function retrieveVehServicingRecordsBy(
        address _workshopAddress,
        uint256 _vehicleId
    ) public workshopExists(_workshopAddress) returns (uint256[] memory) {
        // Only workshop and admin can access
        require(
            _administrator.has(msg.sender) ||
                isWorkshopOwner(_workshopAddress, msg.sender),
            "Only administrator or workshop owner can retrieve the servicing records on vehicle by workshop"
        );

        // Emit event
        emit servicingRecordsOnVehicleByWorkshop(_workshopAddress);

        return workshops[_workshopAddress].vehServicingIdsCompleted[_vehicleId];
    }

    /**
     * Function 25: Retrieve all vehicle ids handled by insurance company
     * Comments:
     */
    // function retrieveAllVehIdsInsuredBy(address _insuranceCoAddress)
    //     public
    //     insuranceCoExists(_insuranceCoAddress)
    //     returns (uint256[] memory)
    // {
    //     // Only insurance company and admin can access
    //     require(
    //         _administrator.has(msg.sender) ||
    //             isInsuranceCoOwner(_insuranceCoAddress, msg.sender),
    //         "Only administrator or insurance company owner can retrieve the vehicle ids handled by insurance company"
    //     );

    //     // Emit event
    //     emit vehicleIdsByInsuranceCo(_insuranceCoAddress);

    //     return insuranceCos[_insuranceCoAddress].vehicleIdsHandled;
    // }

    /**
     * Function 26: Retrieve all accident records handled by insurance company
     * Comments:
     */
    // function retrieveVehAccidentRecordsBy(
    //     address _insuranceCoAddress,
    //     uint256 _vehicleId
    // ) public insuranceCoExists(_insuranceCoAddress) returns (uint256[] memory) {
    //     // Only workshop and admin can access
    //     require(
    //         _administrator.has(msg.sender) ||
    //             isInsuranceCoOwner(_insuranceCoAddress, msg.sender),
    //         "Only administrator or insurance company owner can retrieve the accident records on vehicle handled by insurance company"
    //     );

    //     // Emit event
    //     emit accidentRecordsOnVehicleByInsuranceCo(_insuranceCoAddress);

    //     return
    //         insuranceCos[_insuranceCoAddress].vehAccidentIdsHandled[_vehicleId];
    // }

    /**
     * Function 27: Transfer vehicle to the new owner
     * Comments: Integrated initiate and accept
     * Comments 2: Assumption: All dealers will be registered, hence unregistered buyer is just a normal person
     */
    function transferVehicle(
        uint256 _vehicleId,
        address _newOwnerAddress,
        bytes32 _newOwnerName, // Omitted unless buyer is an unregistered owner
        uint256 _newOwnerContact, // Omitted unless buyer is an unregistered owner
        bytes32 _newOwnerPhysicalAddress, // Omitted unless buyer is an unregistered owner
        bytes32 _newOwnerDateOfReg // Omitted unless buyer is an unregistered owner
    ) public vehicleExists(_vehicleId) returns (bool) {
        // Only owner can transfer
        require(
            isVehicleOwnedBy(_vehicleId, msg.sender),
            "Only vehicle owner can transfer the vehicle ownership"
        );

        // Check if buyer is already registered as a owner, if not register buyer
        if (!_ownerDealer.has(_newOwnerAddress)) {
            registerNewOwner(
                _newOwnerAddress, 
                _newOwnerName, 
                _newOwnerContact, 
                _newOwnerPhysicalAddress, 
                _newOwnerDateOfReg);
        }

        // Retrieve current owner address
        address _currentOwnerAddress =
            vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

        // ------- Updates to Vehicle.sol ------- //

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

        // ------- Updates to VehicleRegistry.sol ------- //

        // Remove vehicle from current owner
        removeVehicleIdFromVehiclesArray(_currentOwnerAddress, _vehicleId); // Updates vehicleIdIndex & vehicleIds
        ownersDealers[_currentOwnerAddress].noOfVehiclesOwn--;
        ownersDealers[_currentOwnerAddress].ownsVehicle[_vehicleId] = false;

        // Add vehicle to new owner
        addVehicleIdIntoVehiclesArray(_newOwnerAddress, _vehicleId);
        ownersDealers[_newOwnerAddress].noOfVehiclesOwn++;
        ownersDealers[_newOwnerAddress].ownsVehicle[_vehicleId] = true;

        // Emit event
        emit vehicleTransferCompleted(
            _vehicleId,
            _currentOwnerAddress,
            _newOwnerAddress
        );

        return true;
    }

    /**
     * Function 27: Initiate transfer of vehicle to the new owner
     * Comments: Has to be accepted by the new owner using 'acceptTransfer' function
     */
    // function initiateTransfer(
    //     uint256 _vehicleId,
    //     address _newOwnerAddress,
    //     bytes32 _newOwnerName,
    //     uint256 _newOwnerContact,
    //     bytes32 _newOwnerCompanyRegNo,
    //     bytes32 _newOwnerPhysicalAddress,
    //     bytes32 _newOwnerDateOfReg,
    //     bool _isDealer
    // ) public vehicleExists(_vehicleId) returns (bool) {
    //     // Only owner and approved party can transfer the vehicle OR vehicleContract._isApprovedOrOwner(spender, tokenId);
    //     require(
    //         isVehicleOwnedBy(_vehicleId, msg.sender) ||
    //             isAddressApprovedConsignment(_vehicleId, msg.sender),
    //         "Only vehicle owner or approved party can initiate the vehicle ownership transfer"
    //     );

    //     // Check if buyer is already registered as a owner, if not register buyer
    //     if (!_ownerDealer.has(_newOwnerAddress)) {
    //         // Add the buyer to owner / dealer database
    //         _ownerDealer.add(_newOwnerAddress);

    //         OwnerDealer memory newOwnerDealer =
    //             OwnerDealer(
    //                 _newOwnerName,
    //                 _newOwnerContact,
    //                 _newOwnerCompanyRegNo,
    //                 _newOwnerPhysicalAddress,
    //                 _isDealer,
    //                 0,
    //                 _newOwnerDateOfReg,
    //                 new uint256[](0),
    //                 new uint256[](0),
    //                 new uint256[](0),
    //                 true
    //             );

    //         ownersDealers[_newOwnerAddress] = newOwnerDealer;
    //         _numOfOwnersDealers.increment();
    //     }

    //     // Retrieve owner address [Needed as the seller (msg.sender) can be the consignment seller and not the owner]
    //     address _currentOwnerAddress =
    //         vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

    //     // Update seller vehicle to transfer list
    //     ownersDealers[_currentOwnerAddress].vehicleIdsToTransfer.push(
    //         _vehicleId
    //     );

    //     // Update buyer vehicle to accept list
    //     ownersDealers[_newOwnerAddress].vehicleIdsToAccept.push(_vehicleId);

    //     // Emit event
    //     emit vehicleTransferInitiated(
    //         _vehicleId,
    //         _currentOwnerAddress,
    //         _newOwnerAddress
    //     );

    //     return true;
    // }

    /**
     * Function 28: Accept transfer of vehicle by buyer
     * Comments:
     */
    // function acceptTransfer(uint256 _vehicleId)
    //     public
    //     vehicleExists(_vehicleId)
    //     returns (bool)
    // {
    //     address _newOwnerAddress = msg.sender;

    //     // Check that the msg.sender is the intended new owner
    //     require(
    //         isTheIntendedNewOwner(_vehicleId, _newOwnerAddress),
    //         "Only the intended new vehicle owner can accept the transfer"
    //     );

    //     address _currentOwnerAddress =
    //         vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

    //     // ------- Updates to Vehicle.sol ------- //

    //     // Transfer ERC721 Vehicle token
    //     vehicleContract.transferFrom(
    //         _currentOwnerAddress,
    //         _newOwnerAddress,
    //         _vehicleId
    //     );

    //     // transferVehicleUpdate function
    //     vehicleContract.transferVehicleUpdate(
    //         _vehicleId,
    //         ownersDealers[_newOwnerAddress].name,
    //         ownersDealers[_newOwnerAddress].contact,
    //         ownersDealers[_newOwnerAddress].physicalAddress,
    //         _newOwnerAddress
    //     );

    //     // updateOwnerDetails function carried out within transferVehicleUpdate

    //     // ------- Updates to VehicleRegistry.sol ------- //

    //     // Remove vehicle from current owner
    //     removeVehicleIdFromVehiclesArray(_currentOwnerAddress, _vehicleId); // Updates vehicleIdIndex & vehicleIds
    //     ownersDealers[_currentOwnerAddress].noOfVehiclesOwn--;
    //     ownersDealers[_currentOwnerAddress].ownsVehicle[_vehicleId] = false;
    //     removeVehicleIdFromTransferArray(_currentOwnerAddress, _vehicleId); // Updates vehicleIdToTransferIndex & vehicleIdsToTransfer

    //     // Add vehicle to new owner
    //     addVehicleIdIntoVehiclesArray(_newOwnerAddress, _vehicleId);
    //     ownersDealers[_newOwnerAddress].noOfVehiclesOwn++;
    //     ownersDealers[_newOwnerAddress].ownsVehicle[_vehicleId] = true;
    //     removeVehicleIdFromAcceptArray(_newOwnerAddress, _vehicleId);

    //     // Emit event
    //     emit vehicleTransferAccepted(
    //         _vehicleId,
    //         _currentOwnerAddress,
    //         _newOwnerAddress
    //     );

    //     return true;
    // }

    // ---------------------------- Functions from Vehicle.sol with Role-Based Access Control ---------------------------- //

    /**
     * Function 29: Register vehicle info 1 to owner
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
            "Please register the owner first before registering the vehicle"
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
     * Function 30: Register vehicle info 2 to owner
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
        registerNewOwnerDetailsToVehicle(_newVehId, _noOfTransfers, _ownerDealerAddress);

        // Emit event
        emit vehicleRegistration2Completed(_newVehId, _ownerDealerAddress);

        return _newVehId;
    }

    /**
     * Function 31: Retrieve registered vehicle details 1
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

        // return vehicleContract.retrieveVehInfo1(_vehicleId);

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
     * Function 32: Retrieve registered vehicle details 1 Part 2
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

        // (_omv, _originalRegDate, _effectiveRegDate) = vehicleContract.retrieveVehInfo1Part2(_vehicleId);
        // return (_omv, _originalRegDate, _effectiveRegDate);

        return vehicleContract.retrieveVehInfo1Part2(_vehicleId);
    }

    /**
     * Function 33: Retrieve registered vehicle details 1
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
     * Function 34: Update vehicle registration details
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
     * Function 35: Update registered vehicle license plate no
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
     * Function 36: Swap license plate
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
     * Function 37: Deregister vehicle
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
     * Function 38: Retrieve no. of transfers
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
     * Function 39: Retrieve ownership history
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
     * Function 39: Update owner details
     * Comments: Updates Vehicle.sol's owner details and not VehicleRegistry.sol's owner details
     * Comments2: Moved to helper function to integrate with updateOwnerDealerInfo()
     * Allowed Roles: Owner, Admin
     */
    // function updateVehOwnerDetails(
    //     uint256 _vehicleId,
    //     bytes32 _ownerName,
    //     uint256 _ownerContact,
    //     bytes32 _ownerPhysicalAddress)
    //     public onlyOwnerAndAdmin(_vehicleId, msg.sender) returns (bool) {

    //         // Emit event omitted since vehicleContract already has event emitted

    //         return vehicleContract.updateOwnerDetails(_vehicleId, _ownerName, _ownerContact, _ownerPhysicalAddress);
    // }

    /**
     * Function 40: Add servicing record
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

        // Add to owner's servicingIds (archived)
        // address _ownerDealerAddress = vehicleContract.getCurrentVehOwnerAddress(_vehicleId);

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
     * Function 42: Retrieve number of servicing records for vehicle id
     * Comments: To facilitate the next function: retrieveServicingHistory
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
     * Function 43: Retrieve servicing history 1
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop, Authorized Parties
     */
    function retrieveServicingHistory1(uint256 _vehicleId, uint256 _servicingId)
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

        // Vehicle.sol's retrieveServicingHistory1
        return vehicleContract.retrieveServHistory1(_vehicleId, _servicingId);
    }

    /**
     * Function 44: Retrieve servicing history 2
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop, Authorized Parties
     */
    function retrieveServicingHistory2(uint256 _vehicleId, uint256 _servicingId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (bytes32 typeOfWorkDone, bytes32 totalCharges)
    {
        // Emit event omitted since vehicleContract already has event emitted
        return vehicleContract.retrieveServHistory2(_vehicleId, _servicingId);
    }

    /**
     * Function 45: Add accident record
     * Comments:
     * Allowed Roles: Insurance Company
     */
    function addAccidentRecord(
        uint256 _vehicleId,
        bytes32 _accidentDateLocation,
        bytes32 _driverName,
        bytes32 _timeOfAccident,
        bytes32 _descriptionOfAccident
    )
        public
        // bytes32 _insuranceCoName, // Archived
        // bytes32 _appointedWorkshopRegNo,
        // uint256 _servicingId,
        // bytes32 _remarks
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
                // _insuranceCoName, // archived
                // _appointedWorkshopRegNo, // added under addServicingRec
                // _servicingId, // added under addServicingRec
                // _remarks // added under addServicingRec
            );

        // ------- VehicleRegistry.sol ------ //

        // Add to insurance company's vehicleIdsWorkedOn & vehServicingIdsCompleted
        // insuranceCos[msg.sender].vehicleIdsHandled.push(_vehicleId);
        // insuranceCos[msg.sender].vehAccidentIdsHandled[_vehicleId].push(
        //     _newAccidentId
        // );

        // vehAccidentIds[_vehicleId].push(_newAccidentId);

        return _newAccidentId;
    }

    /**
     * Function 46: Update accident claim status
     * Comments:
     * Allowed Roles: Insurance Company
     */
    // function updateAccidentClaimStatus(uint256 _vehicleId, uint256 _accidentId)
    //     public
    //     onlyInsuranceCo
    //     returns (bool)
    // {
    //     // Emit event omitted since vehicleContract already has event emitted

    //     return vehicleContract.updateClaimStatus(_vehicleId, _accidentId);
    // }

    /**
     * Function 47: Retrieve number of accident records for vehicle id
     * Comments: To facilitate the next function: retrieveAccidentHistory
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
     * Function 48: Retrieve accident history part 1
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop & Authorized Parties
     */
    function retrieveAccidentHistory1(uint256 _vehicleId, uint256 _accidentId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (
            bytes32 accidentDateLocation,
            bytes32 driverName,
            bytes32 timeOfAccident,
            bytes32 descriptionOfAccident
        )
    // bytes32 _insuranceCoName
    {
        // Emit event omitted since vehicleContract already has event emitted

        // Vehicle.sol's retrieveServicingHistory1
        (
            accidentDateLocation,
            driverName,
            timeOfAccident,
            descriptionOfAccident
            // _insuranceCoName
        ) = vehicleContract.getAccidentHistory1(_vehicleId, _accidentId);

        return (
            accidentDateLocation,
            driverName,
            timeOfAccident,
            descriptionOfAccident
        );
    }

    /**
     * Function 49: Retrieve accident history part 2
     * Comments:
     * Allowed Roles: Admin, Owner, Workshop & Authorized Parties
     */
    function retrieveAccidentHistory2(uint256 _vehicleId, uint256 _accidentId)
        public
        onlyAllAuthorizedRoles(_vehicleId, msg.sender)
        returns (
            bytes32 appointedWorkshopNo,
            uint256 servicingId,
            bytes32 remarks
        )
    // bool claimIssued // Archived
    {
        // Emit event omitted since vehicleContract already has event emitted

        (
            appointedWorkshopNo,
            servicingId,
            remarks
            // _claimIssued // Archived
        ) = vehicleContract.getAccidentHistory2(_vehicleId, _accidentId);

        return (appointedWorkshopNo, servicingId, remarks);
    }

    /**
     * Function 50: Retrieve number of vehicles own by owner
     * Comments: To facilitate the next function: retrieveServicingHistory
     * Allowed Roles: Admin, Owner
     */
    function retrieveNoOfVehiclesOwnBy(address _ownerDealerAddress)
        public
        returns (uint256 _noOfVehiclesOwn)
    {
        require(
            _administrator.has(msg.sender) || _ownerDealerAddress == msg.sender,
            "Only the owner or administrator can access this function"
        );

        // Retrieve from Vehicle.sol
        _noOfVehiclesOwn = ownersDealers[_ownerDealerAddress].noOfVehiclesOwn;

        // Emit event
        emit noOfVehiclesOwnRetrieved(_noOfVehiclesOwn);

        return _noOfVehiclesOwn;
    }

    /**
     * Function 50: Check if address is a registered owner
     * Comments: To facilitate vehicle transfer
     * Allowed Roles: Admin, Owner
     */
    function isAddressRegisteredOwner(address _address) public view returns (bool) {

        // Only admin or owner
        require(_ownerDealer.has(msg.sender) || _administrator.has(msg.sender),
            "Only registered owners or admins can access this function");

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

    // Helper function to remove a vehicle id to transfer from the array
    // function removeVehicleIdFromTransferArray(
    //     address ownerDealer,
    //     uint256 vehicleId
    // ) internal returns (bool) {
    //     uint256 index =
    //         ownersDealers[ownerDealer].vehicleIdToTransferIndex[vehicleId];
    //     uint256 vehicleIdsLength =
    //         ownersDealers[ownerDealer].vehicleIdsToTransfer.length;

    //     // if (index >= ownersDealers[ownerDealer].vehicleIds.length) return false;
    //     require(index >= vehicleIdsLength, "Index does not exists");

    //     // Loop and move items behind index to the front by 1 index
    //     for (uint256 i = index; i < vehicleIdsLength - 1; i++) {
    //         // Update vehicleIdToTransferIndex after current index to point 1 index ahead
    //         ownersDealers[ownerDealer].vehicleIdToTransferIndex[i + 1] = i;

    //         // Update array pointing the current index to the next index
    //         ownersDealers[ownerDealer].vehicleIdsToTransfer[i] = ownersDealers[
    //             ownerDealer
    //         ]
    //             .vehicleIdsToTransfer[i + 1];
    //     }

    //     // Decreasing the length of the array
    //     ownersDealers[ownerDealer].vehicleIdsToTransfer.length--;

    //     return true;
    // }

    // Helper function to remove a vehicle id to accept from the array
    // function removeVehicleIdFromAcceptArray(
    //     address ownerDealer,
    //     uint256 vehicleId
    // ) internal returns (bool) {
    //     uint256 index =
    //         ownersDealers[ownerDealer].vehicleIdToAcceptIndex[vehicleId];
    //     uint256 vehicleIdsLength =
    //         ownersDealers[ownerDealer].vehicleIdsToAccept.length;

    //     // if (index >= ownersDealers[ownerDealer].vehicleIds.length) return false;
    //     require(index >= vehicleIdsLength, "Index does not exists");

    //     // Loop and move items behind index to the front by 1 index
    //     for (uint256 i = index; i < vehicleIdsLength - 1; i++) {
    //         // Update vehicleIdToAcceptIndex after current index to point 1 index ahead
    //         ownersDealers[ownerDealer].vehicleIdToAcceptIndex[i + 1] = i;

    //         // Update array pointing the current index to the next index
    //         ownersDealers[ownerDealer].vehicleIdsToAccept[i] = ownersDealers[
    //             ownerDealer
    //         ]
    //             .vehicleIdsToAccept[i + 1];
    //     }

    //     // Decreasing the length of the array
    //     ownersDealers[ownerDealer].vehicleIdsToAccept.length--;

    //     return true;
    // }

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
        // ---- Changed to reduce gas ---- //

        // bool isVehicleOwned;
        // uint256 vehicleIdsLength = ownersDealers[_ownerDealerAddress].vehicleIds.length;

        // for (uint i = 0; i < vehicleIdsLength; i++) {
        //     if (ownersDealers[_ownerDealerAddress].vehicleIds[i] == _vehicleId) {
        //         isVehicleOwned = true;
        //     }
        // }

        // return isVehicleOwned;

        // Can use vehicleContract._isApprovedOrOwner(spender, tokenId) or vehicleContract.ownerOf(tokenId)

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

    /** Check that the address is the workshop owner
     *  Comments: 'msg.sender' into '_insuranceCoOwnerAddress'
     */

    function isWorkshopOwner(
        address _workshopAddress,
        address _workshopOwnerAddress
    ) public view returns (bool) {
        return
            workshops[_workshopAddress].workshopOwnerAddress ==
            _workshopOwnerAddress;
    }

    /** Check that the address is the insurance company owner
     *  Comments: 'msg.sender' into '_insuranceCoOwnerAddress'
     */

    // function isInsuranceCoOwner(
    //     address _insuranceCoAddress,
    //     address _insuranceCoOwnerAddress
    // ) public view returns (bool) {
    //     return
    //         insuranceCos[_insuranceCoAddress].insuranceCoAddress ==
    //         _insuranceCoOwnerAddress;
    // }

    // Check that the address is approved to sell on consignment
    // function isAddressApprovedConsignment(
    //     uint256 _vehicleId,
    //     address _approvedAddress
    // ) public view returns (bool) {
    //     return vehicleContract.getApproved(_vehicleId) == _approvedAddress;
    // }

    // Check the the address is the intended new vehicle owner
    // function isTheIntendedNewOwner(
    //     uint256 _vehicleId,
    //     address _intendedNewOwner
    // ) public view returns (bool) {
    //     bool isIntendedOwner;
    //     uint256 vehiclesToAcceptLength =
    //         ownersDealers[_intendedNewOwner].vehicleIdsToAccept.length;

    //     for (uint256 i; i < vehiclesToAcceptLength; i++) {
    //         if (
    //             ownersDealers[_intendedNewOwner].vehicleIdsToAccept[i] ==
    //             _vehicleId
    //         ) {
    //             isIntendedOwner = true;
    //         }
    //     }

    //     return isIntendedOwner;
    // }

    // Retrieve the role of the address
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
        } else if (_insuranceCo.has(_address)) {
            roleName = "Insurance Company";
        } else if (_administrator.has(_address)) {
            roleName = "Administrator";
        }

        return roleName;
    }

    // Update the owner info for all the vehicles the owner owns
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

    // Convert string to bytes32
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
                new uint256[](0),
                new uint256[](0),
                true
            );

        ownersDealers[_newOwnerAddress] = newOwnerDealer;
        _numOfOwnersDealers.increment();

        return true;
    }

    // Helper function to register new owner details to vehicle
    function registerNewOwnerDetailsToVehicle(uint256 _vehicleId, uint256 _ownerId, address _ownerDealerAddress) internal returns (bool) {

        // Update new owner details to vehicle
        bool ownerDetailsRegistered = vehicleContract.registerNewOwnerDetails(
            _vehicleId, 
            _ownerId, // ownerId = noOfTransfers
            ownersDealers[_ownerDealerAddress].name,
            ownersDealers[_ownerDealerAddress].contact,
            ownersDealers[_ownerDealerAddress].physicalAddress,
            _ownerDealerAddress // address
        );

        return ownerDetailsRegistered;

    }

    // Check whether ERC721 token exists
    function doesTokenExists(uint256 tokenId) public view returns (bool) {
        return vehicleContract.doesERC721TokenExists(tokenId);
    }

    // Testing methods
    function getNoOfOwnersDealers() public view returns (uint256) {
        return _numOfOwnersDealers.current();
    }

    function getNoOfWorkshops() public view returns (uint256) {
        return _numOfWorkshops.current();
    }

    function getNoOfInsuranceCo() public view returns (uint256) {
        return _numOfInsuranceCos.current();
    }

    function getNoOfAdmins() public view returns (uint256) {
        return _numOfAdmins.current();
    }
}
