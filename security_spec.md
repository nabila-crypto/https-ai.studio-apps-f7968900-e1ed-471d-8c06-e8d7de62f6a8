# Security Specification: MaritimX Fleet Management

## 1. Data Invariants
1. Vessels must have valid IMO Number, name, vessel type, and valid status ('active', 'sailing', 'docking', 'berthed').
2. Ports must have a unique port code (e.g., IDTPP) and maximum draft.
3. Crew members must have a registered seaman book number and designated rank.
4. Voyages must link valid origin and destination ports, with ETD/ETA timestamps.
5. Cargo Bookings must have a unique Bill of Lading (B/L) number, valid cargo type, and gross weight.
6. Clearances (SPB) must link to a valid voyage and have valid seaworthiness status.
7. Any mutation emits or reflects an audit trail for multi-account real-time synchronization.

## 2. Dirty Dozen Threat Payloads
1. **Unauthenticated Write**: Writing a vessel without active auth token -> Rejected.
2. **Payload Poisoning**: Injecting 2MB payload into `name` field -> Rejected by `.size() <= 100`.
3. **Invalid ID Attack**: Attempting path ID containing special scripts like `vessel/../../malicious` -> Rejected by `isValidId()`.
4. **Negative Tonnage**: Setting vessel `capacityDwt` to negative values -> Rejected by validation.
5. **State Skipping**: Forging voyage status to an arbitrary string not in enum -> Rejected.
6. **Shadow Field Injection**: Injecting hidden fields like `isAdmin: true` into booking objects -> Rejected by key validation.
7. **Orphan Voyage**: Creating a voyage with missing origin or destination -> Rejected by required keys.
8. **Tampering B/L**: Modifying immutable bill of lading number on existing booking -> Rejected by update restriction.
9. **Fake Clearance**: Issuing clearance with invalid status outside `['laik_laut', 'dalam_inspeksi', 'ditahan']` -> Rejected.
10. **Resource Exhaustion**: Writing 500 audit logs per second with infinite strings -> Rejected by max length.
11. **Spoofed Creator**: Creating document claiming to be another user's UID -> Enforced against `request.auth.uid`.
12. **Null Value Bypass**: Setting required string field to null -> Rejected by `is string`.
