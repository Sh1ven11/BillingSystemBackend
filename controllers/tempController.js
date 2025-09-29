import { supabaseAdmin } from '../config/supabaseClient.js';
import * as XLSX from 'xlsx';
import { transporter } from '../services/mailService.js';


export const templateController = {
  // Get all templates
  
  getAllTemplates: async (req, res) => {
    try {
      const { data: templates, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        return res.status(500).json({ error: 'Failed to fetch templates' });
      }

      res.json({ templates });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  },

  // Get single template with companies
  getTemplate: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: template, error: templateError } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (templateError) {
        console.error('Supabase query error:', templateError);
        return res.status(500).json({ error: 'Failed to fetch template' });
      }

      const { data: companies, error: companiesError } = await supabaseAdmin
        .from('template_companies')
        .select(`company_id, companies ( company_name )`)
        .eq('template_id', id);

      if (companiesError) {
        console.error('Supabase query error:', companiesError);
        return res.status(500).json({ error: 'Failed to fetch associated companies' });
      }

      res.json({
        template: {
          ...template,
          companies: companies.map(item => ({
            company_id: item.company_id,
            company_name: item.companies.company_name
          }))
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  },

  // Create new template
  createTemplate: async (req, res) => {
    try {
      const { name, subject, body, mail, company_ids, selected_columns } = req.body;
      const sendermail = 'arvind@kalitransport.in';

      const { data: template, error: templateError } = await supabaseAdmin
        .from('templates')
        .insert([{ name, subject, body, from_mail: sendermail, to_mail: mail, selected_columns }])
        .select()
        .single();

      if (templateError) {
        console.error('Supabase query error:', templateError);
        return res.status(500).json({ error: 'Failed to create template' });
      }

      if (company_ids && company_ids.length > 0) {
        const templateCompanies = company_ids.map(company_id => ({
          template_id: template.id,
          company_id
        }));
        await supabaseAdmin.from('template_companies').insert(templateCompanies);
      }

      res.status(201).json({ message: 'Template created successfully', template });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  },

  // Update template
  updateTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, subject, body, mail, company_ids, selected_columns } = req.body;
      const sendermail = 'arvind@kalitransport.in';

      const { data: template, error: templateError } = await supabaseAdmin
        .from('templates')
        .update({
          name,
          subject,
          body,
          from_mail: sendermail,
          to_mail: mail,
          selected_columns
        })
        .eq('id', id)
        .select()
        .single();

      if (templateError) {
        console.error('Supabase query error:', templateError);
        return res.status(500).json({ error: 'Failed to update template' });
      }

      if (company_ids) {
        await supabaseAdmin.from('template_companies').delete().eq('template_id', id);
        if (company_ids.length > 0) {
          const templateCompanies = company_ids.map(company_id => ({
            template_id: id,
            company_id
          }));
          await supabaseAdmin.from('template_companies').insert(templateCompanies);
        }
      }

      res.json({ message: 'Template updated successfully', template });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  },

  // Delete template
  deleteTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin.from('templates').delete().eq('id', id);

      if (error) {
        console.error('Supabase query error:', error);
        return res.status(500).json({ error: 'Failed to delete template' });
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  },

  // Send Mail with Excel attachment
  sendMail: async (req, res) => {
    const columnMap = {
    amount_unpaid: 'Amount Unpaid',
    company_id: 'Company ID',
    company_name: 'Company Name',
    bill_no: 'Bill No',
    inv_date: 'Bill Date',
    bill_amount: 'Bill Amount'
  };
    const { id } = req.params;
    try {
      const { data: template, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !template) return res.status(404).json({ error: 'Template not found' });

      const { subject, body, to_mail, selected_columns } = template;

      const { data: companies, error: companiesError } = await supabaseAdmin
        .from('template_companies')
        .select('company_id, companies ( company_name ,code_from_dbf )')
        .eq('template_id', id);
      if (companiesError) {
        console.error('Supabase query error:', companiesError);
        return res.status(500).json({ error: 'Failed to fetch associated companies' });
      }
      //console.log(companies);
      // Fetch bills for these companies
      const companyIds = companies.map(c => c.companies.code_from_dbf);
      //console.log(companyIds);

      const { data: bills, error: billsError } = await supabaseAdmin
        .from('bills')
        .select('*, companies ( company_name)')
        .in('company_id', companyIds)
        .not('amount_unpaid', 'eq', 0);
      console.log(bills);
      if (billsError) {
        console.error('Supabase query error:', billsError);
        return res.status(500).json({ error: 'Failed to fetch bills' });
      }

      // Filter only selected columns
      const filteredBills = bills.map(bill => {
      const obj = {};
      selected_columns.forEach(col => {
        const label = columnMap[col] || col; // fallback to original key
        if (col === 'company_name') obj[label] = bill.companies.company_name || '';
        else obj[label] = bill[col];
      });
      return obj;
    });

      // Create Excel
      const ws = XLSX.utils.json_to_sheet(filteredBills);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bills');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Replace placeholders in body
      const firstCompany = companies[0]?.companies?.company_name || '';
      const totalUnpaid = bills.reduce((sum, b) => sum + (b.amount_unpaid || 0), 0);
      const replacedBody = body
        .replace('{{company_name}}', firstCompany)
        .replace('{{total_amount}}', totalUnpaid);

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to_mail,
        subject,
        text: replacedBody,
        attachments: [
          {
            filename: 'bills.xlsx',
            content: buf
          }
        ]
      });

      res.json({ message: 'Mail sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to send mail' });
    }
  }
};
