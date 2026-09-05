export interface ItemPerformanceRaw {
  itemId: string;
  sku: string;
  itemName?: string;
  adSpend: number;
  impressions: number;
  clicks: number;
  ctr?: number;
  cpc?: number;
  orders: number;
  cvr?: number;
  attributedSales: number;
  unitsSold: number;
  level?: 'SKU' | 'SPU' | 'TOTAL';
}

export interface InventoryHealthRaw {
  sku: string;
  itemId: string;
  totalInventory: number;
  availableInventory: number;
  reservedInventory: number;
  inboundInventory: number;
  age0to90?: number;
  age91to180?: number;
  age181to270?: number;
  age271to365?: number;
  age365to450?: number;
  age450Plus?: number;
  customAgingBrackets?: Record<string, number>;
}

export interface StorageRaw {
  itemId?: string;
  sku?: string;
  normalStorageFee: number;
  storageFee365to450: number;
  storageFee450Plus: number;
  totalStorageFee: number;
}

export interface ReturnOrderRaw {
  returnOrderId: string;
  orderId?: string;
  sku: string;
  itemId?: string;
  returnQty: number;
  returnAmount: number;
  returnReason: string;
  isKeepIt: boolean;
  responsibleParty: 'Seller' | 'Customer' | 'Walmart' | 'Carrier' | 'Other';
  status: string; // 'Cancelled', 'Completed', 'Approved', etc.
  returnDate?: string;
}

export interface ErpOrderRaw {
  orderId: string;
  orderDate: string;
  sku: string;
  unitPrice: number;
  shippedQty: number;
  orderAmount: number;
  productCost?: number; // ERP unit product cost
  orderStatus: string; // 'Cancelled', 'Shipped', 'Completed'
}

export interface ProductCatalogRaw {
  itemId: string;
  sku: string;
  spu: string;
  productType: string;
  productTitle?: string;
}

export interface ManualInputs {
  month: string; // e.g. "2026-08"
  totalFirstLegRmb: number; // 月度总头程 RMB
  totalProductCostRmb: number; // 月度总产品成本 RMB (若ERP无SKU成本时使用)
  exchangeRate: number; // USD/RMB 汇率 (用户输入，严格禁止推测)
  otherExpensesUsd: number; // 其他费用 USD
  comparisonMonth?: string; // 环比月份 e.g. "2026-07"
}

export interface DataQualityReport {
  dataSources: {
    sourceName: string;
    totalRows: number;
    validRows: number;
    excludedRows: number;
    exclusionReasons: string[];
    matchRatePct: number;
    anomalies: string[];
  }[];
  overallMatchRatePct: number;
  anomaliesCount: number;
  masterDataWarnings: string[];
  discrepancies: string[];
  credibilityLevel: '高 (可信度高)' | '中 (部分分摊/部分匹配)' | '低 (缺少核心字段)';
}

export interface SkuAnalysisResult {
  sku: string;
  itemId: string;
  spu: string;
  productType: string;
  productTitle: string;
  // Sales
  salesRevenue: number;
  unitsSold: number;
  orderCount: number;
  avgSellingPrice: number;
  salesSharePct: number;
  // Cost
  productCost: number;
  isCostAllocated: boolean;
  firstLegCost: number;
  adSpend: number;
  storageFee: number;
  returnLossAmount: number;
  // Operating Profit
  operatingProfit: number;
  operatingMarginPct: number;
  // Ad KPIs
  adSales: number;
  roas: number | null;
  acos: number | null;
  ctr: number | null;
  cpc: number | null;
  cvr: number | null;
  impressions: number;
  clicks: number;
  adOrders: number;
  // Inventory
  totalInventory: number;
  availableInventory: number;
  inventoryTurnoverDays: number | null;
  age365PlusQty: number;
  // Returns
  returnQty: number;
  returnAmount: number;
  returnRatePct: number;
  keepItQty: number;
  keepItAmount: number;
  sellerResponsibleReturnQty: number;
  // Quadrants
  salesProfitQuadrant: 'A-核心产品' | 'B-重点利润优化' | 'C-潜力产品' | 'D-清理/优化对象';
  adProfitQuadrant: '高广告-高利润' | '高广告-低利润' | '低广告-高利润' | '低广告-低利润';
  // Diagnostic flags
  flags: {
    isStockoutRisk: boolean;
    isOverstock: boolean;
    isHighAging: boolean;
    isAdInventoryConflict: boolean;
    isAdHighLowProfit: boolean;
    isReturnQualityAlert: boolean;
    isHighStorageFeeRisk: boolean;
  };
}

