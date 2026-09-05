/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { SalesAdTab } from './components/SalesAdTab';
import { InventoryStorageTab } from './components/InventoryStorageTab';
import { ReturnsTab } from './components/ReturnsTab';
import { ProfitQuadrantTab } from './components/ProfitQuadrantTab';
import { LinkagesTab } from './components/LinkagesTab';
import { ReportTab } from './components/ReportTab';
import { DataImportModal } from './components/DataImportModal';
import { calculateMonthlyAnalysis } from './utils/calculator';
import {
  sampleAugust2026ManualInputs,
  sampleAugust2026ItemPerformance,
  sampleAugust2026InventoryHealth,
  sampleAugust2026Storage,
  sampleAugust2026ReturnOrders,
  sampleAugust2026ErpOrders,
  sampleAugust2026Catalog,
  sampleJuly2026ManualInputs,
  sampleJuly2026ItemPerformance,
  sampleJuly2026InventoryHealth,
  sampleJuly2026Storage,
  sampleJuly2026ReturnOrders,
  sampleJuly2026ErpOrders,
  sampleJuly2026Catalog
} from './utils/sampleData';
import {
  ManualInputs,
  ItemPerformanceRaw,
  InventoryHealthRaw,
  StorageRaw,
  ReturnOrderRaw,
  ErpOrderRaw,
  ProductCatalogRaw
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Core Datasets
  const [manualInputs, setManualInputs] = useState<ManualInputs>(sampleAugust2026ManualInputs);
  const [itemPerformance, setItemPerformance] = useState<ItemPerformanceRaw[]>(sampleAugust2026ItemPerformance);
  const [inventoryHealth, setInventoryHealth] = useState<InventoryHealthRaw[]>(sampleAugust2026InventoryHealth);
  const [storageData, setStorageData] = useState<StorageRaw[]>(sampleAugust2026Storage);
  const [returnOrders, setReturnOrders] = useState<ReturnOrderRaw[]>(sampleAugust2026ReturnOrders);
  const [erpOrders, setErpOrders] = useState<ErpOrderRaw[]>(sampleAugust2026ErpOrders);
  const [catalog, setCatalog] = useState<ProductCatalogRaw[]>(sampleAugust2026Catalog);

  // Previous Month Baseline for MoM Comparison
  const prevAnalysis = useMemo(() => {
    return calculateMonthlyAnalysis({
      itemPerformance: sampleJuly2026ItemPerformance,
      inventoryHealth: sampleJuly2026InventoryHealth,
      storageData: sampleJuly2026Storage,
      returnOrders: sampleJuly2026ReturnOrders,
      erpOrders: sampleJuly2026ErpOrders,
      catalog: sampleJuly2026Catalog,
      manualInputs: sampleJuly2026ManualInputs
    });
  }, []);

  // Current Month Core Analysis Calculation
  const analysis = useMemo(() => {
    return calculateMonthlyAnalysis({
      itemPerformance,
      inventoryHealth,
      storageData,
      returnOrders,
      erpOrders,
      catalog,
      manualInputs,
      prevMonthAnalysis: prevAnalysis
    });
  }, [
    itemPerformance,
    inventoryHealth,
    storageData,
    returnOrders,
    erpOrders,
    catalog,
    manualInputs,
    prevAnalysis
  ]);

  // Handle Reset to Standard Sample
  const handleLoadSampleData = () => {
    setManualInputs(sampleAugust2026ManualInputs);
    setItemPerformance(sampleAugust2026ItemPerformance);
    setInventoryHealth(sampleAugust2026InventoryHealth);
    setStorageData(sampleAugust2026Storage);
    setReturnOrders(sampleAugust2026ReturnOrders);
    setErpOrders(sampleAugust2026ErpOrders);
    setCatalog(sampleAugust2026Catalog);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        onOpenManualSettings={() => setIsImportModalOpen(true)}
        onExportReport={() => setCurrentTab('report')}
        month={analysis.month}
        exchangeRate={analysis.exchangeRate}
        healthScore={analysis.healthScore.total}
        healthGrade={analysis.healthScore.grade}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <OverviewTab analysis={analysis} onNavigateTab={setCurrentTab} />
        )}
        {currentTab === 'sales_ad' && (
          <SalesAdTab analysis={analysis} />
        )}
        {currentTab === 'inventory_storage' && (
          <InventoryStorageTab analysis={analysis} />
        )}
        {currentTab === 'returns' && (
          <ReturnsTab analysis={analysis} />
        )}
        {currentTab === 'profit_quadrant' && (
          <ProfitQuadrantTab analysis={analysis} />
        )}
        {currentTab === 'linkages' && (
          <LinkagesTab analysis={analysis} />
        )}
        {currentTab === 'report' && (
          <ReportTab analysis={analysis} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Walmart 店铺月度经营分析与利润诊断系统 • 专业财务、广告、库存及运营决策中台
          </span>
          <span className="text-slate-400">
            严守数据真实性原则 • 严格排除已取消订单 • 自动联动五大业务要素
          </span>
        </div>
      </footer>

      {/* Data Import & Parameter Settings Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        manualInputs={manualInputs}
        onSaveManualInputs={(newInputs) => {
          setManualInputs(newInputs);
        }}
        onUploadItemPerformance={(data) => setItemPerformance(data)}
        onUploadInventoryHealth={(data) => setInventoryHealth(data)}
        onUploadStorage={(data) => setStorageData(data)}
        onUploadReturnOrders={(data) => setReturnOrders(data)}
        onUploadErpOrders={(data) => setErpOrders(data)}
        onUploadCatalog={(data) => setCatalog(data)}
        itemCount={itemPerformance.length}
        inventoryCount={inventoryHealth.length}
        storageCount={storageData.length}
        returnCount={returnOrders.length}
        erpCount={erpOrders.length}
        catalogCount={catalog.length}
        onResetToSample={handleLoadSampleData}
      />
    </div>
  );
}
