import React from 'react';
import './css/searchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Search users' }) => {
  return (
    <div className="searchInputWrapper">
      <input
        type="text"
        className="searchInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <span className="searchIcon">🔍</span>
    </div>
  );
};

export default SearchInput;