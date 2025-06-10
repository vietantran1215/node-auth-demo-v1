import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
}

// Mock database - this would be replaced with a real database in production
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    // Hashed version of 'adminpass'
    password: '$2a$10$aMmWxBNOr.I9g.C5Q3lrG.MrfP0.BFvkHQNTjGY5AcGOJ/b7DMJt.',
    email: 'admin@example.com',
    name: 'Admin User'
  }
];

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const findUserByUsername = (username: string): User | undefined => {
  return users.find(user => user.username === username);
};

export const createUser = async (userData: Omit<User, 'id' | 'password'> & { password: string }): Promise<User> => {
  // Hash the password before storing
  const salt = await bcrypt.genSalt(10); // string - được mã hoá với số round mình truyền vào, mục đích là kết hợp với password mình sử dụng để tăng tính bảo mật cho hashpassword
  const hashedPassword = await bcrypt.hash(userData.password, salt); // hash password - stored in DB
  
  const newUser: User = {
    ...userData,
    password: hashedPassword,
    id: (users.length + 1).toString()
  };
  
  users.push(newUser); // db.save(), INSERT INTO users ... (SQL)
  return newUser;
};

// Function to compare a plain text password with a hashed password
export const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};