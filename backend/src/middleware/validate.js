// =====================================================================
// Input Validation Middleware
// Validates route parameters and request bodies prior to controller logic
// =====================================================================

/**
 * Validates that the :id parameter in the URL is a positive integer.
 */
function validateId(req, res, next) {
  const { id } = req.params;
  const isPositiveInt = /^[1-9]\d*$/.test(id);

  if (!isPositiveInt) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID. ID must be a positive integer.'
    });
  }

  // Attach sanitized integer id to request object
  req.parsedId = parseInt(id, 10);
  next();
}

/**
 * Helper to validate a date string in YYYY-MM-DD format.
 */
function isValidDate(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const [year, month, day] = dateString.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

/**
 * Validates request payload when creating a new opportunity (POST).
 * All primary fields are strictly required and cannot be empty.
 */
function validateCreate(req, res, next) {
  const errors = [];
  const {
    title,
    description,
    research_area,
    faculty_name,
    department,
    required_skills,
    available_positions,
    application_deadline,
    status
  } = req.body;

  // Title validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('title is required and cannot be empty.');
  } else if (title.trim().length > 255) {
    errors.push('title cannot exceed 255 characters.');
  }

  // Description validation
  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('description is required and cannot be empty.');
  }

  // Research Area validation
  if (!research_area || typeof research_area !== 'string' || research_area.trim() === '') {
    errors.push('research_area is required and cannot be empty.');
  } else if (research_area.trim().length > 150) {
    errors.push('research_area cannot exceed 150 characters.');
  }

  // Faculty Name validation
  if (!faculty_name || typeof faculty_name !== 'string' || faculty_name.trim() === '') {
    errors.push('faculty_name is required and cannot be empty.');
  } else if (faculty_name.trim().length > 150) {
    errors.push('faculty_name cannot exceed 150 characters.');
  }

  // Department validation
  if (!department || typeof department !== 'string' || department.trim() === '') {
    errors.push('department is required and cannot be empty.');
  } else if (department.trim().length > 150) {
    errors.push('department cannot exceed 150 characters.');
  }

  // Required Skills validation
  if (!required_skills || typeof required_skills !== 'string' || required_skills.trim() === '') {
    errors.push('required_skills is required and cannot be empty.');
  } else if (required_skills.trim().length > 500) {
    errors.push('required_skills cannot exceed 500 characters.');
  }

  // Available Positions validation
  const posNum = Number(available_positions);
  if (
    available_positions === undefined ||
    available_positions === null ||
    !Number.isInteger(posNum) ||
    posNum < 1
  ) {
    errors.push('available_positions must be an integer greater than or equal to 1.');
  }

  // Application Deadline validation
  if (!application_deadline || !isValidDate(application_deadline)) {
    errors.push('application_deadline is required and must be a valid date in YYYY-MM-DD format.');
  }

  // Status validation (optional on creation, defaults to 'Open')
  if (status !== undefined && status !== 'Open' && status !== 'Closed') {
    errors.push("status must be either 'Open' or 'Closed'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

/**
 * Validates request payload when updating an opportunity (PUT).
 * Supports partial updates (e.g. closing an opportunity) or full updates.
 */
function validateUpdate(req, res, next) {
  const errors = [];
  const {
    title,
    description,
    research_area,
    faculty_name,
    department,
    required_skills,
    available_positions,
    application_deadline,
    status
  } = req.body;

  // Ensure body is not completely empty
  const fields = Object.keys(req.body);
  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['At least one field must be provided to update.']
    });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('title cannot be empty.');
    } else if (title.trim().length > 255) {
      errors.push('title cannot exceed 255 characters.');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim() === '') {
      errors.push('description cannot be empty.');
    }
  }

  if (research_area !== undefined) {
    if (typeof research_area !== 'string' || research_area.trim() === '') {
      errors.push('research_area cannot be empty.');
    } else if (research_area.trim().length > 150) {
      errors.push('research_area cannot exceed 150 characters.');
    }
  }

  if (faculty_name !== undefined) {
    if (typeof faculty_name !== 'string' || faculty_name.trim() === '') {
      errors.push('faculty_name cannot be empty.');
    } else if (faculty_name.trim().length > 150) {
      errors.push('faculty_name cannot exceed 150 characters.');
    }
  }

  if (department !== undefined) {
    if (typeof department !== 'string' || department.trim() === '') {
      errors.push('department cannot be empty.');
    } else if (department.trim().length > 150) {
      errors.push('department cannot exceed 150 characters.');
    }
  }

  if (required_skills !== undefined) {
    if (typeof required_skills !== 'string' || required_skills.trim() === '') {
      errors.push('required_skills cannot be empty.');
    } else if (required_skills.trim().length > 500) {
      errors.push('required_skills cannot exceed 500 characters.');
    }
  }

  if (available_positions !== undefined) {
    const posNum = Number(available_positions);
    if (!Number.isInteger(posNum) || posNum < 1) {
      errors.push('available_positions must be an integer greater than or equal to 1.');
    }
  }

  if (application_deadline !== undefined) {
    if (!isValidDate(application_deadline)) {
      errors.push('application_deadline must be a valid date in YYYY-MM-DD format.');
    }
  }

  if (status !== undefined) {
    if (status !== 'Open' && status !== 'Closed') {
      errors.push("status must be either 'Open' or 'Closed'.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

module.exports = {
  validateId,
  validateCreate,
  validateUpdate
};
