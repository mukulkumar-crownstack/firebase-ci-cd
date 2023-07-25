export enum LeadStatus {
  SHOWN_INTEREST = 'shown_interest',
  APPLIED = 'applied',
  VERIFIED = 'verified',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  QUESTIONNAIRE_ANSWERED = 'questionnaire_answered',
  COMPANY_BACKGROUND_CHECKED = 'company_background_checked',
  BACKGROUND_CHECK = 'background_check',
  COMPANY_BACKGROUND_CHECK = 'company_background_check',
  BACKGROUND_CHECKED = 'background_checked',
  DRIVER_BACKGROUND_CHECKED = 'driver_background_checked',
  ONBOARDING_DOCUMENTS_CHECKED = 'onboarding_documents_checked',
  PR_ACCOUNT_SETUP = 'pr_account_setup',
}

export enum ApplicationStatus {
  STAND_BY = 'stand_by',
  UNDER_REVIEW = 'under_review',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  CONFIRMED = 'confirmed',
  RESUMBIT = 'resubmit',
  IN_PROGRESS = 'in_progress',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  ACCEPTED = 'accepted',
  // STAND_BY = 'stand_by',
  // REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum Driver_Type_Code {
  independent_driver = 'independent_driver',
  owner_operator = 'owner_operator',
  fleet_operator = 'fleet_operator',
  cliente_independiente = 'cliente_independiente',
  flotilleros = 'flotilleros',
  persona_moral = 'persona_moral'
}

export enum US_Driver_Types {
  independent_driver = 'Independent Driver',
  owner_operator = 'Owner Operator',
  fleet_operator = 'Fleet Operator',
}

export enum MX_Driver_Types {
  cliente_independiente = 'Cliente Independiente',
  flotilleros = 'Flotilleros',
  persona_moral = 'Persona Moral'
}

export enum VehicleTypes {
  '16-ft-box-truck' = '16 ft Box Truck',
  '16-ft-box-truck-with-lift' = '16 ft Box Truck with Lift Gate',
  '20-ft-box-truck-with-lift' = '20 ft Box Truck with Lift Gate',
  '24-ft-box-truck-with-lift' = '24 ft Box Truck with Lift Gate',
  '26-ft-box-truck' = '26 ft Box Truck',
  '26-ft-box-truck-with-lift' = '26 ft Box Truck with Lift Gate',
  '26-ft-flatbed-truck' = '26 ft Flatbed Truck',
  'cargo-van' = 'Cargo Van',
  'sprinter-van' = 'Sprinter Van',
  'mini-van' = 'Mini Van',
  'pickup-truck' = 'Pickup Truck',
  'camion-1_5-ton' = 'Camión 1.5 ton',
  'camion-3_5-ton' = 'Camión 3.5 ton',
  'camion-48-pies' = 'Camión 48 pies',
  'camion-5-ton' = 'Camión 5 ton',
  'camion-53-pies' = 'Camión 53 pies',
  'camion-8-ton' = 'Camión 8 ton',
  'camioneta' = 'Camioneta',
  'car' = 'Car',
  'moto' = 'Moto',
  'suv' = 'SUV',
  'van' = 'Van',
}

export enum US_Vehicle_Types {
  '16-feet-box-truck' = '16 ft Box Truck',
  '16-feet-box-truck-with-lift' = '16 ft Box Truck with Lift Gate',
  '20-feet-box-truck-with-lift' = '20 ft Box Truck with Lift Gate',
  '24-feet-box-truck-with-lift' = '24 ft Box Truck with Lift Gate',
  '26-feet-box-truck' = '26 ft Box Truck',
  '26-feet-box-truck-with-lift' = '26 ft Box Truck with Lift Gate',
  '26-feet-flatbed-truck' = '26 ft Flatbed Truck',
  'cargo-van' = 'Cargo Van',
  'sprinter-van' = 'Sprinter Van',
  'mini-van' = 'Mini Van',
  'truck-pickup' = 'Pickup Truck',
  'suv' = 'SUV',
  'car' = 'Car',
}

export enum MX_Vehicle_Types {
  '1.5-ton-closed-truck' = 'Camión 1.5 ton',
  '3.5-ton-closed-truck' = 'Camión 3.5 ton',
  'camion-48-pies' = 'Camión 48 pies',
  'camion-5-ton-closed-truck' = 'Camión 5 ton',
  'camion-53-pies' = 'Camión 53 pies',
  '5-ton-closed-truck' = 'Camión 8 ton',
  'truck-box' = 'Camioneta',
  'car' = 'Auto',
  'bike' = 'Moto',
  'suv' = 'SUV',
  'van' = 'Van',
}
