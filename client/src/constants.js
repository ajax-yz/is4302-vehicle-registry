export const allRoles = [
  "Administrator",
  "Dealer",
  "Owner",
  "Workshop",
  "Insurance Company",
];

export const ROLES_ENUM = {
  ADMINISTRATOR: "Administrator",
  DEALER: "Dealer",
  OWNER: "Owner",
  WORKSHOP: "Workshop",
  INSURANCE: "Insurance Company",
};

export const ownerColumns = [
  "ownerDealerAddress",
  "name",
  "contact",
  "companyRegNo",
  "physicalAddress",
  "dateOfReg",
  "isDealer",
];
export const vehicleColumns = {
  details1: [
    "vehicleNo",
    "makeModel",
    "manufacturingYear",
    "engineNo",
    "chassisNo",
  ],
  details1p2: ["omv", "originalRegDate", "effectiveRegDate"],
  details2: ["noOfTransfers", "engineCap", "coeCat", "quotaPrem", "ownerName"],
  ownerAddress: ["ownerAddress"],
};

export const accidentColumns = {
  accident1: [
    "accidentDateLocation",
    "driverName",
    "timeOfAccident",
    "descriptionOfAccident",
    "insuranceCoName",
  ],
  accident2: ["appointedWorkshopNo", "servicingId", "remarks", "claimIssued"],
};

export const servicingColumns = {
  history1: [
    "dateCompleted",
    "workshopRegNo",
    "appointedMechanic",
    "currentMileage",
    "workDone",
  ],
  history2: ["typeOfWorkDone", "totalCharges", "acknowledgedByOwner"],
};

export const adminColumns = [
  "adminAddress",
  "adminName",
  "dateJoined",
  "contact",
];
