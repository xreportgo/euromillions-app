// components/grids/GridGenerator.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LotteryBall from '../common/LotteryBall';

const GridGenerator = ({ onGenerate, models }) => {
  const { t } = useTranslation();
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || 'random');
  const [excludedNumbers, setExcludedNumbers] = useState([]);
  const [excludedStars, setExcludedStars] = useState([]);
  const [count, setCount] = useState(1);

  // Available numbers and stars
  const numbers = Array.from({ length: 50 }, (_, i) => i + 1);
  const stars = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleNumberToggle = (number) => {
    if (excludedNumbers.includes(number)) {
      setExcludedNumbers(excludedNumbers.filter(n => n !== number));
    } else {
      setExcludedNumbers([...excludedNumbers, number]);
    }
  };

  const handleStarToggle = (star) => {
    if (excludedStars.includes(star)) {
      setExcludedStars(excludedStars.filter(s => s !== star));
    } else {
      setExcludedStars([...excludedStars, star]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      model: selectedModel,
      count,
      excludedNumbers,
      excludedStars
    });
  };

  const handleClearExclusions = () => {
    setExcludedNumbers([]);
    setExcludedStars([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Models & Count */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('generationModel')}
            </label>
            <div className="space-y-2">
              {models.map(model => (
                <div key={model.id} className="flex items-start">
                  <input
                    id={`model-${model.id}`}
                    name="model"
                    type="radio"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={() => setSelectedModel(model.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                  />
                  <label htmlFor={`model-${model.id}`} className="ml-3 block">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{model.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">{model.description}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('numberOfGrids')}
            </label>
            <input
              type="number"
              id="count"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Right column: Exclusions */}
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('excludedNumbers')} ({excludedNumbers.length})
              </label>
              {excludedNumbers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearExclusions}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t('clearAll')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {numbers.map(number => (
                <div
                  key={number}
                  onClick={() => handleNumberToggle(number)}
                  className={`cursor-pointer ${
                    excludedNumbers.includes(number)
                      ? 'opacity-30'
                      : ''
                  }`}
                >
                  <LotteryBall
                    number={number}
                    type="number"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('excludedStars')} ({excludedStars.length})
            </label>
            <div className="grid grid-cols-6 gap-2">
              {stars.map(star => (
                <div
                  key={star}
                  onClick={() => handleStarToggle(star)}
                  className={`cursor-pointer ${
                    excludedStars.includes(star)
                      ? 'opacity-30'
                      : ''
                  }`}
                >
                  <LotteryBall
                    number={star}
                    type="star"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-right">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('generateGrids')}
        </button>
      </div>
    </form>
  );
};

export default GridGenerator;
