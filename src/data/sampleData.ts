import { uid } from '../utils/storage';
import { MONTHS } from '../utils/storage';

export function getSampleData(companyId: string, financialYear: string, month: string) {
  return { books: [], g2b: [], rcm: [], gstr1: [] };
}
