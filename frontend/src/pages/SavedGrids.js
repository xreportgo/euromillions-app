// pages/SavedGrids.js
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSavedGrids, deleteGrid, updateGridName } from '../redux/actions/gridActions';
import LotteryBall from '../components/common/LotteryBall';
import { printGrid, exportGrids } from '../services/gridService';
import { Link } from 'react-router-dom';
import toast from '../utils/toast';

const SavedGrids = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { savedGrids, loading, error } = useSelector(state => state.grids);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedGrids, setSelectedGrids] = useState([]);
  
  useEffect(() => {
    dispatch(fetchSavedGrids());
  }, [dispatch]);
  
  const handleSelectGrid = (id) => {
    if (selectedGrids.includes(id)) {
      setSelectedGrids(selectedGrids.filter(gridId => gridId !== id));
    } else {
      setSelectedGrids([...selectedGrids, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedGrids.length === savedGrids.length) {
      setSelectedGrids([]);
    } else {
      setSelectedGrids(savedGrids.map(grid => grid._id));
    }
  };
  
  const handlePrint = (grid) => {
    printGrid(grid);
  };
  
  const handleEdit = (grid) => {
    setEditingId(grid._id);
    setNewName(grid.name);
  };
  
  const handleSaveEdit = async () => {
    if (editingId && newName.trim()) {
      try {
        await dispatch(updateGridName(editingId, newName.trim()));
        setEditingId(null);
        setNewName('');
      } catch (error) {
        console.error('Error updating grid name:', error);
      }
    }
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
  };
  
  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDeleteGrid'))) {
      try {
        await dispatch(deleteGrid(id));
      } catch (error) {
        console.error('Error deleting grid:', error);
      }
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedGrids.length === 0) return;
    
    if (window.confirm(t('confirmDeleteSelectedGrids', { count: selectedGrids.length }))) {
      try {
        // Delete grids one by one
        for (const id of selectedGrids) {
          await dispatch(deleteGrid(id));
        }
        setSelectedGrids([]);
      } catch (error) {
        console.error('Error deleting selected grids:', error);
      }
    }
  };
  
  const handleExport = async (format) => {
    try {
      const ids = selectedGrids.length > 0 ? selectedGrids : null;
      const response = await exportGrids(format, ids);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grilles-euromillions.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting grids:', error);
    }
  };
  
  const handlePrintSelected = () => {
    if (selectedGrids.length === 0) return;
    
    // Print each selected grid
    const selectedGridObjects = savedGrids.filter(grid => 
      selectedGrids.includes(grid._id)
    );
    
    for (const grid of selectedGridObjects) {
      printGrid(grid);
    }
  };
  
  if (loading && savedGrids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('savedGrids')}</h1>
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  if (error && savedGrids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('savedGrids')}</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{t('errorLoadingGrids')}: {error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => dispatch(fetchSavedGrids())}
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('savedGrids')}</h1>
      
      {/* Actions toolbar */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSelectAll}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {selectedGrids.length === savedGrids.length ? t('deselectAll') : t('selectAll')}
        </button>
        
        <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
        
        <button
          onClick={handlePrintSelected}
          disabled={selectedGrids.length === 0}
          className={`px-3 py-1 text-sm rounded ${
            selectedGrids.length === 0 
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {t('printSelected')}
        </button>
        
        <button
          onClick={handleDeleteSelected}
          disabled={selectedGrids.length === 0}
          className={`px-3 py-1 text-sm rounded ${
            selectedGrids.length === 0 
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {t('deleteSelected')}
        </button>
        
        <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
        
        <div className="relative group">
          <button
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('export')}
          </button>
          <div className="absolute hidden group-hover:block mt-1 w-32 bg-white dark:bg-gray-800 shadow-lg rounded z-10">
            <button 
              onClick={() => handleExport('csv')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              CSV
            </button>
            <button 
              onClick={() => handleExport('json')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              JSON
            </button>
          </div>
        </div>
        
        <div className="ml-auto">
          <Link 
            to="/generate"
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {t('generateNewGrids')}
          </Link>
        </div>
      </div>
      
      {savedGrids.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{t('noSavedGrids')}</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t('startBySavingGrids')}</p>
          <div className="mt-6">
            <Link
              to="/generate"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('generateGrids')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedGrids.map(grid => (
            <div 
              key={grid._id} 
              className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                selectedGrids.includes(grid._id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <input 
                    type="checkbox"
                    checked={selectedGrids.includes(grid._id)}
                    onChange={() => handleSelectGrid(grid._id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  
                  {editingId === grid._id ? (
                    <div className="ml-2 flex-1 flex">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 border-gray-300 rounded text-sm p-1"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveEdit}
                        className="ml-1 text-green-500 hover:text-green-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="ml-1 text-red-500 hover:text-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <h3 className="ml-2 text-lg font-medium flex-1 truncate">
                      {grid.name || t('unnamedGrid')}
                      <button 
                        onClick={() => handleEdit(grid)}
                        className="ml-1 text-gray-500 hover:text-blue-500 inline-block"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </h3>
                  )}
                </div>
                
                <div className="flex justify-center my-3 flex-wrap">
                  {grid.numbers.map(number => (
                    <LotteryBall 
                      key={`number-${number}`} 
                      number={number} 
                      type="number"
                      className="m-1"
                    />
                  ))}
                  <span className="mx-2 self-center">+</span>
                  {grid.stars.map(star => (
                    <LotteryBall 
                      key={`star-${star}`} 
                      number={star} 
                      type="star"
                      className="m-1"
                    />
                  ))}
                </div>
                
                {grid.method && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {t('generatedUsing')}: {t(grid.method)}
                  </div>
                )}
                
                {grid.confidence > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('confidence')}: {Math.round(grid.confidence * 100)}%
                  </div>
                )}
                
                <div className="mt-4 flex justify-between gap-2">
                  <button
                    onClick={() => handlePrint(grid)}
                    className="flex-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('print')}
                  </button>
                  <button
                    onClick={() => handleDelete(grid._id)}
                    className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedGrids;
