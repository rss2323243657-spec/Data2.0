import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { MonthlyBusinessAnalysis, SkuAnalysisResult } from '../types';

interface ProfitQuadrantTabProps {
  analysis: MonthlyBusinessAnalysis;
}

export const ProfitQuadrantTab: React.FC<ProfitQuadrantTabProps> = ({ analysis }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { skuAnalysis, totalSalesRevenue, operatingProfitUsd, operatingMarginPct } = analysis;

  const fmtCurrency = (n: number | null | undefined) =>
    n !== null && n !== undefined
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  const fmtPct = (n: number | null | undefined) =>
    n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A';

  const quadrants = [
    {
      id: '高广告-高利润',
      title: '高广告 - 高利润 (明星爆款)',
      desc: '全店核心现金流支柱，广告效率极高，维持预算，筑牢供应防线',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      count: skuAnalysis.filter((s) => s.adProfitQuadrant === '高广告-高利润').length
    },
    {
      id: '低广告-高利润',
      title: '低广告 - 高利润 (潜力明珠)',
      desc: '自身毛利丰厚且库存充足，广告投入严重不足，应果断加预算放量',
      color: 'bg-blue-50 text-blue-800 border-blue-300',
      badgeColor: 'bg-blue-600 text-white',
      count: skuAnalysis.filter((s) => s.adProfitQuadrant === '低广告-高利润').length
    },
    {
      id: '高广告-低利润',
      title: '高广告 - 低利润 (利润吞噬者)',
      desc: '广告费用严重侵蚀净利，需紧急收窄出价，剔除低转化宽泛词',
      color: 'bg-rose-50 text-rose-800 border-rose-300',
      badgeColor: 'bg-rose-600 text-white',
      count: skuAnalysis.filter((s) => s.adProfitQuadrant === '高广告-低利润').length
    },
    {
      id: '低广告-低利润',
      title: '低广告 - 低利润 (平庸/滞销品)',
      desc: '动销弱且毛利薄，需考虑套餐捆绑、清库存或停止补货',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      badgeColor: 'bg-slate-600 text-white',
      count: skuAnalysis.filter((s) => s.adProfitQuadrant === '低广告-低利润').length
    }
  ];

  const filteredSkus = skuAnalysis.filter((s) => {
    const matchesQuadrant = selectedQuadrant === 'all' || s.adProfitQuadrant === selectedQuadrant;
    const matchesSearch =
      s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.spu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesQuadrant && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Summary Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            SKU / SPU 经营利润核算与【广告 × 利润】四象限战略模型
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            将各单品的实际经营利润与广告投放力度进行交叉定位，指导针对性投放与选品决策
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <div>
            <div className="text-[11px] text-slate-500">全店总经营利润</div>
            <div className="text-lg font-black text-emerald-600">{fmtCurrency(operatingProfitUsd)}</div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-500">综合经营利润率</div>
            <div className="text-lg font-black text-slate-800">{fmtPct(operatingMarginPct)}</div>
          </div>
        </div>
      </div>

      {/* 2. Four Quadrants Interactive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quadrants.map((quad) => {
          const isSelected = selectedQuadrant === quad.id;
          return (
            <div
              key={quad.id}
              onClick={() => setSelectedQuadrant(isSelected ? 'all' : quad.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-xs'
              } ${quad.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{quad.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${quad.badgeColor}`}>
                  {quad.count} 个SKU
                </span>
              </div>
              <p className="text-[11px] mt-2 leading-relaxed opacity-90">{quad.desc}</p>
              <div className="mt-3 text-[11px] font-semibold flex items-center space-x-1">
                <span>{isSelected ? '点击取消筛选' : '点击筛选此类SKU'}</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SKU P&L Comprehensive Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900">SKU 全成本与经营贡献利润明细表</h3>
            {selectedQuadrant !== 'all' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                已筛选：{selectedQuadrant}
              </span>
            )}
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
                <th className="py-2.5 px-3 font-semibold">SKU / 所属SPU</th>
                <th className="py-2.5 px-2 font-semibold text-right">销售收入 (ERP)</th>
                <th className="py-2.5 px-2 font-semibold text-right">产品成本</th>
                <th className="py-2.5 px-2 font-semibold text-right">头程运费</th>
                <th className="py-2.5 px-2 font-semibold text-right">广告花费</th>
                <th className="py-2.5 px-2 font-semibold text-right">仓储费用</th>
                <th className="py-2.5 px-2 font-semibold text-right">退货损失</th>
                <th className="py-2.5 px-2 font-semibold text-right">经营贡献利润</th>
                <th className="py-2.5 px-2 font-semibold text-right">利润率</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">战略象限定位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkus.map((s) => (
                <tr key={s.sku} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{s.sku}</span>
                    <span className="text-[10px] text-slate-400 block">{s.spu} • {s.productType}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                    {fmtCurrency(s.salesRevenue)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    {fmtCurrency(s.productCost)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    {fmtCurrency(s.firstLegCost)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-indigo-600 font-medium">
                    {fmtCurrency(s.adSpend)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-amber-600">
                    {fmtCurrency(s.storageFee)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-rose-600">
                    {fmtCurrency(s.returnLossAmount)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-600">
                    {fmtCurrency(s.operatingProfit)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-black text-slate-900">
                    {fmtPct(s.operatingMarginPct)}
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
