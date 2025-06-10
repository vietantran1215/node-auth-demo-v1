export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters and contain at least one number and one letter
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
};

export const validateUsername = (username: string): boolean => {
  // Username must be at least 3 characters and contain only alphanumeric characters and underscores
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const validateSignupData = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Check required fields
  if (!data.username) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else if (!validateUsername(data.username)) {
    errors.push({ 
      field: 'username', 
      message: 'Username must be at least 3 characters and contain only letters, numbers, and underscores' 
    });
  }
  
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!validatePassword(data.password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must be at least 8 characters and contain at least one letter and one number' 
    });
  }
  
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (!data.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoginData = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!data.username) {
    errors.push({ field: 'username', message: 'Username is required' });
  }
  
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 