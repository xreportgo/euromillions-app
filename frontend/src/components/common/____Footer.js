import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} {t('appName')}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>{t('disclaimer') || "Euromillions App - À des fins de divertissement uniquement"}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
