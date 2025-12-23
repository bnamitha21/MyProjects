import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LANGUAGE_OPTIONS } from '../../i18n/config';
import { AuthContext } from '../../context/AuthContext';

const LanguageSwitcher = ({ variant = 'desktop' }) => {
  const { i18n, t } = useTranslation();
  const { updateLanguagePreference } = useContext(AuthContext);

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;
    try {
      await updateLanguagePreference(newLanguage);
    } catch (error) {
      console.error('Failed to update language', error);
    }
  };

  const baseStyles = variant === 'mobile'
    ? 'w-full bg-white/10 border-white/20 text-white'
    : 'bg-white/10 border-white/20 text-gray-200';

  return (
    <motion.label
      className={`flex flex-col gap-1 text-xs uppercase tracking-wide ${variant === 'mobile' ? 'text-gray-300' : 'text-gray-400'}`}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span>{t('language.label')}</span>
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className={`px-3 py-2 rounded-xl backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-blue-400 ${baseStyles}`}
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <option key={language.code} value={language.code} className="text-black">
            {language.nativeLabel} ({language.label})
          </option>
        ))}
      </select>
    </motion.label>
  );
};

export default LanguageSwitcher;