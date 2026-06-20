import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, Sparkles, X } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch?: (keyword: string) => void;
  onCameraClick?: () => void;
  onAiClick?: () => void;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  placeholder = '搜索药品名称',
  onSearch,
  onCameraClick,
  onAiClick,
  readOnly = false,
  onChange,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
    },
    [onSearch],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  const handleSearchClick = useCallback(() => {
    if (readOnly) {
      navigate('/search');
      return;
    }
    inputRef.current?.focus();
  }, [readOnly, navigate]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
      onClear?.();
      inputRef.current?.focus();
    },
    [onChange, onClear],
  );

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <div className={styles.searchBox} onClick={handleSearchClick}>
          <Search className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
          />
          {value && !readOnly && (
            <button className={styles.clearBtn} onClick={handleClear} type="button" data-tip="清除">
              <X size={14} />
            </button>
          )}
        </div>
        <button className={styles.iconBtn} onClick={onCameraClick} data-tip="拍照识药">
          <Camera className={styles.btnIcon} />
        </button>
        <button className={styles.iconBtn} onClick={onAiClick} data-tip="AI助手">
          <Sparkles className={styles.btnIcon} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
