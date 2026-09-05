import React from 'react';
import {
  GitFork,
  AlertTriangle,
  Zap,
  TrendingUp,
  Package,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Flame
} from 'lucide-react';
import { MonthlyBusinessAnalysis } from '../types';

interface LinkagesTabProps {
  analysis: MonthlyBusinessAnalysis;
}

export const LinkagesTab: React.FC<LinkagesTabProps> = ({ analysis }) => {
  const { linkages, skuAnalysis, totalSalesRevenue, totalAdSpendUsd, totalAdSales } = analysis;

  const fmtCurrency = (n: number | null | undefined) =>
    n !== null && n !== undefined
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  const fmtPct = (n: number | null | undefined) =>
    n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A';

  const {
    salesAdLinkage,
    adProfitLinkage,
    inventorySalesLinkage,
    agingStorageLinkage,
    salesReturnLinkage,
    inventoryAdLinkage,
    salesGrowthAdProfitScenario
  } = linkages;

  return (
    <div className="space-y-6">
      {/* 1. Top Concept Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
          <GitFork className="w-4 h-4" />
          <span>系统核心引擎 • 五大业务模块跨界联动诊断</span>
        </div>
        <h2 className="text-xl font-bold mt-1 tracking-tight">
          打破孤岛数据：销售 × 广告 × 库存 × 仓储 × 退货
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          单看广告可能觉得 ROAS 高，但结合库存却发现即将断货；单看销售额可能在增长，但结合仓储和高库龄却发现利润被侵蚀。
          本模块深入揭示【利润到底被什么吃掉了】与【增长是否真实健康】。
        </p>
      </div>

      {/* 2. Critical Conflict Alert: Ad vs Inventory */}
      {inventoryAdLinkage.conflictSkus.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 shadow-xs">
          <div className="flex items-start space-x-3">
            <Flame className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-rose-900 tracking-tight">
                  【严重经营矛盾警告】广告高投放与库存断货冲突
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  P0 级紧急干预
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1">
                检测到以下 SKU 广告月度花费巨大，但<strong>在售可用库存已处于严重断货边缘</strong>！
                继续推流将造成付费点击白白浪费、断货后自然排名断崖式跌落：
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventoryAdLinkage.conflictSkus.map((sku) => {
                  const item = skuAnalysis.find((s) => s.sku === sku);
                  return (
                    <div key={sku} className="bg-white p-3 rounded-lg border border-rose-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{sku}</span>
                        <span className="text-rose-600">在售仅剩: {item?.availableInventory || 0} 件</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px] mt-1">
                        <span>月广告花费: <strong className="text-indigo-600">{fmtCurrency(item?.adSpend)}</strong></span>
                        <span>月销量: {item?.unitsSold} 件</span>
                      </div>
                      <div className="mt-2 text-[11px] font-semibold text-rose-700 bg-rose-50 p-1.5 rounded">
                        ⚡ 紧急动作：立即压降广告预算 50% 并暂停宽泛大词，启动紧急移库或海运加速！
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Linkage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linkage 1: Sales vs Ad */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm mb-2">
              <Zap className="w-4 h-4" />
              <span>1. 销售 × 广告联动 (驱动力诊断)</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              评估销售增长是源于自然流量红利，还是由高额广告强行催肥。
            </p>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">全店广告占销售比重 (Spend / Revenue)</span>
                <span className="font-bold text-slate-900">{fmtPct(salesAdLinkage.adSpendToSalesPct)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">广告归因销售占比</span>
                <span className="font-bold text-indigo-600">{fmtPct(salesAdLinkage.adSalesSharePct)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">全店自然销售拉动占比</span>
                <span className="font-bold text-emerald-600">{fmtPct(salesAdLinkage.organicSalesSharePct)}</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900">
              <strong>诊断结论：</strong> {salesAdLinkage.isAdDriven ? '当前销售对广告依赖较高，需提防自然流量流失。' : '当前自然销售与广告拉动比例平衡，健康度佳。'}
            </div>
          </div>
        </div>

        {/* Linkage 2: Ad vs Profit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>2. 广告 × 利润联动 (投放机会与风险)</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              甄别“高毛利但欠缺推广”的潜力机会，以及“高广告却不赚钱”的负面标的。
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
                <span className="font-bold block">🌟 值得加大广告预算 SKU (高毛利-低广告-库存足)：</span>
                <span className="font-semibold text-blue-700 mt-0.5 block">
                  {adProfitLinkage.highProfitLowAdSkus.join(', ') || '暂无明显标的'}
                </span>
                <span className="text-[11px] text-blue-600 mt-0.5 block">
                  动因：毛利率超40%且备货充裕，因广告预算低导致流量受限，加大预算有望成为新增长点。
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                <span className="font-bold block">⚠️ 广告吞噬利润 SKU (高广告-低利润)：</span>
                <span className="font-semibold text-rose-700 mt-0.5 block">
                  {adProfitLinkage.highAdLowProfitSkus.join(', ') || '各SKU广告利润平衡良好'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linkage 3: Sales vs Inventory */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm mb-2">
              <Package className="w-4 h-4" />
              <span>3. 销售 × 库存联动 (动销与断货风险)</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              对比产品日均发货速度与可用库存，预判断货断档与积压滞销。
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="font-bold text-rose-900 block">🔴 断货高危预警 SKU：</span>
                <span className="font-bold text-rose-700 mt-0.5 block">
                  {inventorySalesLinkage.stockoutSkus.join(', ') || '全店无紧急断货风险'}
                </span>
                <span className="text-[11px] text-rose-600 block mt-0.5">
                  特征：月销量高但当前可用库存仅能支撑少于15天，需启动紧急调拨。
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-900 block">🟡 滞销积压建议清仓 SKU：</span>
                <span className="font-bold text-amber-700 mt-0.5 block">
                  {inventorySalesLinkage.liquidateSkus.join(', ') || '暂无积压'}
                </span>
                <span className="text-[11px] text-amber-600 block mt-0.5">
                  特征：周转天数超180天且存在长库龄，占用资金并持续产生仓储费。
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linkage 4: Aging vs Storage Fee */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>4. 库龄 × 仓储费用联动 (惩罚性费用溯源)</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              拆解仓储费中超期罚息的真实责任 SKU，明确止血目标。
            </p>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">365天以上高库龄数量：</span>
                <span className="font-bold text-rose-600">{agingStorageLinkage.highAging365PlusQty} 件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">高库龄仓储罚款占总仓储费：</span>
                <span className="font-bold text-rose-600">{fmtPct(agingStorageLinkage.highAgingStorageFeePct)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold block">主要责任 SKU：</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {agingStorageLinkage.topFeeCulpritSkus.join(', ') || '无'}
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <strong>止血建议：</strong> 450天以上滞留件下月若不清除，仍将产生超千元惩罚性仓储费，建议采取降价25%清仓或委托海外仓分销。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
