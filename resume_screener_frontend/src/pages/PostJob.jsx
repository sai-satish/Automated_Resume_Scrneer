// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const PostJob = () => {
//   const navigate = useNavigate();

//   const [job, setJob] = useState({
//     title: '',
//     required_skills: [''],
//     preferred_skills: [''],
//     min_experience: '',
//     experience_keywords: [''],
//     required_education: ['']
//   });

//   const handleChange = (field, value) => {
//     setJob({ ...job, [field]: value });
//   };

//   const handleArrayChange = (field, index, value) => {
//     const updated = [...job[field]];
//     updated[index] = value;
//     setJob({ ...job, [field]: updated });
//   };

//   const addToArrayField = (field) => {
//     setJob({ ...job, [field]: [...job[field], ''] });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const response = await fetch('http://localhost:8000/recruiter/post-job/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(job)
//     });

//     if (response.ok) {
//       alert('Job posted successfully!');
//       navigate('/recruiter');
//     } else {
//       const error = await response.json();
//       alert(`Failed to post job: ${error.error}`);
//     }
//   };

//   return (
//     <div className="container my-5">
//       <div className="card shadow-sm p-4">
//         <h2 className="mb-4">Post a New Job</h2>
//         <form onSubmit={handleSubmit}>
//           {/* Title */}
//           <div className="mb-3">
//             <label className="form-label">Job Title</label>
//             <input
//               type="text"
//               className="form-control"
//               value={job.title}
//               onChange={(e) => handleChange('title', e.target.value)}
//               required
//             />
//           </div>

//           {/* Required Skills */}
//           <div className="mb-3">
//             <label className="form-label">Required Skills</label>
//             {job.required_skills.map((skill, index) => (
//               <div key={index} className="input-group mb-2">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={skill}
//                   onChange={(e) => handleArrayChange('required_skills', index, e.target.value)}
//                   required
//                 />
//                 {index === job.required_skills.length - 1 && (
//                   <button type="button" className="btn btn-outline-primary" onClick={() => addToArrayField('required_skills')}>
//                     +
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Preferred Skills */}
//           <div className="mb-3">
//             <label className="form-label">Preferred Skills (Optional)</label>
//             {job.preferred_skills.map((skill, index) => (
//               <div key={index} className="input-group mb-2">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={skill}
//                   onChange={(e) => handleArrayChange('preferred_skills', index, e.target.value)}
//                 />
//                 {index === job.preferred_skills.length - 1 && (
//                   <button type="button" className="btn btn-outline-secondary" onClick={() => addToArrayField('preferred_skills')}>
//                     +
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Minimum Experience */}
//           <div className="mb-3">
//             <label className="form-label">Minimum Experience (Years)</label>
//             <input
//               type="text"
//               className="form-control"
//               value={job.min_experience}
//               onChange={(e) => handleChange('min_experience', e.target.value)}
//               required
//             />
//           </div>


//           {/* Experience Keywords */}
//           <div className="mb-3">
//             <label className="form-label">Experience Keywords</label>
//             {job.experience_keywords.map((exp, index) => (
//               <div key={index} className="input-group mb-2">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={exp}
//                   onChange={(e) => handleArrayChange('experience_keywords', index, e.target.value)}
//                   required
//                 />
//                 {index === job.experience_keywords.length - 1 && (
//                   <button type="button" className="btn btn-outline-primary" onClick={() => addToArrayField('experience_keywords')}>
//                     +
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Required Education */}
//           <div className="mb-3">
//             <label className="form-label">Required Education</label>
//             {job.required_education.map((edu, index) => (
//               <div key={index} className="input-group mb-2">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={edu}
//                   onChange={(e) => handleArrayChange('required_education', index, e.target.value)}
//                   required
//                 />
//                 {index === job.required_education.length - 1 && (
//                   <button type="button" className="btn btn-outline-primary" onClick={() => addToArrayField('required_education')}>
//                     +
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Submit Button */}
//           <button type="submit" className="btn btn-success mt-3">Post Job</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PostJob;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PostJob = () => {
  const navigate = useNavigate();

  const [job, setJob] = useState({
    title: '',
    required_skills: [''],
    preferred_skills: [''],
    min_experience: '',
    experience_keywords: [''],
    required_education: ['']
  });

  const handleChange = (field, value) => {
    setJob({ ...job, [field]: value });
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...job[field]];
    updated[index] = value;
    setJob({ ...job, [field]: updated });
  };

  const addToArrayField = (field) => {
    setJob({ ...job, [field]: [...job[field], ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/recruiter/post-job/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(job)
    });

    if (response.ok) {
      alert('Job posted successfully!');
      navigate('/recruiter');
    } else {
      const error = await response.json();
      alert(`Failed to post job: ${error.error}`);
    }
  };

  // Helper function to render input groups with consistent styling
  const renderArrayField = (field, label, isRequired = true, buttonVariant = "primary") => {
    return (
      <div className="mb-4">
        <label className="form-label fw-semibold">{label}</label>
        {job[field].map((item, index) => (
          <div key={index} className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder={`Enter ${label.toLowerCase()}`}
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              required={isRequired}
            />
            {index === job[field].length - 1 && (
              <button 
                type="button" 
                className={`btn btn-outline-${buttonVariant} d-flex align-items-center justify-content-center`} 
                style={{width: "45px"}}
                onClick={() => addToArrayField(field)}
              >
                <span>+</span>
              </button>
            )}
          </div>
        ))}
        <div className="form-text text-muted">
          {isRequired ? 
            "Required field. Click + to add more." : 
            "Optional field. Click + to add more."}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow border-0 rounded-3">
            <div className="card-header bg-primary text-white py-3">
              <h2 className="mb-0 fs-4">Post a New Job</h2>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Job Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter job title"
                    value={job.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                  <div className="form-text text-muted">
                    Enter a clear and specific job title
                  </div>
                </div>

                {/* Required Skills */}
                {renderArrayField('required_skills', 'Required Skills')}

                {/* Preferred Skills */}
                {renderArrayField('preferred_skills', 'Preferred Skills', false, "secondary")}

                {/* Minimum Experience */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Minimum Experience (Years)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter number of years"
                    value={job.min_experience}
                    onChange={(e) => handleChange('min_experience', e.target.value)}
                    required
                  />
                  <div className="form-text text-muted">
                    Specify minimum required experience in years
                  </div>
                </div>

                {/* Experience Keywords */}
                {renderArrayField('experience_keywords', 'Experience Keywords')}

                {/* Required Education */}
                {renderArrayField('required_education', 'Required Education')}

                {/* Submit Button */}
                <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
                  <button type="submit" className="btn btn-success py-2 fw-semibold">
                    Post Job
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/recruiter')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;