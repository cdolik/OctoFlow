import React, { useState } from 'react';

// SignUp.tsx: A simple registration form for startups using functional components and TypeScript.
const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process the email (e.g., send to an API or display confirmation)
    alert(`Thank you, ${email}! Your registration has been received.`);
    setEmail('');
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded ml-2"
            placeholder="Enter your email"
            required
          />
        </label>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default SignUp;
