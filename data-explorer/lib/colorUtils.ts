import { colors } from './colors';

export const getButtonStyles = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  switch (variant) {
    case 'primary':
      return `bg-gray-900 hover:bg-gray-700 text-black`;
    case 'secondary':
      return `bg-gray-500 hover:bg-gray-700 text-black`;
    case 'ghost':
      return `bg-gray-900 hover:bg-[#9DA0A2]/10 text-[#3A3D3F]`;
    default:
      return '';
  }
};

export const getChartColors = (index: number) => {
  return colors.chart[index % colors.chart.length];
};
