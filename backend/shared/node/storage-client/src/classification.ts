/**
 * Data sensitivity classification, per docs/database/03_Data_Governance.md#data-classification-by-entity
 * ("Per SECURITY.md#data-sensitivity-classes (Public / Internal / Restricted / Critical)")
 * — the security/data-governance documentation's 4-value taxonomy is the
 * one used here, in place of the "Confidential" label used informally
 * elsewhere in early planning notes; where a taxonomy is already defined in
 * the security docs, that doc wins (see this package's deviation note in
 * the implementation report).
 *
 * Every `content.file.classification` column carries one of these 4 values
 * per-file (docs/database/03_Data_Governance.md), so `StorageClient.upload()`
 * requires this as a mandatory argument (see storage-client.ts) rather than
 * defaulting it — an uploaded file's sensitivity must be a deliberate
 * decision, never an afterthought.
 */
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted',
  CRITICAL = 'critical',
}
