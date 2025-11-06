import React from 'react';

const MajorArcanaAlert: React.FC = () => {
  return (
    <div className="major-arcana-alert absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <p className="text-3xl font-bold font-cinzel text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] tracking-widest">
        Major Arcana!
      </p>
    </div>
  );
};

export default MajorArcanaAlert;
