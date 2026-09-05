import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Printer,
  Check,
  ListOrdered,
  ChevronRight
} from 'lucide-react';
import { MonthlyBusinessAnalysis } from '../types';
import { generateExecutiveReportMarkdown } from '../utils/reportGenerator';

interface ReportTabProps {
  analysis: MonthlyBusinessAnalysis;
}

export const ReportTab: React.FC<ReportTabProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const reportMarkdown = generateExecutiveReportMarkdown(analysis);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Walmart_Monthly_Diagnosis_Report_${analysis.month}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // 17 Section titles for TOC
  const sections = [
    { id: '一、管理层经营摘要', title: '一、管理层经营摘要' },
    { id: '二、数据质量与数据口径', title: '二、数据质量与数据口径' },
    { id: '三、店铺核心经营指标', title: '三、店铺核心经营指标' },
    { id: '四、销售结构与深度分析', title: '四、销售结构与深度分析' },
    { id: '五、广告投放深度分析', title: '五、广告投放深度分析' },
    { id: '六、SPU/SKU 盈利全息透视表', title: '六、SPU/SKU 盈利透视表' },
    { id: '七、退货情况与退款损失深度诊断', title: '七、退货与退款损失诊断' },
    { id: '八、库存与库龄结构分析', title: '八、库存与库龄结构分析' },
    { id: '九、仓储费用深度拆解与高库龄惩罚', title: '九、仓储费用深度拆解' },
    { id: '十、销售 × 广告 × 库存 × 退货 × 利润 核心联动诊断', title: '十、五大核心联动诊断' },
    { id: '十一、TOP 10 经营问题清单', title: '十一、TOP 10 经营问题清单' },
    { id: '十二、TOP 10 经营机会发现', title: '十二、TOP 10 经营机会发现' },
    { id: '十三、下个月广告策略详细指引', title: '十三、下月广告策略指引' },
    { id: '十四、下个月库存管理策略', title: '十四、下月库存管理策略' },
    { id: '十五、下个月产品矩阵分类运营策略', title: '十五、下月产品矩阵运营' },
    { id: '十六、下个月经营目标规划', title: '十六、下月经营目标规划' },
    { id: '十七、管理层最终行动结论 (Top 5 必做事项)', title: '十七、管理层最终Top 5必做' }
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Walmart 店铺月度经营分析与诊断报告 (17章完整标准版)
            </h2>
            <p className="text-xs text-slate-500">
              严格遵照管理层、财务、广告、库存、退货与战略行动17章闭环结构输出
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制全文' : '复制 Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            type="button"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载 .md 报告</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>打印 / 存为 PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container: TOC & Document */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents (Left Sidebar on desktop) */}
        <div className="hidden lg:block lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs sticky top-24 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
            <ListOrdered className="w-4 h-4 text-blue-600" />
            <span>报告章节目录 (17章)</span>
          </div>
          <nav className="space-y-1 text-xs">
            {sections.map((sec, idx) => (
              <a
                key={sec.id}
                href={`#section-${idx + 1}`}
                className="block py-1 px-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 transition-colors truncate"
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Report Content View */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-10 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none">
          <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-sm prose-table:text-xs prose-th:bg-slate-100 prose-th:py-2 prose-td:py-1.5 prose-p:text-xs prose-p:leading-relaxed prose-li:text-xs">
            <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-xs sm:text-sm">
              {reportMarkdown}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
