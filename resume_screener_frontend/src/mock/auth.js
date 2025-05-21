export const mockUsers = [
  { email: 'r@r.com', password: '1234', role: 'recruiter' },
  { email: 'a@a.com', password: '1234', role: 'applicant' }
];

export const loginUser = (email, password) => {
  const user = mockUsers.find(
    u => u.email === email && u.password === password
  );
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const registerUser = (email, password, role) => {
  const user = { email, password, role };
  mockUsers.push(user);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const logoutUser = () => {
  localStorage.removeItem('user');
};
