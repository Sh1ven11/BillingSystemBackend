import { supabaseAdmin } from '../config/supabaseClient.js';

// Public controller method to get unpaid bills grouped by company
export const billsController = {
  // Main function to get all unpaid bills, grouped by company
  getUnpaidBillsGroupedByCompany: async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('bills')
        .select(`
          id,
          inv_date,
          inv_no,
          bill_amount,
          amount_unpaid,
          companies:company_id ( company_name, company_id )
        `)
        .not('amount_unpaid', 'eq', 0)
        .order('company_name', { foreignTable: 'companies', ascending: true }); // Corrected syntax

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error('Failed to retrieve bills.');
      }
      
      const totalUnpaidAmount = data.reduce((sum, bill) => sum + Number(bill.amount_unpaid), 0);
      const totalUnpaidBillsCount = data.length;

      // Group bills by company
      const companiesGrouped = data.reduce((acc, bill) => {
        const companyName = bill.companies?.company_name || 'Unknown Company';
        const companyId = bill.companies?.company_id || null;
        
        if (!acc[companyId]) {
          acc[companyId] = {
            id: companyId,
            name: companyName,
            bills: []
          };
        }
        acc[companyId].bills.push(bill);
        return acc;
      }, {});

      // Convert grouped object to a sorted array
      const companiesWithUnpaidBills = Object.values(companiesGrouped).sort((a, b) => {
        if (a.bills.length < b.bills.length) return 1;
        if (a.bills.length > b.bills.length) return -1;
        return 0;
      });

      res.status(200).json({
        companies_with_unpaid_bills: companiesWithUnpaidBills,
        total_unpaid_amount: totalUnpaidAmount,
        total_unpaid_bills: totalUnpaidBillsCount
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: error.message || 'Server error occurred.' });
    }
  },

  // This is a placeholder to prevent the TypeError in the router
  getAllBills: (req, res) => {
    res.status(501).json({ error: "Not Implemented" });
  },

  // This is a placeholder to prevent the TypeError in the router
  getUnpaidBillsAll: (req, res) => {
    res.status(501).json({ error: "Not Implemented" });
  }
};
