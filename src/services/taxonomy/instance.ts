import { TaxonomyRegistry } from './registry';
import { TAXONOMY_NODES } from '../../config';

export const taxonomy = new TaxonomyRegistry(TAXONOMY_NODES);

try {
  taxonomy.validateIntegrity();
} catch (err) {
  console.warn("Taxonomy Integrity Check:", err);
}
