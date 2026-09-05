import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { MonthlyBusinessAnalysis } from '../types';

interface OverviewTabProps {
  analysis: MonthlyBusinessAnalysis;
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ analysis, onNavigateTab }) => {
  const {
    month,
    totalSalesRevenue,
    totalOrders,
    totalUnitsSold,
    avgOrderValue,
    totalProductCostUsd,
    totalFirstLegUsd,
    totalAdSpendUsd,
    totalStorageFeeUsd,
    otherExpensesUsd,
    totalOperatingCostUsd,
    operatingProfitUsd,
    operatingMarginPct,
    totalAdSales,
    overallRoas,
    overallAcos,
    adSpendToSalesPct,
    overallReturnRatePct,
    validReturnQty,
    validReturnAmount,
    keepItQty,
    keepItAmount,
    sellerResponsiblePct,
    totalInventoryQty,
    availableInventoryQty,
    highAging365PlusQty,
    highAgingStorageFeePct,
    healthScore,
    linkages,
    comparison,
    dataQuality
  } = analysis;

  const fmtCurrency = (n: number | null | undefined) =>
    n !== null && n !== undefined
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  const fmtPct = (n: number | null | undefined) =>
    n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A';

  const momSalesStr = comparison?.salesMomPct !== null && comparison?.salesMomPct !== undefined
    ? `${comparison.salesMomPct > 0 ? '+' : ''}${comparison.salesMomPct.toFixed(1)}%`
    : null;
  const momProfitStr = comparison?.profitMomPct !== null && comparison?.profitMomPct !== undefined
    ? `${comparison.profitMomPct > 0 ? '+' : ''}${comparison.profitMomPct.toFixed(1)}%`
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Management Executive Summary Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-800/80 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                管理层经营摘要
              </span>
              <span className="text-xs text-blue-200">月度核心诊断与战略定调</span>
            </div>
            <h2 className="text-xl font-bold mt-1 tracking-tight">
              {month} Walmart 店铺月度经营结论
            </h2>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-xs">
            <div className="text-right">
              <div className="text-xs text-blue-200">综合经营健康度</div>
              <div className="text-2xl font-black text-white">{healthScore.total} <span className="text-sm font-normal text-blue-200">/ 100</span></div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="px-2.5 py-1 rounded-md text-xs font-bold bg-white text-blue-900 shadow-xs">
              {healthScore.grade}
            </div>
          </div>
        </div>

        {/* 5-10 Sentences Management Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-blue-50/90 leading-relaxed">
          <div className="space-y-2">
            <p>
              • <strong>经营总评：</strong> 本月实现销售收入 <strong className="text-white">{fmtCurrency(totalSalesRevenue)}</strong>，贡献经营利润 <strong className="text-emerald-300">{fmtCurrency(operatingProfitUsd)}</strong>，经营利润率达 <strong className="text-emerald-300">{fmtPct(operatingMarginPct)}</strong>。
            </p>
            <p>
              • <strong>增长态势：</strong> 较上月销售环比 {momSalesStr ? <strong className="text-white">{momSalesStr}</strong> : '保持稳定'}，利润环比 {momProfitStr ? <strong className="text-emerald-300">{momProfitStr}</strong> : '保持良好'}，符合【{linkages.salesGrowthAdProfitScenario.type}】特征。
            </p>
            <p>
              • <strong>广告效能：</strong> 广告总支出 <strong className="text-white">{fmtCurrency(totalAdSpendUsd)}</strong>，撬动归因销售 <strong className="text-white">{fmtCurrency(totalAdSales)}</strong>，综合 ROAS 为 <strong className="text-emerald-300">{overallRoas ? overallRoas.toFixed(2) : 'N/A'}</strong>，广告占销售比重为 {fmtPct(adSpendToSalesPct)}。
            </p>
          </div>
          <div className="space-y-2">
            <p>
              • <strong>退货与损失：</strong> 有效退货 {validReturnQty} 件（退货率 {fmtPct(overallReturnRatePct)}），其中 Keep It 造成直接损失 <strong className="text-amber-300">{fmtCurrency(keepItAmount)}</strong>，卖家责任占比达 {fmtPct(sellerResponsiblePct)}。
            </p>
            <p>
              • <strong>库存与仓储隐患：</strong> 365天以上超长库龄商品占总仓储费达 <strong className="text-rose-300">{fmtPct(highAgingStorageFeePct)}</strong>，部分断货高危SKU存在广告竞价过冲冲突。
            </p>
            <p>
              • <strong>下月战略动作：</strong> 立即压降断货SKU广告预算，对450天以上滞销双臂支架开展降价清仓，同时加大高毛利单臂支架与台灯的广告投放。
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>数据源可信度：<strong>{dataQuality.credibilityLevel}</strong></span>
            <span>•</span>
            <span>口径：实际经营贡献利润 (未含未提供的平台佣金与税费)</span>
          </div>
          <button
            onClick={() => onNavigateTab('report')}
            className="text-xs font-semibold text-white bg-blue-700/60 hover:bg-blue-600 px-3 py-1 rounded-md transition-colors flex items-center space-x-1"
          >
            <span>查看完整17章诊断报告</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Urgent Risk Highlights & Actions (Top Banner) */}
      {(linkages.inventoryAdLinkage.conflictSkus.length > 0 || highAgingStorageFeePct > 30) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <div className="font-bold flex items-center space-x-2">
              <span>系统发现需要立即干预的经营异常 (P0 / P1)</span>
            </div>
            <div className="mt-1 space-y-1 text-amber-800">
              {linkages.inventoryAdLinkage.conflictSkus.length > 0 && (
                <div>
                  • <strong>【广告与库存策略严重冲突】</strong> SKU <code>{linkages.inventoryAdLinkage.conflictSkus.join(', ')}</code> 广告投入大但在售库存即将耗尽，极易造成引流点击后断货空转，建议立即压降广告出价！
                </div>
              )}
              {highAgingStorageFeePct > 20 && (
                <div>
                  • <strong>【长期仓储费恶性侵蚀利润】</strong> 365天以上高库龄仓储费占总仓储费达 <strong>{fmtPct(highAgingStorageFeePct)}</strong>，主因源于 <code>{linkages.agingStorageLinkage.topFeeCulpritSkus.join(', ') || '长库龄商品'}</code>，建议当期启动特价清仓！
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('linkages')}
            className="text-xs px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium shrink-0"
          >
            查看跨模块联动
          </button>
        </div>
      )}

      {/* 3. Core KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sales Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>店铺销售收入 (ERP)</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {fmtCurrency(totalSalesRevenue)}
          </div>
          <div className="flex items-center space-x-2 mt-2 text-xs">
            {comparison?.salesMomPct !== null && comparison?.salesMomPct !== undefined ? (
              <span className={`inline-flex items-center font-medium ${comparison.salesMomPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {comparison.salesMomPct >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                环比 {momSalesStr}
              </span>
            ) : (
              <span className="text-slate-400">环比: 基准月</span>
            )}
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{totalOrders} 单 / {totalUnitsSold} 件</span>
          </div>
        </div>

        {/* KPI 2: Operating Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>经营贡献利润 / 利润率</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {fmtCurrency(operatingProfitUsd)}
          </div>
          <div className="flex items-center space-x-2 mt-2 text-xs">
            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-semibold">
              利润率 {fmtPct(operatingMarginPct)}
            </span>
            {comparison?.marginDiffPts !== null && comparison?.marginDiffPts !== undefined && (
              <span className={`font-medium ${comparison.marginDiffPts >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {comparison.marginDiffPts >= 0 ? '+' : ''}{comparison.marginDiffPts.toFixed(1)} pts
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Ad Spend & ROAS */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>广告总花费 / 综合ROAS</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {fmtCurrency(totalAdSpendUsd)}
          </div>
          <div className="flex items-center space-x-2 mt-2 text-xs">
            <span className="px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 font-semibold">
              ROAS {overallRoas ? overallRoas.toFixed(2) : 'N/A'}
            </span>
            <span className="text-slate-500">ACOS {fmtPct(overallAcos)}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">占销售 {fmtPct(adSpendToSalesPct)}</span>
          </div>
        </div>

        {/* KPI 4: Storage & Aging Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>仓储总费用 / 高库龄罚息</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {fmtCurrency(totalStorageFeeUsd)}
          </div>
          <div className="flex items-center space-x-2 mt-2 text-xs">
            <span className={`px-1.5 py-0.5 rounded-sm font-semibold ${highAgingStorageFeePct > 30 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
              365+天罚息 {fmtPct(highAgingStorageFeePct)}
            </span>
            <span className="text-slate-500">在库 {totalInventoryQty} 件</span>
          </div>
        </div>
      </div>

      {/* 4. Financial Cost Structure & Profit Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost & Profit Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">店铺成本结构与利润拆解 (USD)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                基于 ERP 销售收入与各大成本项的实际流向核算
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              销售额基数: {fmtCurrency(totalSalesRevenue)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Sales Revenue Baseline */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-semibold">
              <span className="text-slate-800">1. 店铺销售总额 (ERP有效已发货订单)</span>
              <span className="text-sm text-slate-900">{fmtCurrency(totalSalesRevenue)} (100.0%)</span>
            </div>

            {/* Product Cost */}
            <div className="flex items-center justify-between py-1 px-2 text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>2. 产品采购成本 (COGS)</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{fmtCurrency(totalProductCostUsd)}</span>
                <span className="text-slate-400 ml-1.5">({fmtPct((totalProductCostUsd / Math.max(1, totalSalesRevenue)) * 100)})</span>
              </div>
            </div>

            {/* First-leg Freight */}
            <div className="flex items-center justify-between py-1 px-2 text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>3. 头程物流运费 (Freight)</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{fmtCurrency(totalFirstLegUsd)}</span>
                <span className="text-slate-400 ml-1.5">({fmtPct((totalFirstLegUsd / Math.max(1, totalSalesRevenue)) * 100)})</span>
              </div>
            </div>

            {/* Ad Spend */}
            <div className="flex items-center justify-between py-1 px-2 text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>4. Walmart 广告花费 (Ad Spend)</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{fmtCurrency(totalAdSpendUsd)}</span>
                <span className="text-slate-400 ml-1.5">({fmtPct((totalAdSpendUsd / Math.max(1, totalSalesRevenue)) * 100)})</span>
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center justify-between py-1 px-2 text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>5. Walmart 仓储费用 (Storage Fee)</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{fmtCurrency(totalStorageFeeUsd)}</span>
                <span className="text-slate-400 ml-1.5">({fmtPct((totalStorageFeeUsd / Math.max(1, totalSalesRevenue)) * 100)})</span>
              </div>
            </div>

            {/* Other Expenses */}
            <div className="flex items-center justify-between py-1 px-2 text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>6. 其他经营杂费 (Other Expenses)</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{fmtCurrency(otherExpensesUsd)}</span>
                <span className="text-slate-400 ml-1.5">({fmtPct((otherExpensesUsd / Math.max(1, totalSalesRevenue)) * 100)})</span>
              </div>
            </div>

            {/* Net Operating Contribution Profit */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between font-bold text-emerald-900 mt-2">
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>店铺月度经营贡献利润 (Operating Contribution Profit)</span>
              </span>
              <div className="text-right">
                <span className="text-base text-emerald-700">{fmtCurrency(operatingProfitUsd)}</span>
                <span className="text-xs text-emerald-600 ml-2">({fmtPct(operatingMarginPct)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 100-point Health Score Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">健康度多维评分体系</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {healthScore.total} 分
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              权重：销售20 | 利润25 | 广告15 | 库存15 | 退货10 | 仓储10 | 结构5
            </p>

            <div className="mt-4 space-y-3">
              {/* Sales Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">销售表现 (满分20)</span>
                  <span className="font-semibold text-slate-800">{healthScore.breakdown.salesScore} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(healthScore.breakdown.salesScore / 20) * 100}%` }} />
                </div>
              </div>

              {/* Profit Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">利润表现 (满分25)</span>
                  <span className="font-semibold text-emerald-600">{healthScore.breakdown.profitScore} / 25</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(healthScore.breakdown.profitScore / 25) * 100}%` }} />
                </div>
              </div>

              {/* Ad Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">广告表现 (满分15)</span>
                  <span className="font-semibold text-indigo-600">{healthScore.breakdown.adScore} / 15</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(healthScore.breakdown.adScore / 15) * 100}%` }} />
                </div>
              </div>

              {/* Inventory Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">库存表现 (满分15)</span>
                  <span className="font-semibold text-amber-600">{healthScore.breakdown.inventoryScore} / 15</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: `${(healthScore.breakdown.inventoryScore / 15) * 100}%` }} />
                </div>
              </div>

              {/* Return Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">退货表现 (满分10)</span>
                  <span className="font-semibold text-teal-600">{healthScore.breakdown.returnScore} / 10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${(healthScore.breakdown.returnScore / 10) * 100}%` }} />
                </div>
              </div>

              {/* Storage Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">仓储表现 (满分10)</span>
                  <span className="font-semibold text-orange-600">{healthScore.breakdown.storageScore} / 10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600 rounded-full" style={{ width: `${(healthScore.breakdown.storageScore / 10) * 100}%` }} />
                </div>
              </div>

              {/* Product Mix Score */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">产品结构 (满分5)</span>
                  <span className="font-semibold text-purple-600">{healthScore.breakdown.productStructureScore} / 5</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(healthScore.breakdown.productStructureScore / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            评级标准：90-100优秀 | 80-89健康 | 70-79正常 | 60-69需重点改善 | 60以下高风险
          </div>
        </div>
      </div>
    </div>
  );
};
