import React from 'react';

interface PhoneWrapperProps {
  children: React.ReactNode;
}

export const PhoneWrapper: React.FC<PhoneWrapperProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: 'var(--bg-deep)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
};
