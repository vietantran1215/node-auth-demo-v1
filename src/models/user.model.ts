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
    password: 'adminpass', // In a real app, this would be hashed
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

export const createUser = (user: Omit<User, 'id'>): User => {
  const newUser: User = {
    ...user,
    id: (users.length + 1).toString()
  };
  users.push(newUser);
  return newUser;
}; 