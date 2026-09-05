import React from 'react';
import {
  RotateCcw,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { MonthlyBusinessAnalysis } from '../types';

interface ReturnsTabProps {
  analysis: MonthlyBusinessAnalysis;
}

export const ReturnsTab: React.FC<ReturnsTabProps> = ({ analysis }) => {
  const {
    validReturnQty,
    validReturnAmount,
    overallReturnRatePct,
    overallReturnAmountRatePct,
    keepItQty,
    keepItAmount,
    sellerResponsibleQty,
    sellerResponsiblePct,
    topReturnReasons,
    skuAnalysis,
    totalUnitsSold,
    totalSalesRevenue
  } = analysis;

  const fmtCurrency = (n: number | null | undefined) =>
    n !== null && n !== undefined
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  const fmtPct = (n: number | null | undefined) =>
    n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A';

  return (
    <div className="space-y-6">
      {/* 1. Core Return KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">有效退货数量 (已剔除取消单)</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{validReturnQty} 件</span>
          <span className="text-[11px] text-slate-500">发货总量基数: {totalUnitsSold} 件</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">全店退货率 (件数口径 / 金额口径)</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{fmtPct(overallReturnRatePct)}</span>
          <span className="text-[11px] text-slate-500">金额退货率: {fmtPct(overallReturnAmountRatePct)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Keep It (仅退款无需退运) 损失</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{fmtCurrency(keepItAmount)}</span>
          <span className="text-[11px] text-rose-600 font-medium">涉及 {keepItQty} 件 (全额计入货值损失)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">卖家责任归属退货占比</span>
          <span className={`text-2xl font-bold mt-1 block ${sellerResponsiblePct > 35 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {fmtPct(sellerResponsiblePct)}
          </span>
          <span className="text-[11px] text-slate-500">{sellerResponsibleQty} 件归属品控/打包问题</span>
        </div>
      </div>

      {/* 2. Keep It Risk Alert & Attribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keep It Deep Dive */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm mb-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>Keep It (仅退款免寄回) 经济损失核算</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              根据沃尔玛退货政策，当符合低单价、物流退回运费高于残值或卖家专属设置时，系统会触发 Keep It。
              此时买家获得全额退款且无需寄回商品，<strong>卖家蒙受 100% 货值与销售损失</strong>。
            </p>

            <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200">
              <div className="flex justify-between items-center text-xs font-semibold text-rose-900">
                <span>本月 Keep It 累计损失金额</span>
                <span className="text-base font-bold text-rose-700">{fmtCurrency(keepItAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-rose-800 mt-1">
                <span>Keep It 件数占总退货比重</span>
                <span className="font-semibold">
                  {validReturnQty > 0 ? fmtPct((keepItQty / validReturnQty) * 100) : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            建议：排查高发 Keep It 的 SKU，若为大件请在卖家中心关闭此项规则，以减少恶意白嫖与货值损失。
          </div>
        </div>

        {/* Responsibility Attribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>退货责任归属判定 (Seller vs Customer)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              严格区分品质瑕疵/少发破损 (卖家可控) 与买家主观无理由/不想要 (外部因素)。
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-amber-800">卖家责任 (质损/少配件/色差等)</span>
                  <span className="text-amber-900">{sellerResponsibleQty} 件 ({fmtPct(sellerResponsiblePct)})</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sellerResponsiblePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">买家责任 / 主观偏好 (尺寸不适/不再需要)</span>
                  <span className="text-slate-800">{validReturnQty - sellerResponsibleQty} 件 ({fmtPct(100 - sellerResponsiblePct)})</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${100 - sellerResponsiblePct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            品控行动：针对卖家责任退货，必须推动供应商在出厂前加强全检与包装防震整改。
          </div>
        </div>
      </div>

      {/* 3. Top Return Reasons Ranking Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">退货原因 TOP 深度归因与整改方向</h3>
        <p className="text-xs text-slate-500 mb-4">按退货频次由高到低排序，明确整改闭环行动</p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">排名</th>
                <th className="py-2.5 px-2 font-semibold">退货原因 (Return Reason)</th>
                <th className="py-2.5 px-2 font-semibold text-right">退货件数</th>
                <th className="py-2.5 px-2 font-semibold text-right">占总退货比例</th>
                <th className="py-2.5 px-2.5 font-semibold">责任类别判定</th>
                <th className="py-2.5 px-3 font-semibold">建议改善动作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topReturnReasons.map((reason, idx) => {
                const isSeller = reason.reason.includes('质') || reason.reason.includes('损') || reason.reason.includes('配件');
                return (
                  <tr key={reason.reason} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-500">#{idx + 1}</td>
                    <td className="py-2.5 px-2 font-semibold text-slate-900">{reason.reason}</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800">{reason.qty} 件</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{fmtPct(reason.pct)}</td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isSeller
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSeller ? '卖家责任 (质量/包装)' : '买家责任 (预期/主观)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {isSeller ? '升级双重瓦楞纸箱与内部珍珠棉护角，加固螺丝包封口' : '在详情页增设高清对比图、实测承重视频与尺寸图'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SKU Return Rates & Loss Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">各 SKU 退货情况与退货损失总览</h3>
        <p className="text-xs text-slate-500 mb-4">
          退货率 = 退货件数 / 发货销量；已过滤已取消退货记录
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">SKU / 品名</th>
                <th className="py-2.5 px-2 font-semibold text-right">发货销量</th>
                <th className="py-2.5 px-2 font-semibold text-right">有效退货数</th>
                <th className="py-2.5 px-2 font-semibold text-right">退货率</th>
                <th className="py-2.5 px-2 font-semibold text-right">退货损失金额</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">退货风险预警</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skuAnalysis.map((s) => (
                <tr key={s.sku} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{s.sku}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{s.productTitle}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-700">{s.unitsSold}</td>
                  <td className="py-2.5 px-2 text-right font-medium text-slate-900">{s.returnQty}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                    {fmtPct(s.returnRatePct)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-semibold text-rose-600">
                    {fmtCurrency(s.returnLossAmount)}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    {s.flags.isHighReturn ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        退货偏高 (&gt;5%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        正常水平
                      </span>
                    )}
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
