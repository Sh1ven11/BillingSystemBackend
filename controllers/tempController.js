import { supabaseAdmin } from '../config/supabaseClient.js';

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
      
      // Get template
      const { data: template, error: templateError } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (templateError) {
        console.error('Supabase query error:', templateError);
        return res.status(500).json({ error: 'Failed to fetch template' });
      }

      // Get associated companies
      const { data: companies, error: companiesError } = await supabaseAdmin
        .from('template_companies')
        .select(`
          company_id,
          companies ( company_name )
        `)
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
    console.log("inside create template");
    try {

      // Safety check to ensure user is authenticated
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Unauthorized' });
      // }
      console.log(req.body);
      const { name, subject, body,mail, company_ids } = req.body;
      //const user_id = req.user.id; // Get the user ID from the authenticated request
      const sendermail='arvind@kalitransport.in';
      // 1. Create the template with the user_id
      const { data: template, error: templateError } = await supabaseAdmin
        .from('templates')
        .insert([{ name, subject, body,from_mail:sendermail,to_mail:mail }]) // Include user_id in the insert
        .select()
        .single();

      if (templateError) {
        console.error('Supabase query error:', templateError);
        return res.status(500).json({ error: 'Failed to create template' });
      }

      // 2. Link companies to template
      if (company_ids && company_ids.length > 0) {
        const templateCompanies = company_ids.map(company_id => ({
          template_id: template.id,
          company_id
        }));

        const { error: linkError } = await supabaseAdmin
          .from('template_companies')
          .insert(templateCompanies);

        if (linkError) {
          console.error('Supabase query error:', linkError);
          return res.status(500).json({ error: 'Failed to link companies to template' });
        }
      }

      res.status(201).json({ 
        message: 'Template created successfully', 
        template 
      });
    } catch (error) {

      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  },

  // Update template
 // Update template
updateTemplate: async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, mail, company_ids } = req.body;

    const sendermail = 'arvind@kalitransport.in';

    // 1. Update the template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('templates')
      .update({
        name,
        subject,
        body,
        from_mail: sendermail,
        to_mail: mail
      })
      .eq('id', id)
      .select()
      .single();

    if (templateError) {
      console.error('Supabase query error:', templateError);
      return res.status(500).json({ error: 'Failed to update template' });
    }

    // 2. Update companies (delete old, add new)
    if (company_ids) {
      // Remove existing companies
      await supabaseAdmin
        .from('template_companies')
        .delete()
        .eq('template_id', id);

      // Add new companies
      if (company_ids.length > 0) {
        const templateCompanies = company_ids.map(company_id => ({
          template_id: id,
          company_id
        }));

        const { error: linkError } = await supabaseAdmin
          .from('template_companies')
          .insert(templateCompanies);

        if (linkError) {
          console.error('Supabase query error:', linkError);
          return res.status(500).json({ error: 'Failed to update linked companies' });
        }
      }
    }

    res.json({ 
      message: 'Template updated successfully', 
      template 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
},


  // Delete template
  deleteTemplate: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase query error:', error);
        return res.status(500).json({ error: 'Failed to delete template' });
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error occurred' });
    }
  }
};
