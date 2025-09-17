// client/src/components/DebugTest.jsx
import React from 'react';

const DebugTest = () => {
  return (
    <div style={{
      width: '100%',
      height: '300px',
      backgroundColor: 'lightgreen',
      border: '3px solid red',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold'
    }}>
      ✅ DEBUG TEST - If you see this, React is working!
    </div>
  );
};

export default DebugTest;