import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  FileText,
  RotateCcw,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenImportModal: () => void;
  onLoadSampleData: () => void;
  onOpenManualSettings: () => void;
  onExportReport: () => void;
  month: string;
  exchangeRate: number;
  healthScore: number;
  healthGrade: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenImportModal,
  onLoadSampleData,
  onOpenManualSettings,
  onExportReport,
  month,
  exchangeRate,
  healthScore,
  healthGrade
}) => {
  const tabs = [
    { id: 'overview', label: '经营概览与评分' },
    { id: 'sales_ad', label: '销售与广告分析' },
    { id: 'inventory_storage', label: '库存与仓储分析' },
    { id: 'returns', label: '退货与损失分析' },
    { id: 'profit_quadrant', label: 'SKU/SPU利润与四象限' },
    { id: 'linkages', label: '五大跨模块联动' },
    { id: 'report', label: '完整月度经营报告 (17章)' }
  ];

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case '优秀':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case '健康':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case '正常':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case '需要重点改善':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-lg tracking-wider">
              WMT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Walmart 店铺月度经营分析与利润诊断系统
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                  US Marketplace 专家版
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                <span>分析周期：<strong className="text-slate-800 font-semibold">{month}</strong></span>
                <span>•</span>
                <span className="flex items-center space-x-1 cursor-pointer hover:text-blue-600" onClick={onOpenManualSettings} title="点击修改参数与汇率">
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  <span>用户汇率：<strong>1 USD = {exchangeRate.toFixed(2)} RMB</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Health Score Pill */}
            <div className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border ${getGradeBadge(healthGrade)}`}>
              <span>经营健康度：</span>
              <span className="font-bold text-sm">{healthScore}分</span>
              <span>({healthGrade})</span>
            </div>

            {/* Load Sample Data */}
            <button
              id="btn-load-sample"
              onClick={onLoadSampleData}
              type="button"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="一键加载官方8月及7月实操对照数据集"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>载入实测样例</span>
            </button>

            {/* Data Ingestion & Manual Input */}
            <button
              id="btn-open-import"
              onClick={onOpenImportModal}
              type="button"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>导入数据/参数</span>
            </button>

            {/* Export Report */}
            <button
              id="btn-export-report"
              onClick={onExportReport}
              type="button"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>导出报告</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
