import { useState } from 'react';
import { ScanResult } from '@/types';
import { JsonViewer } from './JsonViewer';

interface ScanResultsProps {
  results: ScanResult;
}

export function ScanResults({ results }: ScanResultsProps) {
  const [viewMode, setViewMode] = useState<'styled' | 'json'>('styled');
  const violationsCount = results.violations?.length || 0;
  const passesCount = results.passes?.length || 0;
  const incompleteCount = results.incomplete?.length || 0;
  const inapplicableCount = results.inapplicable?.length || 0;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Scan Results</h2>
        <div className="flex items-center gap-4">
          {results.sampleInfo && (
            <div className="text-sm text-gray-600">
              Sample: <span className="font-medium">{results.sampleInfo.name}</span>
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('styled')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'styled'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Styled View
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'json'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 JSON View
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'styled' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{violationsCount}</div>
              <div className="text-sm text-red-700">Violations</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{passesCount}</div>
              <div className="text-sm text-green-700">Passes</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{incompleteCount}</div>
              <div className="text-sm text-yellow-700">Incomplete</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{inapplicableCount}</div>
              <div className="text-sm text-gray-700">Inapplicable</div>
            </div>
          </div>

          {/* Violations */}
          {violationsCount > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-red-500">🚨</span>
                Accessibility Violations
              </h3>
              <div className="space-y-3">
                {results.violations?.map((violation, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">{violation.id}</h4>
                        <p className="text-sm text-red-700 mt-1">{violation.description}</p>
                        <div className="mt-2">
                          <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded">
                            Impact: {violation.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                    {violation.nodes?.map((node, nodeIndex) => (
                      <div key={nodeIndex} className="mt-3">
                        {node.failureSummary && (
                          <div className="bg-red-100 p-3 rounded text-sm font-mono text-red-800">
                            {node.failureSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passes */}
          {passesCount > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Passed Tests
              </h3>
              <div className="space-y-2">
                {results.passes?.map((pass, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                    <div className="font-medium text-green-900">{pass.id}</div>
                    <div className="text-sm text-green-700">{pass.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incomplete */}
          {incompleteCount > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-yellow-500">⚠️</span>
                Incomplete Tests
              </h3>
              <div className="space-y-2">
                {results.incomplete?.map((incomplete, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                    <div className="font-medium text-yellow-900">{incomplete.id}</div>
                    <div className="text-sm text-yellow-700">{incomplete.description}</div>
                    <div className="text-xs text-yellow-600 mt-1">Requires manual review</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <JsonViewer data={results} title="Accessibility Scan Results" />
      )}
    </div>
  );
}