export * from './bitcoinCashRpcObservationExtractor';
/** Observation database registration from the extractor's exact base dependency. */
export {
  ObservationEntity as BitcoinCashObservationEntity,
  migrations as bitcoinCashObservationMigrations,
} from '@rosen-bridge/abstract-observation-extractor';
