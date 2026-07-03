import { DashboardApp } from '../../../utils/functions.js';
import 'dotenv/config';

import bakirKhataApp from './bakirKhata.js';
import incomeExpensesApp from './incomeExpenses.js';
import dealerStatementsApp from './dealerStatements.js';

export default DashboardApp()
  .route('/bakir-khata', bakirKhataApp)
  .route('/income-expenses', incomeExpensesApp)
  .route('/dealer-statements', dealerStatementsApp);
