import React, { useState } from 'react';
import {
  Search,
  Zap,
  TrendingUp,
  AlertCircle,
  PieChart,
  BarChart2,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { MonthlyBusinessAnalysis } from '../types';

interface SalesAdTabProps {
  analysis: MonthlyBusinessAnalysis;
}

export const SalesAdTab: React.FC<SalesAdTabProps> = ({ analysis }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'salesRevenue' | 'adSpend' | 'roas' | 'acos'>('salesRevenue');
  const [sortAsc, setSortAsc] = useState(false);

  const {
    totalSalesRevenue,
    totalAdSpendUsd,
    totalAdSales,
    overallRoas,
    overallAcos,
    totalImpressions,
    totalClicks,
    overallCtr,
    overallCpc,
    overallCvr,
    adSpendToSalesPct,
    productTypeShare,
    spuAnalysis,
    skuAnalysis,
    salesConcentrationTop5Pct
  } = analysis;

  const fmtCurrency = (n: number | null | undefined) =>
    n !== null && n !== undefined
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  const fmtPct = (n: number | null | undefined) =>
    n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A';

  const filteredSkus = skuAnalysis.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.sku.toLowerCase().includes(term) ||
      s.spu.toLowerCase().includes(term) ||
      s.productType.toLowerCase().includes(term) ||
      s.productTitle.toLowerCase().includes(term)
    );
  });

  filteredSkus.sort((a, b) => {
    let valA = (a as any)[sortField] || 0;
    let valB = (b as any)[sortField] || 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Banner: Section 2 & 27 Strict Compliance */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>严格口径准则：</strong> 广告报表（Item Performance）仅用于核算广告总花费及归因拉动效果，
          <strong>严禁直接把广告归因销售额 (${fmtCurrency(totalAdSales)}) 当作店铺总销售额 (${fmtCurrency(totalSalesRevenue)})</strong>；
          全店实际销售必须严格以 ERP 真实发货订单为准。
        </div>
      </div>

      {/* 1. Advertising KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">广告总花费 (Spend)</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">{fmtCurrency(totalAdSpendUsd)}</span>
          <span className="text-[11px] text-slate-500">占销售比重 {fmtPct(adSpendToSalesPct)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">广告归因销售 (Ad Sales)</span>
          <span className="text-lg font-bold text-indigo-600 mt-0.5 block">{fmtCurrency(totalAdSales)}</span>
          <span className="text-[11px] text-indigo-500">14天官方归因口径</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">综合广告 ROAS</span>
          <span className="text-lg font-bold text-emerald-600 mt-0.5 block">{overallRoas ? overallRoas.toFixed(2) : 'N/A'}</span>
          <span className="text-[11px] text-emerald-600">产出投入比</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">综合广告 ACOS</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">{fmtPct(overallAcos)}</span>
          <span className="text-[11px] text-slate-500">花费/广告销售</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">点击率 CTR / 平均CPC</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">{fmtPct(overallCtr)}</span>
          <span className="text-[11px] text-slate-500">CPC: {fmtCurrency(overallCpc)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">转化率 CVR / 曝光量</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">{fmtPct(overallCvr)}</span>
          <span className="text-[11px] text-slate-500">曝光: {totalImpressions.toLocaleString()}</span>
        </div>
      </div>

      {/* 2. Sales Structure: Category & SPU Rollup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Type Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">产品品类 (Product Type) 销售分布</h3>
            <PieChart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-2.5 text-xs">
            {productTypeShare.map((pt) => (
              <div key={pt.productType} className="border-b border-slate-100 pb-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{pt.productType}</span>
                  <span className="text-slate-900">{fmtCurrency(pt.sales)} ({fmtPct(pt.pct)})</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                  <span>经营利润: <strong className="text-emerald-600">{fmtCurrency(pt.profit)}</strong></span>
                  <span className="text-slate-400">利润率: {pt.sales > 0 ? fmtPct((pt.profit / pt.sales) * 100) : 'N/A'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pt.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong>销售集中度：</strong> 前5大SKU贡献全店 <strong>{fmtPct(salesConcentrationTop5Pct)}</strong> 的销售额。
            {salesConcentrationTop5Pct > 75 ? (
              <span className="text-rose-600 font-semibold block mt-0.5">
                ⚠️ 处于高度集中风险区，建议积极拓充第二梯队产品。
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold block mt-0.5">
                ✅ 梯队分布均衡，抗风险能力优良。
              </span>
            )}
          </div>
        </div>

        {/* SPU Performance List */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">SPU 汇总表现与广告投入</h3>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-2.5 font-semibold">SPU 代码</th>
                  <th className="py-2 px-2 font-semibold">品类</th>
                  <th className="py-2 px-2 font-semibold text-right">销售额 (占比)</th>
                  <th className="py-2 px-2 font-semibold text-right">销量</th>
                  <th className="py-2 px-2 font-semibold text-right">广告花费 (占比)</th>
                  <th className="py-2 px-2 font-semibold text-right">经营利润</th>
                  <th className="py-2 px-2 font-semibold text-right">利润率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spuAnalysis.map((spu) => (
                  <tr key={spu.spu} className="hover:bg-slate-50/80">
                    <td className="py-2 px-2.5 font-semibold text-slate-900">
                      {spu.spu}
                      <span className="text-[10px] text-slate-400 block font-normal">{spu.skuCount} 个子SKU</span>
                    </td>
                    <td className="py-2 px-2 text-slate-600">{spu.productType}</td>
                    <td className="py-2 px-2 text-right font-medium text-slate-900">
                      {fmtCurrency(spu.salesRevenue)}
                      <span className="text-[10px] text-slate-400 block">{fmtPct(spu.salesSharePct)}</span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-700">{spu.unitsSold}</td>
                    <td className="py-2 px-2 text-right text-indigo-600 font-medium">
                      {fmtCurrency(spu.adSpend)}
                      <span className="text-[10px] text-slate-400 block">{fmtPct(spu.adSharePct)}</span>
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-emerald-600">
                      {fmtCurrency(spu.operatingProfit)}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-slate-800">
                      {fmtPct(spu.operatingMarginPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. SKU Detailed Advertising & Performance Table */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">SKU 明细广告与转化全景透视表</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              点击表头可对销售、广告、ROAS、ACOS排序；分母为0时均规范显示 N/A
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索 SKU / SPU / 品类..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">SKU / Item ID</th>
                <th className="py-2.5 px-2 font-semibold">所属SPU / 品名</th>
                <th
                  onClick={() => handleSort('salesRevenue')}
                  className="py-2.5 px-2 font-semibold text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>实际销售额 (ERP)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-2.5 px-2 font-semibold text-right">发货销量</th>
                <th
                  onClick={() => handleSort('adSpend')}
                  className="py-2.5 px-2 font-semibold text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <span className="inline-flex items-center space-x-1 justify-end text-indigo-700">
                    <span>广告花费 (Ad Spend)</span>
                    <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  </span>
                </th>
                <th className="py-2.5 px-2 font-semibold text-right">广告销售</th>
                <th
                  onClick={() => handleSort('roas')}
                  className="py-2.5 px-2 font-semibold text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <span className="inline-flex items-center space-x-1 justify-end text-emerald-700">
                    <span>ROAS</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('acos')}
                  className="py-2.5 px-2 font-semibold text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>ACOS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-2.5 px-2 font-semibold text-right">CTR / CPC</th>
                <th className="py-2.5 px-2 font-semibold text-right">CVR</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">广告象限定位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkus.map((s) => (
                <tr key={s.sku} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{s.sku}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{s.itemId || '无Item ID'}</span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-600 max-w-xs">
                    <span className="font-medium text-slate-800 block truncate">{s.productTitle}</span>
                    <span className="text-[10px] text-slate-400 block">{s.spu} • {s.productType}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                    {fmtCurrency(s.salesRevenue)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-700">{s.unitsSold}</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-indigo-600">
                    {fmtCurrency(s.adSpend)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-700">
                    {fmtCurrency(s.adSales)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-600">
                    {s.roas ? s.roas.toFixed(2) : 'N/A'}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-700">
                    {s.acos !== null ? fmtPct(s.acos) : 'N/A'}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    <div>{s.ctr !== null ? fmtPct(s.ctr) : 'N/A'}</div>
                    <div className="text-[10px] text-slate-400">{s.cpc !== null ? fmtCurrency(s.cpc) : 'N/A'}</div>
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-700 font-medium">
                    {s.cvr !== null ? fmtPct(s.cvr) : 'N/A'}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.adProfitQuadrant === '高广告-高利润'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.adProfitQuadrant === '高广告-低利润'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : s.adProfitQuadrant === '低广告-高利润'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {s.adProfitQuadrant}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
