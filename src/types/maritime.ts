export type VesselStatus = 'active' | 'sailing' | 'docking' | 'berthed';

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  type: 'Container Ship' | 'Bulk Carrier' | 'Oil Tanker' | 'General Cargo' | 'Tug & Barge' | 'Passenger / Ferry';
  capacityDwt: number; // Deadweight Tonnage
  capacityTeu: number; // Twenty-foot Equivalent Units
  yearBuilt: number;
  flag: string;
  status: VesselStatus;
  currentPort: string;
  updatedAt: string;
  createdBy: string;
}

export type PortStatus = 'open' | 'congested' | 'maintenance';

export interface Port {
  id: string;
  code: string; // e.g. IDTPP, IDSUB, IDMAK, IDBTM
  name: string;
  city: string;
  country: string;
  berthsCount: number;
  maxDraft: number; // meters
  status: PortStatus;
  updatedAt: string;
  createdBy: string;
}

export type CrewStatus = 'on_duty' | 'on_leave' | 'standby';

export interface Crew {
  id: string;
  name: string;
  rank: 'Nahkoda (Master)' | 'Chief Officer' | 'Chief Engineer' | '2nd Officer' | '2nd Engineer' | 'Bosun' | 'Able Seaman';
  seamanBookNumber: string;
  licenseNumber: string;
  assignedVesselId: string;
  assignedVesselName: string;
  phone: string;
  status: CrewStatus;
  updatedAt: string;
  createdBy: string;
}

export type VoyageStatus = 'scheduled' | 'in_transit' | 'berthed' | 'completed' | 'delayed';

export interface Voyage {
  id: string;
  voyageNumber: string; // e.g. VYG-2026-001
  vesselId: string;
  vesselName: string;
  originPortId: string;
  originPortName: string;
  destinationPortId: string;
  destinationPortName: string;
  etd: string; // Estimated Time of Departure
  eta: string; // Estimated Time of Arrival
  status: VoyageStatus;
  cargoLoadPercent: number;
  fuelConsumptionLiters: number;
  currentCoordinates: string; // e.g. "05°45'S 106°55'E (Laut Jawa)"
  captainName: string;
  updatedAt: string;
  createdBy: string;
}

export type CargoType = 'Dry Container 20ft' | 'Dry Container 40ft' | 'Reefer Container' | 'Breakbulk / Curah' | 'Liquid / BBM';
export type BookingStatus = 'draft' | 'confirmed' | 'loading' | 'on_board' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'credit';

export interface Booking {
  id: string;
  blNumber: string; // Bill of Lading No
  voyageId: string;
  voyageNumber: string;
  shipperName: string; // Pengirim
  consigneeName: string; // Penerima
  cargoType: CargoType;
  containerCount: number;
  grossWeightTons: number;
  freightPriceIdr: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  updatedAt: string;
  createdBy: string;
}

export type SeaworthinessStatus = 'laik_laut' | 'dalam_inspeksi' | 'ditahan';

export interface Clearance {
  id: string;
  spbNumber: string; // No. Surat Perintah Berlayar
  voyageId: string;
  voyageNumber: string;
  vesselName: string;
  ksopAuthority: string; // e.g. "Kantor Kesyahbandaran dan Otoritas Pelabuhan Kelas I Tanjung Priok"
  issueDate: string;
  seaworthinessStatus: SeaworthinessStatus;
  inspectorNotes: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  module: 'Vessels' | 'Ports' | 'Crew' | 'Voyages' | 'Bookings' | 'Clearances';
  targetTitle: string;
  userEmail: string;
  timestamp: string;
}

export type UserRole = 'super_admin' | 'ops_manager' | 'dispatcher' | 'finance';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}
