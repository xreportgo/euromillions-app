import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const FrequencyChart = ({ data, title, color = 'rgba(59, 130, 246, 0.8)', type = 'numbers' }) => {
  const { t } = useTranslation();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    // If no data, don't render chart
    if (!data || data.length === 0) return;
    
    // If chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Prepare data for chart
    const labels = data.map(item => item.value.toString());
    const frequencies = data.map(item => item.frequency);
    const maxValue = type === 'numbers' ? 50 : 12;
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: t('frequency'),
            data: frequencies,
            backgroundColor: color,
            borderColor: color.replace('0.8', '1'),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return type === 'numbers' 
                  ? t('number') + ': ' + tooltipItems[0].label
                  : t('star') + ': ' + tooltipItems[0].label;
              },
              label: function(context) {
                return t('frequency') + ': ' + context.raw;
              },
              afterLabel: function(context) {
                const percentage = ((context.raw / data.reduce((sum, item) => sum + item.frequency, 0)) * 100).toFixed(1);
                return t('percentage') + ': ' + percentage + '%';
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: type === 'numbers' ? t('numbers') : t('stars'),
              color: '#6b7280',
            },
            ticks: {
              color: '#6b7280',
            },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: t('frequency'),
              color: '#6b7280',
            },
            ticks: {
              color: '#6b7280',
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)',
            },
            beginAtZero: true,
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
      },
    });
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, t, color, type]);

  return (
    
      {title}
      
        
      
    
  );
};

export default FrequencyChart;