export interface SpuAnalysisResult {
  spu: string;
  productType: string;
  skuCount: number;
  skus: string[];
  salesRevenue: number;
  unitsSold: number;
  orderCount: number;
  salesSharePct: number;
  productCost: number;
  firstLegCost: number;
  adSpend: number;
  adSharePct: number;
  storageFee: number;
  returnLossAmount: number;
  operatingProfit: number;
  operatingMarginPct: number;
  totalInventory: number;
  highAgingQty: number;
  returnRatePct: number;
}

export interface MonthlyBusinessAnalysis {
  month: string;
  currency: 'USD';
  exchangeRate: number;
  // Store Core KPIs
  totalSalesRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  avgOrderValue: number;
  // Costs Breakdown
  totalProductCostUsd: number;
  totalFirstLegUsd: number;
  totalAdSpendUsd: number;
  totalStorageFeeUsd: number;
  otherExpensesUsd: number;
  totalOperatingCostUsd: number;
  // Profit
  operatingProfitUsd: number;
  operatingMarginPct: number;
  // Ad Overview
  totalAdSales: number;
  overallRoas: number | null;
  overallAcos: number | null;
  totalImpressions: number;
  totalClicks: number;
  overallCtr: number | null;
  overallCpc: number | null;
  overallCvr: number | null;
  adSpendToSalesPct: number;
  // Inventory & Aging
  totalInventoryQty: number;
  availableInventoryQty: number;
  reservedInventoryQty: number;
  inboundInventoryQty: number;
  agingBreakdown: {
    bracket: string;
    qty: number;
    pct: number;
    skuCount: number;
    spuCount: number;
  }[];
  highAging365PlusQty: number;
  highAgingPct: number;
  // Storage Breakdown
  normalStorageFee: number;
  storageFee365to450: number;
  storageFee450Plus: number;
  normalStoragePct: number;
  storageFee365to450Pct: number;
  storageFee450PlusPct: number;
  highAgingStorageFeePct: number;
  // Return Overview
  validReturnQty: number;
  validReturnAmount: number;
  overallReturnRatePct: number;
  overallReturnAmountRatePct: number;
  keepItQty: number;
  keepItPct: number;
  keepItAmount: number;
  sellerResponsibleQty: number;
  sellerResponsiblePct: number;
  topReturnReasons: { reason: string; qty: number; pct: number }[];
  // SPU & SKU details
  skuAnalysis: SkuAnalysisResult[];
  spuAnalysis: SpuAnalysisResult[];
  productTypeShare: { productType: string; sales: number; pct: number; profit: number }[];
  salesConcentrationTop5Pct: number;
  // Linkages
  linkages: {
    salesGrowthAdProfitScenario: {
      type: string;
      description: string;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    salesReturnLinkage: {
      alertText: string;
      highReturnSkus: string[];
    };
    inventorySalesLinkage: {
      stockoutSkus: string[];
      overstockSkus: string[];
      liquidateSkus: string[];
    };
    inventoryAdLinkage: {
      conflictSkus: string[];
      pushOpportunitySkus: string[];
    };
    agingStorageLinkage: {
      agingFeeImpactText: string;
      topFeeCulpritSkus: string[];
    };
  };
  // Health Score
  healthScore: {
    total: number;
    grade: '优秀' | '健康' | '正常' | '需要重点改善' | '高风险';
    breakdown: {
      salesScore: number; // max 20
      profitScore: number; // max 25
      adScore: number; // max 15
      inventoryScore: number; // max 15
      returnScore: number; // max 10
      storageScore: number; // max 10
      productStructureScore: number; // max 5
    };
  };
  // Data Quality
  dataQuality: DataQualityReport;
  // MoM comparison if available
  comparison?: {
    prevMonth: string;
    salesMomPct: number | null;
    ordersMomPct: number | null;
    unitsMomPct: number | null;
    adSpendMomPct: number | null;
    storageFeeMomPct: number | null;
    returnsMomPct: number | null;
    profitMomPct: number | null;
    marginDiffPts: number | null;
  };
}
