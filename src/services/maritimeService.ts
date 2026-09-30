import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  Vessel,
  Port,
  Crew,
  Voyage,
  Booking,
  Clearance,
  AuditLog,
} from '../types/maritime';

// ----------------- AUDIT LOGS (Realtime Activity) -----------------
export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
      callback(logs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'audit_logs');
    }
  );
}

export async function logActivity(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  module: 'Vessels' | 'Ports' | 'Crew' | 'Voyages' | 'Bookings' | 'Clearances',
  targetTitle: string,
  userEmail: string
) {
  try {
    const id = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const data: AuditLog = {
      id,
      action,
      module,
      targetTitle: targetTitle.substring(0, 150),
      userEmail: userEmail || 'system@maritimx.co.id',
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'audit_logs', id), data);
  } catch (err) {
    console.warn('Could not write audit log:', err);
  }
}

// ----------------- MASTER DATA: VESSELS (KAPAL) -----------------
export function subscribeVessels(callback: (vessels: Vessel[]) => void): () => void {
  const colRef = collection(db, 'vessels');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Vessel));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'vessels');
    }
  );
}

export async function saveVessel(vessel: Omit<Vessel, 'id'>, id?: string, userEmail = 'admin'): Promise<string> {
  const targetId = id || 'ves_' + Date.now();
  const data: Vessel = {
    ...vessel,
    id: targetId,
    updatedAt: new Date().toISOString(),
    createdBy: vessel.createdBy || userEmail,
  };
  try {
    await setDoc(doc(db, 'vessels', targetId), data);
    await logActivity(id ? 'UPDATE' : 'CREATE', 'Vessels', `Kapal: ${data.name} (${data.imoNumber})`, userEmail);
    return targetId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `vessels/${targetId}`);
    return '';
  }
}

export async function deleteVessel(id: string, vesselName: string, userEmail = 'admin'): Promise<void> {
  try {
    await deleteDoc(doc(db, 'vessels', id));
    await logActivity('DELETE', 'Vessels', `Hapus Kapal: ${vesselName}`, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vessels/${id}`);
  }
}

// ----------------- MASTER DATA: PORTS (PELABUHAN) -----------------
export function subscribePorts(callback: (ports: Port[]) => void): () => void {
  const colRef = collection(db, 'ports');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Port));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'ports');
    }
  );
}

export async function savePort(port: Omit<Port, 'id'>, id?: string, userEmail = 'admin'): Promise<string> {
  const targetId = id || 'port_' + Date.now();
  const data: Port = {
    ...port,
    id: targetId,
    updatedAt: new Date().toISOString(),
    createdBy: port.createdBy || userEmail,
  };
  try {
    await setDoc(doc(db, 'ports', targetId), data);
    await logActivity(id ? 'UPDATE' : 'CREATE', 'Ports', `Pelabuhan: ${data.name} [${data.code}]`, userEmail);
    return targetId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `ports/${targetId}`);
    return '';
  }
}

export async function deletePort(id: string, portName: string, userEmail = 'admin'): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ports', id));
    await logActivity('DELETE', 'Ports', `Hapus Pelabuhan: ${portName}`, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `ports/${id}`);
  }
}

// ----------------- MASTER DATA: CREW (KRU & NAHKODA) -----------------
export function subscribeCrew(callback: (crew: Crew[]) => void): () => void {
  const colRef = collection(db, 'crew');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Crew));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'crew');
    }
  );
}

export async function saveCrew(crewMember: Omit<Crew, 'id'>, id?: string, userEmail = 'admin'): Promise<string> {
  const targetId = id || 'crew_' + Date.now();
  const data: Crew = {
    ...crewMember,
    id: targetId,
    updatedAt: new Date().toISOString(),
    createdBy: crewMember.createdBy || userEmail,
  };
  try {
    await setDoc(doc(db, 'crew', targetId), data);
    await logActivity(id ? 'UPDATE' : 'CREATE', 'Crew', `Kru: ${data.name} (${data.rank})`, userEmail);
    return targetId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `crew/${targetId}`);
    return '';
  }
}

export async function deleteCrew(id: string, crewName: string, userEmail = 'admin'): Promise<void> {
  try {
    await deleteDoc(doc(db, 'crew', id));
    await logActivity('DELETE', 'Crew', `Hapus Kru: ${crewName}`, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `crew/${id}`);
  }
}

// ----------------- TRANSAKSI: VOYAGES (JADWAL BERLAYAR) -----------------
export function subscribeVoyages(callback: (voyages: Voyage[]) => void): () => void {
  const colRef = collection(db, 'voyages');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Voyage));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'voyages');
    }
  );
}

export async function saveVoyage(voyage: Omit<Voyage, 'id'>, id?: string, userEmail = 'admin'): Promise<string> {
  const targetId = id || 'voy_' + Date.now();
  const data: Voyage = {
    ...voyage,
    id: targetId,
    updatedAt: new Date().toISOString(),
    createdBy: voyage.createdBy || userEmail,
  };
  try {
    await setDoc(doc(db, 'voyages', targetId), data);
    await logActivity(id ? 'UPDATE' : 'CREATE', 'Voyages', `Voyage ${data.voyageNumber}: ${data.originPortName} ➔ ${data.destinationPortName}`, userEmail);
    return targetId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `voyages/${targetId}`);
    return '';
  }
}

export async function deleteVoyage(id: string, voyageNumber: string, userEmail = 'admin'): Promise<void> {
  try {
    await deleteDoc(doc(db, 'voyages', id));
    await logActivity('DELETE', 'Voyages', `Hapus Voyage: ${voyageNumber}`, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `voyages/${id}`);
  }
}

// ----------------- TRANSAKSI: BOOKINGS (MANIFEST KARGO / B/L) -----------------
export function subscribeBookings(callback: (bookings: Booking[]) => void): () => void {
  const colRef = collection(db, 'bookings');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
    }
  );
}

export async function saveBooking(booking: Omit<Booking, 'id'>, id?: string, userEmail = 'admin'): Promise<string> {
  const targetId = id || 'bk_' + Date.now();
  const data: Booking = {
    ...booking,
    id: targetId,
    updatedAt: new Date().toISOString(),
    createdBy: booking.createdBy || userEmail,
  };
  try {
    await setDoc(doc(db, 'bookings', targetId), data);
    await logActivity(id ? 'UPDATE' : 'CREATE', 'Bookings', `B/L ${data.blNumber} - ${data.shipperName} (${data.grossWeightTons} Ton)`, userEmail);
    return targetId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bookings/${targetId}`);
    return '';
  }
}

