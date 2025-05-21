// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const Login = () => {
//   const handleAzureLogin = () => {
//     // Redirect to Django backend's Azure login endpoint
//     window.location.href = 'http://localhost:8000/auth/login/';
//   };

//   return (
//     <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
//       <div className="card shadow p-4 w-100" style={{ maxWidth: '400px' }}>
//         <h3 className="text-center mb-4">Login</h3>
//         <button 
//           className="btn btn-primary w-100" 
//           onClick={handleAzureLogin}
//         >
//           Sign in with Azure AD
//         </button>
//         <p className="mt-3 text-center">
//           Don't have an account? <a href="/register">Register</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const handleAzureLogin = () => {
    // Redirect to Django backend's Azure login endpoint
    window.location.href = 'http://localhost:8000/auth/login/';
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg border-0 rounded-3 p-4 w-100" style={{ maxWidth: '420px' }}>
        <div className="card-body px-4 py-3">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary mb-1">Welcome Back</h2>
            <p className="text-muted">Sign in to continue to your account</p>
          </div>
          
          <div className="d-grid gap-2 mb-4">
            <button 
              className="btn btn-primary py-2 fw-semibold" 
              onClick={handleAzureLogin}
            >
              <i className="bi bi-microsoft me-2"></i>
              Sign in with Microsoft Azure
            </button>
          </div>
          
          <hr className="my-4" />
          
          <p className="text-center mb-0">
            Don't have an account? <a href="/register" className="text-decoration-none fw-semibold">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;