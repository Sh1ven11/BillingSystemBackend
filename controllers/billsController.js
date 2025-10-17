import { supabaseAdmin } from '../config/supabaseClient.js';

// Public controller method to get unpaid bills grouped by company
export const billsController = {
  // Main function to get all unpaid bills, grouped by company
  getUnpaidBillsGroupedByCompany: async (req, res) => {
    try {
      const { comp } = req.query;

      const batchSize = 1000; // Free plan max rows per request
      let from = 0;
      let allData = [];

      // Fetch all unpaid bills in batches
      while (true) {
        let query = supabaseAdmin
          .from('bills')
          .select(`
            id,
            inv_date,
            inv_no,
            bill_amount,
            amount_unpaid,
            comp,
            companies:company_id ( company_name, company_id )
          `)
          .not('amount_unpaid', 'eq', 0)
          .order('company_name', { foreignTable: 'companies', ascending: true })
          .range(from, from + batchSize - 1);

        if (comp) {
          query = query.eq('comp', comp);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw new Error('Failed to retrieve bills.');
        }

        if (!data || data.length === 0) break; // No more data
        allData = allData.concat(data);
        from += batchSize;
      }

      // Compute totals
      const totalUnpaidAmount = allData.reduce((sum, bill) => sum + Number(bill.amount_unpaid), 0);
      const totalUnpaidBillsCount = allData.length;

      // Group by company
      const companiesGrouped = allData.reduce((acc, bill) => {
        const companyName = bill.companies?.company_name || 'Unknown Company';
        const companyId = bill.companies?.company_id || null;

        if (!acc[companyId]) {
          acc[companyId] = {
            id: companyId,
            name: companyName,
            bills: [],
          };
        }
        acc[companyId].bills.push(bill);
        return acc;
      }, {});

      const companiesWithUnpaidBills = Object.values(companiesGrouped).sort((a, b) => {
        if (a.bills.length < b.bills.length) return 1;
        if (a.bills.length > b.bills.length) return -1;
        return 0;
      });

      res.status(200).json({
        companies_with_unpaid_bills: companiesWithUnpaidBills,
        total_unpaid_amount: totalUnpaidAmount,
        total_unpaid_bills: totalUnpaidBillsCount,
      });

    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: error.message || 'Server error occurred.' });
    }
  },

  // Placeholder to prevent router errors
  getAllBills: (req, res) => {
    res.status(501).json({ error: "Not Implemented" });
  },

  getUnpaidBillsAll: (req, res) => {
    res.status(501).json({ error: "Not Implemented" });
  }
};
