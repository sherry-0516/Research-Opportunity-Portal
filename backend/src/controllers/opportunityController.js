// =====================================================================
// Research Opportunity Controller
// Handles all CRUD operations using parameterized SQL queries with mysql2
// =====================================================================

const pool = require('../config/db');

/**
 * Common SQL select clause ensuring application_deadline is explicitly 
 * formatted as 'YYYY-MM-DD' across all environments and configurations.
 */
const BASE_SELECT_QUERY = `
  SELECT 
    id,
    title,
    description,
    research_area,
    faculty_name,
    department,
    required_skills,
    available_positions,
    DATE_FORMAT(application_deadline, '%Y-%m-%d') AS application_deadline,
    status,
    created_at,
    updated_at
  FROM research_opportunities
`;

/**
 * Controller: Create a new research opportunity
 * Route: POST /api/opportunities
 */
async function createOpportunity(req, res, next) {
  try {
    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status = 'Open'
    } = req.body;

    const insertSql = `
      INSERT INTO research_opportunities 
        (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title.trim(),
      description.trim(),
      research_area.trim(),
      faculty_name.trim(),
      department.trim(),
      required_skills.trim(),
      parseInt(available_positions, 10),
      application_deadline,
      status || 'Open'
    ];

    const [result] = await pool.execute(insertSql, values);
    const newId = result.insertId;

    // Fetch the newly inserted record to return to the client
    const [rows] = await pool.execute(`${BASE_SELECT_QUERY} WHERE id = ?`, [newId]);

    return res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Retrieve all research opportunities
 * Route: GET /api/opportunities
 */
async function getAllOpportunities(req, res, next) {
  try {
    // Optional filtering query parameters: status and search keyword
    const { status, search } = req.query;
    let query = `${BASE_SELECT_QUERY} WHERE 1=1`;
    const params = [];

    if (status && (status === 'Open' || status === 'Closed')) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (title LIKE ? OR research_area LIKE ? OR faculty_name LIKE ? OR department LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Retrieve a single opportunity by ID
 * Route: GET /api/opportunities/:id
 */
async function getOpportunityById(req, res, next) {
  try {
    const id = req.parsedId;

    const [rows] = await pool.execute(`${BASE_SELECT_QUERY} WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Update an existing opportunity
 * Route: PUT /api/opportunities/:id
 */
async function updateOpportunity(req, res, next) {
  try {
    const id = req.parsedId;

    // Check if the opportunity exists first
    const [existing] = await pool.execute('SELECT id FROM research_opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity not found with ID: ${id}`
      });
    }

    // Build dynamic parameterized update query based on provided fields
    const updates = [];
    const values = [];

    const allowedFields = [
      'title',
      'description',
      'research_area',
      'faculty_name',
      'department',
      'required_skills',
      'available_positions',
      'application_deadline',
      'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        let val = req.body[field];
        if (typeof val === 'string') {
          val = val.trim();
        } else if (field === 'available_positions') {
          val = parseInt(val, 10);
        }
        values.push(val);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updatable fields provided in request body'
      });
    }

    // Append ID to parameters array for the WHERE clause
    values.push(id);

    const updateSql = `UPDATE research_opportunities SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(updateSql, values);

    // Fetch updated opportunity record
    const [updatedRows] = await pool.execute(`${BASE_SELECT_QUERY} WHERE id = ?`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully',
      data: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Delete an opportunity by ID
 * Route: DELETE /api/opportunities/:id
 */
async function deleteOpportunity(req, res, next) {
  try {
    const id = req.parsedId;

    // Check if opportunity exists
    const [existing] = await pool.execute('SELECT id, title FROM research_opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity not found with ID: ${id}`
      });
    }

    // Perform deletion with parameterized query
    await pool.execute('DELETE FROM research_opportunities WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: `Research opportunity with ID ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity
};
