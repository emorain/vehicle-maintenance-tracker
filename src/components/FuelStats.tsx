// src/components/FuelStats.tsx
import { FuelStats as FuelStatsType } from '../types/Fuel';
import { useSettings } from '../contexts/SettingsContext';
import { formatFuelVolume, formatDistance, formatFuelEconomy, getFuelUnitLabel, getDistanceUnitLabel } from '../utils/unitConversions';

interface FuelStatsProps {
  stats: FuelStatsType;
}

export const FuelStats = ({ stats }: FuelStatsProps) => {
  const { settings } = useSettings();
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Fuel Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Fill-Ups */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Fill-Ups</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalFillUps}</div>
        </div>

        {/* Total Fuel */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Fuel</div>
          <div className="text-2xl font-bold text-gray-800">
            {formatFuelVolume(stats.totalGallons, settings)}
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600">
            ${stats.totalCost.toFixed(2)}
          </div>
        </div>

        {/* Distance Tracked */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Distance Tracked</div>
          <div className="text-2xl font-bold text-gray-800">
            {formatDistance(stats.milesTracked, settings)}
          </div>
        </div>

        {/* Average Fuel Economy */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Avg Economy</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.averageMPG > 0 ? formatFuelEconomy(stats.milesTracked, stats.totalGallons / stats.totalFillUps * (stats.milesTracked / stats.milesTracked), settings) : 'N/A'}
          </div>
        </div>

        {/* Best Fuel Economy */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Best Economy</div>
          <div className="text-2xl font-bold text-green-700">
            {stats.bestMPG > 0 ? stats.bestMPG.toFixed(1) : 'N/A'}
          </div>
        </div>

        {/* Worst Fuel Economy */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Worst Economy</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.worstMPG > 0 ? stats.worstMPG.toFixed(1) : 'N/A'}
          </div>
        </div>

        {/* Average Cost per Unit */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Avg $/{getFuelUnitLabel(settings)}</div>
          <div className="text-2xl font-bold text-gray-800">
            ${stats.averageCostPerGallon > 0 ? stats.averageCostPerGallon.toFixed(3) : '0.000'}
          </div>
        </div>

        {/* Average Cost per Distance */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Avg $/{getDistanceUnitLabel(settings)}</div>
          <div className="text-2xl font-bold text-blue-700">
            ${stats.averageCostPerMile > 0 ? stats.averageCostPerMile.toFixed(3) : '0.000'}
          </div>
        </div>
      </div>

      {/* MPG Trend Indicator */}
      {stats.averageMPG > 0 && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">MPG Range:</span>
            <div className="flex items-center gap-2">
              <span className="text-orange-600 font-medium">{stats.worstMPG.toFixed(1)}</span>
              <div className="w-32 h-2 bg-gradient-to-r from-orange-300 via-yellow-300 to-green-400 rounded-full"></div>
              <span className="text-green-700 font-medium">{stats.bestMPG.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
