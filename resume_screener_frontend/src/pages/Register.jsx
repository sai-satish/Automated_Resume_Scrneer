// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const Register = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('Applicants');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleRegister = async e => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('http://localhost:8000/auth/register/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password, role })
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert('Registration successful! Please login.');
//         navigate('/login');
//       } else {
//         setError(result.error || 'Registration failed');
//       }
//     } catch (err) {
//       console.error(err);
//       setError('Server error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
//       <div className="card shadow p-4 w-100" style={{ maxWidth: '400px' }}>
//         <h3 className="text-center mb-4">Register</h3>
//         {error && <div className="alert alert-danger">{error}</div>}
//         <form onSubmit={handleRegister}>
//           <div className="mb-3">
//             <label>Email</label>
//             <input 
//               type="email" 
//               className="form-control" 
//               placeholder="Enter email" 
//               value={email} 
//               onChange={e => setEmail(e.target.value)} 
//               required 
//             />
//           </div>
//           <div className="mb-3">
//             <label>Password</label>
//             <input 
//               type="password" 
//               className="form-control" 
//               placeholder="Enter password" 
//               value={password} 
//               onChange={e => setPassword(e.target.value)} 
//               required 
//             />
//           </div>
//           <div className="mb-3">
//             <label>Role</label>
//             <select 
//               className="form-select" 
//               value={role} 
//               onChange={e => setRole(e.target.value)} 
//               required
//             >
//               <option value="Applicants">Applicant</option>
//               <option value="Recruiters">Recruiter</option>
//             </select>
//           </div>
//           <button type="submit" className="btn btn-success w-100" disabled={loading}>
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//         </form>
//         <p className="mt-3 text-center">
//           Already have an account? <a href="/login">Login</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Applicants');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/auth/csrf/', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => console.log("CSRF cookie set:", data))
      .catch(err => console.error("CSRF fetch failed", err));
  }, []);

  const getCSRFTokenFromCookie = () => {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) return value;
    }
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const csrfToken = getCSRFTokenFromCookie();

    try {
      const response = await fetch('http://localhost:8000/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Secure token from cookie
        },
        credentials: 'include', // Ensures cookies are sent with request
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error occurred');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-4 w-100" style={{ maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Register</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Applicants">Applicant</option>
              <option value="Recruiters">Recruiter</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-3 text-center">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
