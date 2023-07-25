"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MX_Vehicle_Types = exports.US_Vehicle_Types = exports.VehicleTypes = exports.MX_Driver_Types = exports.US_Driver_Types = exports.Driver_Type_Code = exports.InterviewStatus = exports.ApplicationStatus = exports.LeadStatus = void 0;
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["SHOWN_INTEREST"] = "shown_interest";
    LeadStatus["APPLIED"] = "applied";
    LeadStatus["VERIFIED"] = "verified";
    LeadStatus["INTERVIEW_SCHEDULED"] = "interview_scheduled";
    LeadStatus["QUESTIONNAIRE_ANSWERED"] = "questionnaire_answered";
    LeadStatus["COMPANY_BACKGROUND_CHECKED"] = "company_background_checked";
    LeadStatus["BACKGROUND_CHECK"] = "background_check";
    LeadStatus["COMPANY_BACKGROUND_CHECK"] = "company_background_check";
    LeadStatus["BACKGROUND_CHECKED"] = "background_checked";
    LeadStatus["DRIVER_BACKGROUND_CHECKED"] = "driver_background_checked";
    LeadStatus["ONBOARDING_DOCUMENTS_CHECKED"] = "onboarding_documents_checked";
    LeadStatus["PR_ACCOUNT_SETUP"] = "pr_account_setup";
})(LeadStatus = exports.LeadStatus || (exports.LeadStatus = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["STAND_BY"] = "stand_by";
    ApplicationStatus["UNDER_REVIEW"] = "under_review";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["CONFIRMED"] = "confirmed";
    ApplicationStatus["RESUMBIT"] = "resubmit";
    ApplicationStatus["IN_PROGRESS"] = "in_progress";
})(ApplicationStatus = exports.ApplicationStatus || (exports.ApplicationStatus = {}));
var InterviewStatus;
(function (InterviewStatus) {
    InterviewStatus["SCHEDULED"] = "scheduled";
    InterviewStatus["ACCEPTED"] = "accepted";
    // STAND_BY = 'stand_by',
    // REJECTED = 'rejected',
    InterviewStatus["CANCELLED"] = "cancelled";
})(InterviewStatus = exports.InterviewStatus || (exports.InterviewStatus = {}));
var Driver_Type_Code;
(function (Driver_Type_Code) {
    Driver_Type_Code["independent_driver"] = "independent_driver";
    Driver_Type_Code["owner_operator"] = "owner_operator";
    Driver_Type_Code["fleet_operator"] = "fleet_operator";
    Driver_Type_Code["cliente_independiente"] = "cliente_independiente";
    Driver_Type_Code["flotilleros"] = "flotilleros";
    Driver_Type_Code["persona_moral"] = "persona_moral";
})(Driver_Type_Code = exports.Driver_Type_Code || (exports.Driver_Type_Code = {}));
var US_Driver_Types;
(function (US_Driver_Types) {
    US_Driver_Types["independent_driver"] = "Independent Driver";
    US_Driver_Types["owner_operator"] = "Owner Operator";
    US_Driver_Types["fleet_operator"] = "Fleet Operator";
})(US_Driver_Types = exports.US_Driver_Types || (exports.US_Driver_Types = {}));
var MX_Driver_Types;
(function (MX_Driver_Types) {
    MX_Driver_Types["cliente_independiente"] = "Cliente Independiente";
    MX_Driver_Types["flotilleros"] = "Flotilleros";
    MX_Driver_Types["persona_moral"] = "Persona Moral";
})(MX_Driver_Types = exports.MX_Driver_Types || (exports.MX_Driver_Types = {}));
var VehicleTypes;
(function (VehicleTypes) {
    VehicleTypes["16-ft-box-truck"] = "16 ft Box Truck";
    VehicleTypes["16-ft-box-truck-with-lift"] = "16 ft Box Truck with Lift Gate";
    VehicleTypes["20-ft-box-truck-with-lift"] = "20 ft Box Truck with Lift Gate";
    VehicleTypes["24-ft-box-truck-with-lift"] = "24 ft Box Truck with Lift Gate";
    VehicleTypes["26-ft-box-truck"] = "26 ft Box Truck";
    VehicleTypes["26-ft-box-truck-with-lift"] = "26 ft Box Truck with Lift Gate";
    VehicleTypes["26-ft-flatbed-truck"] = "26 ft Flatbed Truck";
    VehicleTypes["cargo-van"] = "Cargo Van";
    VehicleTypes["sprinter-van"] = "Sprinter Van";
    VehicleTypes["mini-van"] = "Mini Van";
    VehicleTypes["pickup-truck"] = "Pickup Truck";
    VehicleTypes["camion-1_5-ton"] = "Cami\u00F3n 1.5 ton";
    VehicleTypes["camion-3_5-ton"] = "Cami\u00F3n 3.5 ton";
    VehicleTypes["camion-48-pies"] = "Cami\u00F3n 48 pies";
    VehicleTypes["camion-5-ton"] = "Cami\u00F3n 5 ton";
    VehicleTypes["camion-53-pies"] = "Cami\u00F3n 53 pies";
    VehicleTypes["camion-8-ton"] = "Cami\u00F3n 8 ton";
    VehicleTypes["camioneta"] = "Camioneta";
    VehicleTypes["car"] = "Car";
    VehicleTypes["moto"] = "Moto";
    VehicleTypes["suv"] = "SUV";
    VehicleTypes["van"] = "Van";
})(VehicleTypes = exports.VehicleTypes || (exports.VehicleTypes = {}));
var US_Vehicle_Types;
(function (US_Vehicle_Types) {
    US_Vehicle_Types["16-feet-box-truck"] = "16 ft Box Truck";
    US_Vehicle_Types["16-feet-box-truck-with-lift"] = "16 ft Box Truck with Lift Gate";
    US_Vehicle_Types["20-feet-box-truck-with-lift"] = "20 ft Box Truck with Lift Gate";
    US_Vehicle_Types["24-feet-box-truck-with-lift"] = "24 ft Box Truck with Lift Gate";
    US_Vehicle_Types["26-feet-box-truck"] = "26 ft Box Truck";
    US_Vehicle_Types["26-feet-box-truck-with-lift"] = "26 ft Box Truck with Lift Gate";
    US_Vehicle_Types["26-feet-flatbed-truck"] = "26 ft Flatbed Truck";
    US_Vehicle_Types["cargo-van"] = "Cargo Van";
    US_Vehicle_Types["sprinter-van"] = "Sprinter Van";
    US_Vehicle_Types["mini-van"] = "Mini Van";
    US_Vehicle_Types["truck-pickup"] = "Pickup Truck";
    US_Vehicle_Types["suv"] = "SUV";
    US_Vehicle_Types["car"] = "Car";
})(US_Vehicle_Types = exports.US_Vehicle_Types || (exports.US_Vehicle_Types = {}));
var MX_Vehicle_Types;
(function (MX_Vehicle_Types) {
    MX_Vehicle_Types["1.5-ton-closed-truck"] = "Cami\u00F3n 1.5 ton";
    MX_Vehicle_Types["3.5-ton-closed-truck"] = "Cami\u00F3n 3.5 ton";
    MX_Vehicle_Types["camion-48-pies"] = "Cami\u00F3n 48 pies";
    MX_Vehicle_Types["camion-5-ton-closed-truck"] = "Cami\u00F3n 5 ton";
    MX_Vehicle_Types["camion-53-pies"] = "Cami\u00F3n 53 pies";
    MX_Vehicle_Types["5-ton-closed-truck"] = "Cami\u00F3n 8 ton";
    MX_Vehicle_Types["truck-box"] = "Camioneta";
    MX_Vehicle_Types["car"] = "Auto";
    MX_Vehicle_Types["bike"] = "Moto";
    MX_Vehicle_Types["suv"] = "SUV";
    MX_Vehicle_Types["van"] = "Van";
})(MX_Vehicle_Types = exports.MX_Vehicle_Types || (exports.MX_Vehicle_Types = {}));
//# sourceMappingURL=enums.js.map