export async function deleteBooking(id: string, blNumber: string, userEmail = 'admin'): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bookings', id));
    await logActivity('DELETE', 'Bookings', `Hapus Booking B/L: ${blNumber}`, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
  }
}

// ----------------- TRANSAKSI: CLEARANCES (SPB KSOP) -----------------
export function subscribeClearances(callback: (clearances: Clearance[]) => void): () => void {
  const colRef = collection(db, 'clearances');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Clearance));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'clearances');
    }
  );
}

export async function saveClearance(clearance: Omit<Clearance, 'id'>, id?: string, userEmail = 'admin'): Promise<string> {
  const targetId = id || 'clr_' + Date.now();
  const data: Clearance = {
    ...clearance,
    id: targetId,
    updatedAt: new Date().toISOString(),
    createdBy: clearance.createdBy || userEmail,
  };
  try {
    await setDoc(doc(db, 'clearances', targetId), data);
    await logActivity(id ? 'UPDATE' : 'CREATE', 'Clearances', `SPB ${data.spbNumber} untuk ${data.vesselName}`, userEmail);
    return targetId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `clearances/${targetId}`);
    return '';
  }
}

export async function deleteClearance(id: string, spbNumber: string, userEmail = 'admin'): Promise<void> {
  try {
    await deleteDoc(doc(db, 'clearances', id));
    await logActivity('DELETE', 'Clearances', `Hapus SPB: ${spbNumber}`, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clearances/${id}`);
  }
}

// ----------------- SEED INITIAL INDONESIAN MARITIME DATA -----------------
export async function seedInitialDataIfEmpty(userEmail = 'admin@pelayaran-maritimx.co.id'): Promise<boolean> {
  try {
    const vesselSnap = await getDocs(collection(db, 'vessels'));
    if (!vesselSnap.empty) {
      return false; // already seeded
    }

    console.log('Seeding initial Indonesian maritime data into Firestore...');

    // 1. Initial Vessels
    const sampleVessels: Omit<Vessel, 'id'>[] = [
      {
        name: 'KM Samudera Nusantara 01',
        imoNumber: 'IMO 9482103',
        type: 'Container Ship',
        capacityDwt: 28500,
        capacityTeu: 1850,
        yearBuilt: 2018,
        flag: 'Indonesia',
        status: 'sailing',
        currentPort: 'Tanjung Priok, Jakarta',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'KM Baruna Perkasa',
        imoNumber: 'IMO 9320844',
        type: 'Bulk Carrier',
        capacityDwt: 52000,
        capacityTeu: 0,
        yearBuilt: 2015,
        flag: 'Indonesia',
        status: 'active',
        currentPort: 'Tanjung Perak, Surabaya',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'MT Tirta Energi',
        imoNumber: 'IMO 9619420',
        type: 'Oil Tanker',
        capacityDwt: 35000,
        capacityTeu: 0,
        yearBuilt: 2020,
        flag: 'Indonesia',
        status: 'berthed',
        currentPort: 'Batu Ampar, Batam',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'TB Bintang Samudera IX & BG Bahari 330',
        imoNumber: 'IMO 8831092',
        type: 'Tug & Barge',
        capacityDwt: 8500,
        capacityTeu: 350,
        yearBuilt: 2019,
        flag: 'Indonesia',
        status: 'active',
        currentPort: 'Soekarno Hatta, Makassar',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'KM Jayakarta Raya',
        imoNumber: 'IMO 9127650',
        type: 'General Cargo',
        capacityDwt: 14200,
        capacityTeu: 750,
        yearBuilt: 2012,
        flag: 'Indonesia',
        status: 'docking',
        currentPort: 'Belawan, Medan',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
    ];

    for (const v of sampleVessels) {
      await saveVessel(v, undefined, userEmail);
    }

    // 2. Initial Ports
    const samplePorts: Omit<Port, 'id'>[] = [
      {
        code: 'IDTPP',
        name: 'Pelabuhan Tanjung Priok (IPC Port of Jakarta)',
        city: 'Jakarta Utara, DKI Jakarta',
        country: 'Indonesia',
        berthsCount: 28,
        maxDraft: 14.5,
        status: 'open',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        code: 'IDSUB',
        name: 'Pelabuhan Tanjung Perak',
        city: 'Surabaya, Jawa Timur',
        country: 'Indonesia',
        berthsCount: 22,
        maxDraft: 12.0,
        status: 'open',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        code: 'IDMAK',
        name: 'Pelabuhan Soekarno-Hatta Makassar',
        city: 'Makassar, Sulawesi Selatan',
        country: 'Indonesia',
        berthsCount: 16,
        maxDraft: 11.5,
        status: 'open',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        code: 'IDBLW',
        name: 'Pelabuhan Belawan',
        city: 'Medan, Sumatera Utara',
        country: 'Indonesia',
        berthsCount: 18,
        maxDraft: 11.0,
        status: 'open',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        code: 'IDBTM',
        name: 'Pelabuhan Batu Ampar',
        city: 'Batam, Kepulauan Riau',
        country: 'Indonesia',
        berthsCount: 12,
        maxDraft: 13.0,
        status: 'congested',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
    ];

    for (const p of samplePorts) {
      await savePort(p, undefined, userEmail);
    }

    // 3. Initial Crew
    const sampleCrew: Omit<Crew, 'id'>[] = [
      {
        name: 'Capt. Hendra Gunawan, M.Mar',
        rank: 'Nahkoda (Master)',
        seamanBookNumber: 'B.094821-JKT',
        licenseNumber: 'ANT-I / 2012 / 8820',
        assignedVesselId: 'ves_sample_1',
        assignedVesselName: 'KM Samudera Nusantara 01',
        phone: '+62 812-9844-3100',
        status: 'on_duty',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'Budi Santoso, S.T., M.Mar.E',
        rank: 'Chief Engineer',
        seamanBookNumber: 'B.041289-SBY',
        licenseNumber: 'ATT-I / 2014 / 7611',
        assignedVesselId: 'ves_sample_1',
        assignedVesselName: 'KM Samudera Nusantara 01',
        phone: '+62 813-2280-9941',
        status: 'on_duty',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'Capt. Rian Firmansyah',
        rank: 'Nahkoda (Master)',
        seamanBookNumber: 'B.078412-MKS',
        licenseNumber: 'ANT-II / 2016 / 4490',
        assignedVesselId: 'ves_sample_2',
        assignedVesselName: 'KM Baruna Perkasa',
        phone: '+62 852-7714-3829',
        status: 'on_duty',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        name: 'Ahmad Fauzi',
        rank: 'Chief Officer',
        seamanBookNumber: 'B.099124-BTM',
        licenseNumber: 'ANT-II / 2018 / 6530',
        assignedVesselId: 'ves_sample_3',
        assignedVesselName: 'MT Tirta Energi',
        phone: '+62 821-6650-4491',
        status: 'standby',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
    ];

    for (const c of sampleCrew) {
      await saveCrew(c, undefined, userEmail);
    }

    // 4. Initial Voyages
    const sampleVoyages: Omit<Voyage, 'id'>[] = [
      {
        voyageNumber: 'VYG-2026-042',
        vesselId: 'ves_1',
        vesselName: 'KM Samudera Nusantara 01',
        originPortId: 'port_1',
        originPortName: 'Tanjung Priok, Jakarta (IDTPP)',
        destinationPortId: 'port_3',
        destinationPortName: 'Makassar (IDMAK)',
        etd: '2026-10-01T08:00',
        eta: '2026-10-04T16:00',
        status: 'in_transit',
        cargoLoadPercent: 92,
        fuelConsumptionLiters: 48500,
        currentCoordinates: '05°18\'S 112°45\'E (Perairan Laut Jawa)',
        captainName: 'Capt. Hendra Gunawan, M.Mar',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        voyageNumber: 'VYG-2026-043',
        vesselId: 'ves_2',
        vesselName: 'KM Baruna Perkasa',
        originPortId: 'port_2',
        originPortName: 'Tanjung Perak, Surabaya (IDSUB)',
        destinationPortId: 'port_4',
        destinationPortName: 'Belawan, Medan (IDBLW)',
        etd: '2026-10-03T10:00',
        eta: '2026-10-07T14:00',
        status: 'scheduled',
        cargoLoadPercent: 85,
        fuelConsumptionLiters: 62000,
        currentCoordinates: 'Dermaga Mirah, Surabaya',
        captainName: 'Capt. Rian Firmansyah',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        voyageNumber: 'VYG-2026-039',
        vesselId: 'ves_3',
        vesselName: 'MT Tirta Energi',
        originPortId: 'port_5',
        originPortName: 'Batu Ampar, Batam (IDBTM)',
        destinationPortId: 'port_1',
        destinationPortName: 'Tanjung Priok, Jakarta (IDTPP)',
        etd: '2026-09-26T06:00',
        eta: '2026-09-28T18:00',
        status: 'berthed',
        cargoLoadPercent: 98,
        fuelConsumptionLiters: 39000,
        currentCoordinates: 'Dermaga Jetty Minyak Priok',
        captainName: 'Capt. Agus Supriyadi',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
    ];

    for (const voy of sampleVoyages) {
      await saveVoyage(voy, undefined, userEmail);
    }

    // 5. Initial Bookings / Manifest
    const sampleBookings: Omit<Booking, 'id'>[] = [
      {
        blNumber: 'BL-JKT-MKS-88219',
        voyageId: 'voy_1',
        voyageNumber: 'VYG-2026-042',
        shipperName: 'PT Indofood CBP Sukses Makmur Tbk',
        consigneeName: 'PT Makassar Mega Logistik',
        cargoType: 'Dry Container 40ft',
        containerCount: 24,
        grossWeightTons: 540,
        freightPriceIdr: 420000000,
        paymentStatus: 'paid',
        bookingStatus: 'on_board',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        blNumber: 'BL-JKT-MKS-88220',
        voyageId: 'voy_1',
        voyageNumber: 'VYG-2026-042',
        shipperName: 'PT Unilever Indonesia Logistik',
        consigneeName: 'CV Cahaya Timur Maritim',
        cargoType: 'Dry Container 20ft',
        containerCount: 16,
        grossWeightTons: 280,
        freightPriceIdr: 176000000,
        paymentStatus: 'paid',
        bookingStatus: 'on_board',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      {
        blNumber: 'BL-SBY-BLW-91044',
        voyageId: 'voy_2',
        voyageNumber: 'VYG-2026-043',
        shipperName: 'PT Semen Gresik Nusantara',
        consigneeName: 'PT Andalas Distribusi Semen',
        cargoType: 'Breakbulk / Curah',
        containerCount: 0,
        grossWeightTons: 12500,
        freightPriceIdr: 1875000000,
        paymentStatus: 'credit',
        bookingStatus: 'confirmed',
        updatedAt: new Date().toISOString(),
        createdBy: userEmail,
      },
    ];

    for (const b of sampleBookings) {
      await saveBooking(b, undefined, userEmail);
    }

    // 6. Initial Clearances (SPB)
    const sampleClearance: Omit<Clearance, 'id'> = {
      spbNumber: 'SPB/KSOP.Tpk/2026/09/IX-4412',
      voyageId: 'voy_1',
      voyageNumber: 'VYG-2026-042',
      vesselName: 'KM Samudera Nusantara 01',
      ksopAuthority: 'Kantor Kesyahbandaran dan Otoritas Pelabuhan (KSOP) Kelas I Tanjung Priok',
      issueDate: '2026-10-01',
      seaworthinessStatus: 'laik_laut',
      inspectorNotes: 'Dokumen kelayakan kapal, sertifikat keselamatan radio maritim, manifest muatan, dan daftar kru lengkap memenuhi SOLAS 1974.',
      updatedAt: new Date().toISOString(),
      createdBy: userEmail,
    };
    await saveClearance(sampleClearance, undefined, userEmail);

    return true;
  } catch (err) {
    console.warn('Seed operation error:', err);
    return false;
  }
}
