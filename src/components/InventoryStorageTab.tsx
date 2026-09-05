import React from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { MonthlyBusinessAnalysis } from '../types';

interface InventoryStorageTabProps {
  analysis: MonthlyBusinessAnalysis;
}

export const InventoryStorageTab: React.FC<InventoryStorageTabProps> = ({ analysis }) => {
  const {
    totalInventoryQty,
    availableInventoryQty,
    reservedInventoryQty,
    inboundInventoryQty,
    highAging365PlusQty,
    totalStorageFeeUsd,
    normalStorageFee,
    storageFee365to450,
    storageFee450Plus,
    normalStoragePct,
    storageFee365to450Pct,
    storageFee450PlusPct,
    highAgingStorageFeePct,
    agingBreakdown,
    skuAnalysis,
    linkages
  } = analysis;

  const fmtCurrency = (n: number | null | undefined) =>
    n !== null && n !== undefined
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  const fmtPct = (n: number | null | undefined) =>
    n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A';

  return (
    <div className="space-y-6">
      {/* 1. Inventory & Storage Top Banner KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">在库总库存 (Total Inventory)</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalInventoryQty.toLocaleString()} 件</span>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
            <span>可售: {availableInventoryQty}</span>
            <span>•</span>
            <span>预留: {reservedInventoryQty}</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">在途: {inboundInventoryQty}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">365天以上超长库龄库存</span>
          <span className={`text-2xl font-bold mt-1 block ${highAging365PlusQty > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {highAging365PlusQty.toLocaleString()} 件
          </span>
          <span className="text-[11px] text-slate-500">
            占总在库: {totalInventoryQty > 0 ? fmtPct((highAging365PlusQty / totalInventoryQty) * 100) : '0%'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">月度仓储总费用 (Storage)</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{fmtCurrency(totalStorageFeeUsd)}</span>
          <span className="text-[11px] text-slate-500">
            正常月租: {fmtCurrency(normalStorageFee)} ({fmtPct(normalStoragePct)})
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">高库龄惩罚性仓储费占比</span>
          <span className={`text-2xl font-bold mt-1 block ${highAgingStorageFeePct > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {fmtPct(highAgingStorageFeePct)}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">
            365天+罚金合计: {fmtCurrency(storageFee365to450 + storageFee450Plus)}
          </span>
        </div>
      </div>

      {/* 2. Official Walmart Aging Ladder Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Walmart 官方库龄梯队分布全览</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              严格遵循 0-90, 91-180, 181-270, 271-365, 365-450, 450+ 官方梯队标准
            </p>
          </div>
          <Clock className="w-5 h-5 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {agingBreakdown.map((item) => {
            const isSevere = item.bracket.includes('365') || item.bracket.includes('450');
            const isMedium = item.bracket.includes('181') || item.bracket.includes('271');
            return (
              <div
                key={item.bracket}
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  isSevere
                    ? 'bg-rose-50/70 border-rose-200'
                    : isMedium
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSevere ? 'text-rose-900' : 'text-slate-800'}`}>
                      {item.bracket}
                    </span>
                    {isSevere && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {item.qty} <span className="text-xs font-normal text-slate-500">件</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">
                    占比: {fmtPct(item.pct)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>涉及 {item.skuCount} 个SKU / {item.spuCount} 个SPU</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Storage Fee Composition & High-Aging Penalty Culprits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Fee Structure */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">仓储费用构成分解</h3>
            <p className="text-xs text-slate-500 mb-4">区分正常基础仓储费与超期阶梯惩罚费</p>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>正常月度仓储费 (Normal)</span>
                  <span>{fmtCurrency(normalStorageFee)}</span>
                </div>
                <div className="text-slate-500 mt-0.5">占总仓储费: {fmtPct(normalStoragePct)}</div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${normalStoragePct}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex justify-between font-semibold text-amber-900">
                  <span>365-450天超期附加仓储费</span>
                  <span className="text-amber-700">{fmtCurrency(storageFee365to450)}</span>
                </div>
                <div className="text-amber-700 mt-0.5">占总仓储费: {fmtPct(storageFee365to450Pct)}</div>
                <div className="h-1.5 w-full bg-amber-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: `${storageFee365to450Pct}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <div className="flex justify-between font-semibold text-rose-900">
                  <span>450天以上恶性滞销附加仓储费</span>
                  <span className="text-rose-700">{fmtCurrency(storageFee450Plus)}</span>
                </div>
                <div className="text-rose-700 mt-0.5">占总仓储费: {fmtPct(storageFee450PlusPct)}</div>
                <div className="h-1.5 w-full bg-rose-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-rose-600 rounded-full" style={{ width: `${storageFee450PlusPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-rose-50/60 border border-rose-200 rounded-lg text-xs text-rose-800">
            <strong>财务痛点洞察：</strong> 高达 <strong>{fmtPct(highAgingStorageFeePct)}</strong> 的仓储支出纯属超时滞销罚金。若实施特价清库存，次月即可为店铺直接止血 <strong>{fmtCurrency(storageFee365to450 + storageFee450Plus)}</strong>！
          </div>
        </div>

        {/* High Aging Culprit SKUs */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">产生高额仓储费/超长库龄重点责任SKU</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                高库龄滞销吞噬利润的核心责任溯源
              </p>
            </div>
            <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              重点清库对象
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">SKU / SPU</th>
                  <th className="py-2.5 px-2 font-semibold text-right">在库总库存</th>
                  <th className="py-2.5 px-2 font-semibold text-right">365天+数量</th>
                  <th className="py-2.5 px-2 font-semibold text-right">月度仓储费</th>
                  <th className="py-2.5 px-2 font-semibold text-right">月销量 (件)</th>
                  <th className="py-2.5 px-2 font-semibold text-right">预估周转天数</th>
                  <th className="py-2.5 px-2.5 font-semibold text-center">处置行动</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skuAnalysis
                  .filter((s) => s.age365PlusQty > 0 || s.storageFee > 300)
                  .map((s) => (
                    <tr key={s.sku} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{s.sku}</span>
                        <span className="text-[10px] text-slate-400 block">{s.spu}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-slate-900">{s.totalInventory}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-rose-600">
                        {s.age365PlusQty} 件
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-slate-900">
                        {fmtCurrency(s.storageFee)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">{s.unitsSold}</td>
                      <td className="py-2.5 px-2 text-right text-slate-700 font-medium">
                        {s.turnoverDays !== null ? `${s.turnoverDays.toFixed(0)} 天` : '停滞'}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {s.inventoryAction}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. SKU Inventory Health & Action Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">全品类库存健康与决策行动矩阵</h3>
        <p className="text-xs text-slate-500 mb-4">
          综合考虑当前可售库存、日均动销速度与在途到货周期，提供补货与清仓建议
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">SKU / 品名</th>
                <th className="py-2.5 px-2 font-semibold text-right">可售 / 在途</th>
                <th className="py-2.5 px-2 font-semibold text-right">0-90天 (新)</th>
                <th className="py-2.5 px-2 font-semibold text-right">91-270天 (中)</th>
                <th className="py-2.5 px-2 font-semibold text-right">271-365天 (老)</th>
                <th className="py-2.5 px-2 font-semibold text-right">365天+ (滞销)</th>
                <th className="py-2.5 px-2 font-semibold text-right">周转天数</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">库存健康风险</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">下月行动建议</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skuAnalysis.map((s) => (
                <tr key={s.sku} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{s.sku}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{s.productTitle}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className="font-bold text-slate-800">{s.availableInventory}</span>
                    <span className="text-slate-400 text-[10px] block">在途: {s.inboundInventory}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-emerald-600 font-medium">{s.age0to90}</td>
                  <td className="py-2.5 px-2 text-right text-slate-600">{s.age91to180 + s.age181to270}</td>
                  <td className="py-2.5 px-2 text-right text-amber-600">{s.age271to365}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-rose-600">{s.age365PlusQty}</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-slate-800">
                    {s.turnoverDays !== null ? `${s.turnoverDays.toFixed(0)} 天` : '停滞'}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    {s.flags.isStockoutRisk ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        断货高危
                      </span>
                    ) : s.flags.isHighAging ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        长库龄滞销
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        健康安全
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        s.inventoryAction === '紧急补货'
                          ? 'bg-rose-600 text-white'
                          : s.inventoryAction === '清库存'
                          ? 'bg-amber-600 text-white'
                          : s.inventoryAction === '正常补货'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.inventoryAction}
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
