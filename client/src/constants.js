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

export const ownerDefaultValues = [
  "",
  "Owner",
  93312133,
  "CoReg1",
  "Block 801 Marina Bay Gardens",
  "01-08-20",
  "",
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
export const defaultVehicleValues = [
  "GT2122C",
  "Nissan",
  2015,
  "Engine2",
  "ChasisNum2051",
  10,
  "01-03-2016",
  "01-03-2016",
  0,
  "1052",
  "Light Weight",
  50000,
  "Owner",
];
export const accidentColumns = {
  accident1: [
    "accidentDateLocation",
    "driverName",
    "timeOfAccident",
    "descriptionOfAccident",
  ],
  accident2: ["appointedWorkshopNo", "servicingId", "remarks"],
};
export const defaultAccidentValues = [
  "Yishun Avenue 5",
  "Dickson",
  "01:02am",
  "A red color Mercedes car",
  "",
  "",
  "NA",
];
export const servicingColumns = {
  history1: [
    "dateCompleted",
    "workshopRegNo",
    "appointedMechanic",
    "currentMileage",
    "workDone",
  ],
  history2: ["typeOfWorkDone", "totalCharges"],
};

export const defaultServicingValues = [
  "",
  "12-12-2020",
  "WorkReg",
  "Workshop",
  9114,
  "Replaced brake",
  "Maintenance",
  "130",
];

export const adminColumns = [
  "adminAddress",
  "adminName",
  "dateJoined",
  "contact",
];

export const adminDefaultValues = ["", "Admin", "01-10-2019", 93340129];

export const workshopColumns = [
  "workshopAddress",
  "workshopName",
  "workshopRegNo",
  "physicalAddress",
  "contact",
  "dateOfReg",
];

export const defaultWorkshopColumns = [
  "",
  "Workshop",
  "WorkReg",
  "Blockk 31 Geylang Bahru",
  93178271,
  "02-03-20",
];
