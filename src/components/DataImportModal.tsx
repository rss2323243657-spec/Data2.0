import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Download,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ManualInputs,
  ItemPerformanceRaw,
  InventoryHealthRaw,
  StorageRaw,
  ReturnOrderRaw,
  ErpOrderRaw,
  ProductCatalogRaw
} from '../types';
import {
  parseSheetToRecords,
  parseItemPerformance,
  parseInventoryHealth,
  parseStorage,
  parseReturnOrders,
  parseErpOrders,
  parseProductCatalog
} from '../utils/dataParser';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualInputs: ManualInputs;
  onSaveManualInputs: (inputs: ManualInputs) => void;
  onUploadItemPerformance: (data: ItemPerformanceRaw[]) => void;
  onUploadInventoryHealth: (data: InventoryHealthRaw[]) => void;
  onUploadStorage: (data: StorageRaw[]) => void;
  onUploadReturnOrders: (data: ReturnOrderRaw[]) => void;
  onUploadErpOrders: (data: ErpOrderRaw[]) => void;
  onUploadCatalog: (data: ProductCatalogRaw[]) => void;
  itemCount: number;
  inventoryCount: number;
  storageCount: number;
  returnCount: number;
  erpCount: number;
  catalogCount: number;
  onResetToSample: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  manualInputs,
  onSaveManualInputs,
  onUploadItemPerformance,
  onUploadInventoryHealth,
  onUploadStorage,
  onUploadReturnOrders,
  onUploadErpOrders,
  onUploadCatalog,
  itemCount,
  inventoryCount,
  storageCount,
  returnCount,
  erpCount,
  catalogCount,
  onResetToSample
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'tables'>('manual');
  const [formData, setFormData] = useState<ManualInputs>({ ...manualInputs });
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.exchangeRate <= 0) {
      setFeedback({ msg: '汇率必须大于 0', type: 'error' });
      return;
    }
    onSaveManualInputs(formData);
    setFeedback({ msg: '手动输入参数与汇率已更新！', type: 'success' });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'item' | 'inv' | 'storage' | 'return' | 'erp' | 'catalog'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const records = parseSheetToRecords(buffer);
        if (records.length === 0) {
          setFeedback({ msg: `文件解析失败或无数据行: ${file.name}`, type: 'error' });
          return;
        }

        switch (type) {
          case 'item': {
            const parsed = parseItemPerformance(records);
            onUploadItemPerformance(parsed);
            setFeedback({ msg: `成功导入广告/Item Performance报表: ${parsed.length} 行数据`, type: 'success' });
            break;
          }
          case 'inv': {
            const parsed = parseInventoryHealth(records);
            onUploadInventoryHealth(parsed);
            setFeedback({ msg: `成功导入库存健康Inventory Health报表: ${parsed.length} 行数据`, type: 'success' });
            break;
          }
          case 'storage': {
            const parsed = parseStorage(records);
            onUploadStorage(parsed);
            setFeedback({ msg: `成功导入仓储费Storage报表: ${parsed.length} 行数据`, type: 'success' });
            break;
          }
          case 'return': {
            const parsed = parseReturnOrders(records);
            onUploadReturnOrders(parsed);
            setFeedback({ msg: `成功导入退货单Return Orders报表: ${parsed.length} 行数据`, type: 'success' });
            break;
          }
          case 'erp': {
            const parsed = parseErpOrders(records);
            onUploadErpOrders(parsed);
            setFeedback({ msg: `成功导入ERP订单表: ${parsed.length} 行数据`, type: 'success' });
            break;
          }
          case 'catalog': {
            const parsed = parseProductCatalog(records);
            onUploadCatalog(parsed);
            setFeedback({ msg: `成功导入产品主数据分类表: ${parsed.length} 行数据`, type: 'success' });
            break;
          }
        }
      } catch (err: any) {
        setFeedback({ msg: `文件解析异常: ${err.message || String(err)}`, type: 'error' });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    e.target.value = '';
  };

  // Download template helper
  const downloadTemplate = (type: string) => {
    let headers: string[] = [];
    let sampleRow: Record<string, any> = {};

    switch (type) {
      case 'item':
        headers = ['Item ID', 'SKU', 'Item Name', 'Ad Spend', 'Impressions', 'Clicks', 'Orders', 'Attributed Sales', 'Units Sold'];
        sampleRow = { 'Item ID': 'WMT-1001', 'SKU': 'WM-CHAIR-BLK', 'Item Name': 'Office Chair Black', 'Ad Spend': 2450, 'Impressions': 215000, 'Clicks': 3820, 'Orders': 195, 'Attributed Sales': 19480.5, 'Units Sold': 195 };
        break;
      case 'inv':
        headers = ['SKU', 'Item ID', 'Total Inventory', 'Available Inventory', 'Reserved Inventory', 'Inbound Inventory', '0-90 Days', '91-180 Days', '181-270 Days', '271-365 Days', '365-450 Days', '450+ Days'];
        sampleRow = { 'SKU': 'WM-CHAIR-BLK', 'Item ID': 'WMT-1001', 'Total Inventory': 280, 'Available Inventory': 260, 'Reserved Inventory': 15, 'Inbound Inventory': 200, '0-90 Days': 210, '91-180 Days': 50, '181-270 Days': 20, '271-365 Days': 0, '365-450 Days': 0, '450+ Days': 0 };
        break;
      case 'storage':
        headers = ['Item ID', 'SKU', 'Normal Storage Fee', '365-450 Days Storage Fee', '450+ Days Storage Fee', 'Total Storage Fee'];
        sampleRow = { 'Item ID': 'WMT-1001', 'SKU': 'WM-CHAIR-BLK', 'Normal Storage Fee': 420, '365-450 Days Storage Fee': 0, '450+ Days Storage Fee': 0, 'Total Storage Fee': 420 };
        break;
      case 'return':
        headers = ['Return Order ID', 'Order ID', 'SKU', 'Item ID', 'Return Qty', 'Return Amount', 'Return Reason', 'Is Keep It', 'Responsible Party', 'Status'];
        sampleRow = { 'Return Order ID': 'RET-001', 'Order ID': 'ORD-9801', 'SKU': 'WM-CHAIR-BLK', 'Item ID': 'WMT-1001', 'Return Qty': 1, 'Return Amount': 99.9, 'Return Reason': '部件损坏', 'Is Keep It': '否', 'Responsible Party': 'Seller', 'Status': 'Completed' };
        break;
      case 'erp':
        headers = ['Order ID', 'Order Date', 'SKU', 'Unit Price', 'Shipped Qty', 'Order Amount', 'Product Cost', 'Order Status'];
        sampleRow = { 'Order ID': 'ERP-AUG-001', 'Order Date': '2026-08-02', 'SKU': 'WM-CHAIR-BLK', 'Unit Price': 99.9, 'Shipped Qty': 215, 'Order Amount': 21478.5, 'Product Cost': 32.5, 'Order Status': 'Shipped' };
        break;
      case 'catalog':
        headers = ['Item ID', 'SKU', 'SPU', 'Product Type', 'Product Title'];
        sampleRow = { 'Item ID': 'WMT-1001', 'SKU': 'WM-CHAIR-BLK', 'SPU': 'SPU-OFFICE-CHAIR', 'Product Type': '办公家具', 'Product Title': 'Ergonomic Mesh Office Chair Black' };
        break;
    }

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Walmart_Template_${type}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">数据源导入与经营参数配置</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              支持上传 Walmart 官方后台4大报表、ERP订单与主数据，以及用户指定汇率与财务成本
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 bg-white space-x-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>用户手动参数与汇率设置</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'tables'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Walmart报表与ERP表格上传</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>系统准则：</strong> 汇率必须由用户输入，系统严格禁止擅自推测或抓取外部汇率；
                  月度总头程与总产品成本录入人民币(RMB)，系统将自动统一折算为美元(USD)计入经营总成本。
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    分析归属月份 (YYYY-MM) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="2026-08"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    USD / RMB 汇率 (用户输入) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="7.20"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">例如输入 7.20，折算公式为: USD = RMB / 7.20</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    月度总头程费用 (RMB) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalFirstLegRmb}
                    onChange={(e) => setFormData({ ...formData, totalFirstLegRmb: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="58500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    折合 USD: ${formData.exchangeRate > 0 ? (formData.totalFirstLegRmb / formData.exchangeRate).toFixed(2) : '0.00'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    月度总产品成本 (RMB - 若ERP缺成本时启用)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalProductCostRmb}
                    onChange={(e) => setFormData({ ...formData, totalProductCostRmb: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="184500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    折合 USD: ${formData.exchangeRate > 0 ? (formData.totalProductCostRmb / formData.exchangeRate).toFixed(2) : '0.00'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    其他经营杂费 (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.otherExpensesUsd}
                    onChange={(e) => setFormData({ ...formData, otherExpensesUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="1250"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">如ERP软件费、店铺工具、商标月租等</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    环比对比月份
                  </label>
                  <input
                    type="text"
                    value={formData.comparisonMonth || ''}
                    onChange={(e) => setFormData({ ...formData, comparisonMonth: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="2026-07"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  保存参数并重新核算
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                系统支持直接上传 Excel (.xlsx / .xls) 或 CSV 文件。系统内置智能语义列名匹配器，支持常见的沃尔玛与ERP字段别名。
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Item Performance */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">A1. 广告与单品表现 (Item Performance)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${itemCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        已载入: {itemCount} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      用于统计当月广告总花费及各SKU广告支出 (已自动排除 Total 汇总行)
                    </p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报表</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'item')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('item')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>

                {/* 2. Inventory Health */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">A2. 库存健康报表 (Inventory Health)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${inventoryCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        已载入: {inventoryCount} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      用于在库/在途库存与 0-90至450+ 官方库龄梯队分析
                    </p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报表</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'inv')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('inv')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>

                {/* 3. Storage */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">A3. 仓储费明细 (Storage)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${storageCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        已载入: {storageCount} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      拆分正常仓储费与 365-450天、450+天超期惩罚性仓储费
                    </p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报表</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'storage')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('storage')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>

                {/* 4. Return Orders */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">A4. 退货明细 (Return Orders)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${returnCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        已载入: {returnCount} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      严格剔除 Cancelled 订单，核算 Keep It 经济损失与卖家责任占比
                    </p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报表</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'return')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('return')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>

                {/* 5. ERP Orders */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">B1. ERP 实际发货订单表 (ERP Orders)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${erpCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        已载入: {erpCount} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      全店实际销售收入的唯一主源（排除取消单，校验单价×数量）
                    </p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报表</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'erp')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('erp')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>

                {/* 6. Product Master Catalog */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">B2. 产品主数据与分类表 (Master Catalog)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${catalogCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        已载入: {catalogCount} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      统一 Item ID → SKU → SPU → Product Type 映射关联
                    </p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传报表</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'catalog')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('catalog')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onResetToSample}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-medium"
                >
                  一键恢复标准实测样本数据
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  完成并查看分析
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
