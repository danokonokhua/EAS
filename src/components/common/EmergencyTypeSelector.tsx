import React from 'react';

interface EmergencyTypeSelectorProps {
  type?: string;
  onChange?: (type: string) => void;
}

export const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({ type, onChange }) => {
  return (
    <div>
      <select 
        value={type} 
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">Select Emergency Type</option>
        <option value="medical">Medical Emergency</option>
        <option value="fire">Fire Emergency</option>
        <option value="police">Police Emergency</option>
      </select>
    </div>
  );
};

export default EmergencyTypeSelector;


