import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

const JackpotTrendChart = ({ data }) => {
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
    const labels = data.map(item => format(new Date(item.date), 'dd/MM/yyyy'));
    const jackpots = data.map(item => item.jackpot / 1000000); // Convert to millions for better display
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: t('jackpotMillions'),
            data: jackpots,
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(245, 158, 11, 1)',
            pointRadius: 3,
            pointHoverRadius: 6,
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
                return format(new Date(data[tooltipItems[0].dataIndex].date), 'EEEE d MMMM yyyy');
              },
              label: function(context) {
                const value = context.raw.toFixed(1);
                return t('jackpot') + ': €' + value + ' ' + t('million');
              },
              afterLabel: function(context) {
                const hasWinner = data[context.dataIndex].jackpotWinners > 0;
                if (hasWinner) {
                  return t('jackpotWon', { count: data[context.dataIndex].jackpotWinners });
                }
                return t('noJackpotWinners');
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: t('drawDate'),
              color: '#6b7280',
            },
            ticks: {
              color: '#6b7280',
              maxRotation: 45,
              minRotation: 45,
              maxTicksLimit: 10,
            },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: t('jackpotMillions'),
              color: '#6b7280',
            },
            ticks: {
              color: '#6b7280',
              callback: function(value) {
                return '€' + value;
              }
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
  }, [data, t]);

  return (
    
      {t('jackpotTrend')}
      
        
      
    
  );
};

export default JackpotTrendChart;