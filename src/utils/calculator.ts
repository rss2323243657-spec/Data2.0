import {
  ItemPerformanceRaw,
  InventoryHealthRaw,
  StorageRaw,
  ReturnOrderRaw,
  ErpOrderRaw,
  ProductCatalogRaw,
  ManualInputs,
  MonthlyBusinessAnalysis,
  SkuAnalysisResult,
  SpuAnalysisResult,
  DataQualityReport
} from '../types';

export interface CalculateMonthlyAnalysisParams {
  itemPerformance: ItemPerformanceRaw[];
  inventoryHealth: InventoryHealthRaw[];
  storageData: StorageRaw[];
  returnOrders: ReturnOrderRaw[];
  erpOrders: ErpOrderRaw[];
  catalog: ProductCatalogRaw[];
  manualInputs: ManualInputs;
  prevMonthAnalysis?: {
    salesRevenue: number;
    orders: number;
    unitsSold: number;
    adSpend: number;
    storageFee: number;
    returnQty: number;
    returnAmount: number;
    productCost: number;
    firstLegCost: number;
    operatingProfit: number;
    operatingMarginPct: number;
  };
}

export function calculateMonthlyAnalysis(
  itemPerfListOrParams: ItemPerformanceRaw[] | CalculateMonthlyAnalysisParams,
  invHealthListArg?: InventoryHealthRaw[],
  storageListArg?: StorageRaw[],
  returnListArg?: ReturnOrderRaw[],
  erpOrderListArg?: ErpOrderRaw[],
  catalogListArg?: ProductCatalogRaw[],
  manualInputsArg?: ManualInputs,
  previousMonthDataArg?: {
    salesRevenue: number;
    orders: number;
    unitsSold: number;
    adSpend: number;
    storageFee: number;
    returnQty: number;
    returnAmount: number;
    productCost: number;
    firstLegCost: number;
    operatingProfit: number;
    operatingMarginPct: number;
  }
): MonthlyBusinessAnalysis {
  let itemPerfList: ItemPerformanceRaw[];
  let invHealthList: InventoryHealthRaw[];
  let storageList: StorageRaw[];
  let returnList: ReturnOrderRaw[];
  let erpOrderList: ErpOrderRaw[];
  let catalogList: ProductCatalogRaw[];
  let manualInputs: ManualInputs;
  let previousMonthData: {
    salesRevenue: number;
    orders: number;
    unitsSold: number;
    adSpend: number;
    storageFee: number;
    returnQty: number;
    returnAmount: number;
    productCost: number;
    firstLegCost: number;
    operatingProfit: number;
    operatingMarginPct: number;
  } | undefined;

  if ('itemPerformance' in itemPerfListOrParams) {
    itemPerfList = itemPerfListOrParams.itemPerformance;
    invHealthList = itemPerfListOrParams.inventoryHealth;
    storageList = itemPerfListOrParams.storageData;
    returnList = itemPerfListOrParams.returnOrders;
    erpOrderList = itemPerfListOrParams.erpOrders;
    catalogList = itemPerfListOrParams.catalog;
    manualInputs = itemPerfListOrParams.manualInputs;
    previousMonthData = itemPerfListOrParams.prevMonthAnalysis;
  } else {
    itemPerfList = itemPerfListOrParams;
    invHealthList = invHealthListArg || [];
    storageList = storageListArg || [];
    returnList = returnListArg || [];
    erpOrderList = erpOrderListArg || [];
    catalogList = catalogListArg || [];
    manualInputs = manualInputsArg || {
      month: '2026-08',
      totalFirstLegRmb: 0,
      totalProductCostRmb: 0,
      exchangeRate: 7.20,
      otherExpensesUsd: 0
    };
    previousMonthData = previousMonthDataArg;
  }
  const exchangeRate = manualInputs.exchangeRate > 0 ? manualInputs.exchangeRate : 7.20;

  // 1. Data Quality Checks & Exclusions
  const excludedErpOrders = erpOrderList.filter((o) => {
    const s = (o.orderStatus || '').toLowerCase();
    return s.includes('cancel') || s.includes('取消');
  });
  const validErpOrders = erpOrderList.filter((o) => {
    const s = (o.orderStatus || '').toLowerCase();
    return !s.includes('cancel') && !s.includes('取消');
  });

  const excludedReturns = returnList.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s.includes('cancel') || s.includes('取消');
  });
  const validReturns = returnList.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return !s.includes('cancel') && !s.includes('取消');
  });

  // Filter out Total rows in Item Performance to avoid double counting
  const validItemPerf = itemPerfList.filter((i) => {
    if (i.level === 'TOTAL') return false;
    const sku = (i.sku || '').toLowerCase();
    const name = (i.itemName || '').toLowerCase();
    return !sku.includes('total') && !sku.includes('总计') && !name.includes('total') && !name.includes('汇总');
  });

  // Master Data mappings (Priority: 1. Item ID, 2. SKU)
  const catalogBySku = new Map<string, ProductCatalogRaw>();
  const catalogByItemId = new Map<string, ProductCatalogRaw>();
  const skuToItemIds = new Map<string, Set<string>>();
  const itemIdToSkus = new Map<string, Set<string>>();
  const masterDataWarnings: string[] = [];

  catalogList.forEach((c) => {
    if (c.sku) catalogBySku.set(c.sku, c);
    if (c.itemId) catalogByItemId.set(c.itemId, c);

    if (c.sku && c.itemId) {
      if (!skuToItemIds.has(c.sku)) skuToItemIds.set(c.sku, new Set());
      skuToItemIds.get(c.sku)!.add(c.itemId);

      if (!itemIdToSkus.has(c.itemId)) itemIdToSkus.set(c.itemId, new Set());
      itemIdToSkus.get(c.itemId)!.add(c.sku);
    }
  });

  // Check 1-to-many / many-to-1 master data anomalies
  skuToItemIds.forEach((set, sku) => {
    if (set.size > 1) {
      masterDataWarnings.push(`主数据异常: SKU [${sku}] 对应了 ${set.size} 个 Item ID (${Array.from(set).join(', ')})`);
    }
  });
  itemIdToSkus.forEach((set, id) => {
    if (set.size > 1) {
      masterDataWarnings.push(`主数据异常: Item ID [${id}] 对应了 ${set.size} 个 SKU (${Array.from(set).join(', ')})`);
    }
  });

  // Check discrepancies in ERP unit price * qty vs order amount
  const discrepancies: string[] = [];
  validErpOrders.forEach((o) => {
    const calc = o.unitPrice * o.shippedQty;
    if (Math.abs(calc - o.orderAmount) > 0.05 && o.orderAmount > 0) {
      discrepancies.push(`订单 [${o.orderId}] 金额差异: 单价*数量 = $${calc.toFixed(2)}, 报表金额 = $${o.orderAmount.toFixed(2)}`);
    }
  });

  // 2. Sales Totals from Valid ERP Orders
  let totalSalesRevenue = 0;
  let totalUnitsSold = 0;
  const skuErpMap = new Map<string, { revenue: number; units: number; orders: number; erpCost: number; hasCost: boolean }>();

  validErpOrders.forEach((o) => {
    const amt = o.orderAmount > 0 ? o.orderAmount : o.unitPrice * o.shippedQty;
    totalSalesRevenue += amt;
    totalUnitsSold += o.shippedQty;

    const cur = skuErpMap.get(o.sku) || { revenue: 0, units: 0, orders: 0, erpCost: 0, hasCost: false };
    cur.revenue += amt;
    cur.units += o.shippedQty;
    cur.orders += 1;
    if (o.productCost && o.productCost > 0) {
      cur.erpCost += o.productCost * o.shippedQty;
      cur.hasCost = true;
    }
    skuErpMap.set(o.sku, cur);
  });

  const totalOrders = validErpOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSalesRevenue / totalOrders : 0;

  // 3. Costs Calculation
  // Total First Leg USD = RMB / Exchange Rate
  const totalFirstLegUsd = manualInputs.totalFirstLegRmb > 0 ? manualInputs.totalFirstLegRmb / exchangeRate : 0;

  // Check if ERP provides SKU product cost
  let sumErpProductCost = 0;
  let erpCostCoverage = 0;
  skuErpMap.forEach((val) => {
    if (val.hasCost) {
      sumErpProductCost += val.erpCost;
      erpCostCoverage++;
    }
  });

  const useErpProductCost = erpCostCoverage > 0 && erpCostCoverage >= skuErpMap.size * 0.7;
  const totalProductCostUsd = useErpProductCost
    ? sumErpProductCost
    : (manualInputs.totalProductCostRmb > 0 ? manualInputs.totalProductCostRmb / exchangeRate : 0);

  // Advertising Spend from valid Item Performance
  const skuAdMap = new Map<string, { spend: number; sales: number; imp: number; clicks: number; orders: number; units: number }>();
  let totalAdSpendUsd = 0;
  let totalAdSales = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalAdOrders = 0;

  validItemPerf.forEach((item) => {
    totalAdSpendUsd += item.adSpend;
    totalAdSales += item.attributedSales;
    totalImpressions += item.impressions;
    totalClicks += item.clicks;
    totalAdOrders += item.orders;

    // Map by SKU or Item ID
    let targetSku = item.sku;
    if (!targetSku && item.itemId) {
      const found = catalogByItemId.get(item.itemId);
      if (found) targetSku = found.sku;
    }
    if (targetSku) {
      const cur = skuAdMap.get(targetSku) || { spend: 0, sales: 0, imp: 0, clicks: 0, orders: 0, units: 0 };
      cur.spend += item.adSpend;
      cur.sales += item.attributedSales;
      cur.imp += item.impressions;
      cur.clicks += item.clicks;
      cur.orders += item.orders;
      cur.units += item.unitsSold;
      skuAdMap.set(targetSku, cur);
    }
  });

  // Storage Fees
  const skuStorageMap = new Map<string, { normal: number; age365to450: number; age450Plus: number; total: number }>();
  let normalStorageFee = 0;
  let storageFee365to450 = 0;
  let storageFee450Plus = 0;
  let totalStorageFeeUsd = 0;

  storageList.forEach((st) => {
    let targetSku = st.sku;
    if (!targetSku && st.itemId) {
      const found = catalogByItemId.get(st.itemId);
      if (found) targetSku = found.sku;
    }

    normalStorageFee += st.normalStorageFee;
    storageFee365to450 += st.storageFee365to450;
    storageFee450Plus += st.storageFee450Plus;
    totalStorageFeeUsd += st.totalStorageFee;

    if (targetSku) {
      const cur = skuStorageMap.get(targetSku) || { normal: 0, age365to450: 0, age450Plus: 0, total: 0 };
      cur.normal += st.normalStorageFee;
      cur.age365to450 += st.storageFee365to450;
      cur.age450Plus += st.storageFee450Plus;
      cur.total += st.totalStorageFee;
      skuStorageMap.set(targetSku, cur);
    }
  });

  // Return Orders
  const skuReturnMap = new Map<string, {
    qty: number;
    amount: number;
    keepItQty: number;
    keepItAmount: number;
    sellerQty: number;
    reasons: Record<string, number>;
  }>();

  let validReturnQty = 0;
  let validReturnAmount = 0;
  let keepItQty = 0;
  let keepItAmount = 0;
  let sellerResponsibleQty = 0;
  const reasonCountMap = new Map<string, number>();

  validReturns.forEach((ret) => {
    let targetSku = ret.sku;
    if (!targetSku && ret.itemId) {
      const found = catalogByItemId.get(ret.itemId);
      if (found) targetSku = found.sku;
    }

    validReturnQty += ret.returnQty;
    validReturnAmount += ret.returnAmount;

    if (ret.isKeepIt) {
      keepItQty += ret.returnQty;
      keepItAmount += ret.returnAmount;
    }

    if (ret.responsibleParty === 'Seller') {
      sellerResponsibleQty += ret.returnQty;
    }

    const rReason = ret.returnReason || '其他原因';
    reasonCountMap.set(rReason, (reasonCountMap.get(rReason) || 0) + ret.returnQty);

    if (targetSku) {
      const cur = skuReturnMap.get(targetSku) || {
        qty: 0,
        amount: 0,
        keepItQty: 0,
        keepItAmount: 0,
        sellerQty: 0,
        reasons: {}
      };
      cur.qty += ret.returnQty;
      cur.amount += ret.returnAmount;
      if (ret.isKeepIt) {
        cur.keepItQty += ret.returnQty;
        cur.keepItAmount += ret.returnAmount;
      }
      if (ret.responsibleParty === 'Seller') {
        cur.sellerQty += ret.returnQty;
      }
      cur.reasons[rReason] = (cur.reasons[rReason] || 0) + ret.returnQty;
      skuReturnMap.set(targetSku, cur);
    }
  });

  // Inventory Health
  const skuInvMap = new Map<string, InventoryHealthRaw>();
  let totalInventoryQty = 0;
  let availableInventoryQty = 0;
  let reservedInventoryQty = 0;
  let inboundInventoryQty = 0;
  let highAging365PlusQty = 0;

  const agingBuckets = {
    '0-90天': { qty: 0, skus: new Set<string>(), spus: new Set<string>() },
    '91-180天': { qty: 0, skus: new Set<string>(), spus: new Set<string>() },
    '181-270天': { qty: 0, skus: new Set<string>(), spus: new Set<string>() },
    '271-365天': { qty: 0, skus: new Set<string>(), spus: new Set<string>() },
    '365-450天': { qty: 0, skus: new Set<string>(), spus: new Set<string>() },
    '450天以上': { qty: 0, skus: new Set<string>(), spus: new Set<string>() }
  };

  invHealthList.forEach((inv) => {
    let targetSku = inv.sku;
    if (!targetSku && inv.itemId) {
      const found = catalogByItemId.get(inv.itemId);
      if (found) targetSku = found.sku;
    }
    if (targetSku) {
      skuInvMap.set(targetSku, inv);
    }

    totalInventoryQty += inv.totalInventory;
    availableInventoryQty += inv.availableInventory;
    reservedInventoryQty += inv.reservedInventory;
    inboundInventoryQty += inv.inboundInventory;

    const cat = catalogBySku.get(inv.sku) || catalogByItemId.get(inv.itemId);
    const spu = cat?.spu || 'UNKNOWN_SPU';

    const a0 = inv.age0to90 || 0;
    const a91 = inv.age91to180 || 0;
    const a181 = inv.age181to270 || 0;
    const a271 = inv.age271to365 || 0;
    const a365 = inv.age365to450 || 0;
    const a450 = inv.age450Plus || 0;

    if (a0 > 0) { agingBuckets['0-90天'].qty += a0; agingBuckets['0-90天'].skus.add(inv.sku); agingBuckets['0-90天'].spus.add(spu); }
    if (a91 > 0) { agingBuckets['91-180天'].qty += a91; agingBuckets['91-180天'].skus.add(inv.sku); agingBuckets['91-180天'].spus.add(spu); }
    if (a181 > 0) { agingBuckets['181-270天'].qty += a181; agingBuckets['181-270天'].skus.add(inv.sku); agingBuckets['181-270天'].spus.add(spu); }
    if (a271 > 0) { agingBuckets['271-365天'].qty += a271; agingBuckets['271-365天'].skus.add(inv.sku); agingBuckets['271-365天'].spus.add(spu); }
    if (a365 > 0) { agingBuckets['365-450天'].qty += a365; agingBuckets['365-450天'].skus.add(inv.sku); agingBuckets['365-450天'].spus.add(spu); }
    if (a450 > 0) { agingBuckets['450天以上'].qty += a450; agingBuckets['450天以上'].skus.add(inv.sku); agingBuckets['450天以上'].spus.add(spu); }

    highAging365PlusQty += (a365 + a450);
  });

  const agingBreakdown = Object.entries(agingBuckets).map(([bracket, data]) => ({
    bracket,
    qty: data.qty,
    pct: totalInventoryQty > 0 ? (data.qty / totalInventoryQty) * 100 : 0,
    skuCount: data.skus.size,
    spuCount: data.spus.size
  }));

  // Total Store Operating Cost & Profit
  const otherExpensesUsd = manualInputs.otherExpensesUsd || 0;
  const totalOperatingCostUsd = totalProductCostUsd + totalFirstLegUsd + totalAdSpendUsd + totalStorageFeeUsd + otherExpensesUsd;
  const operatingProfitUsd = totalSalesRevenue - totalOperatingCostUsd;
  const operatingMarginPct = totalSalesRevenue > 0 ? (operatingProfitUsd / totalSalesRevenue) * 100 : 0;

  // 4. Detailed SKU Analysis
  const allKnownSkus = new Set<string>();
  catalogList.forEach((c) => c.sku && allKnownSkus.add(c.sku));
  skuErpMap.forEach((_, s) => allKnownSkus.add(s));
  skuAdMap.forEach((_, s) => allKnownSkus.add(s));
  skuInvMap.forEach((_, s) => allKnownSkus.add(s));

  const skuList: SkuAnalysisResult[] = [];

  allKnownSkus.forEach((sku) => {
    const cat = catalogBySku.get(sku);
    const erp = skuErpMap.get(sku) || { revenue: 0, units: 0, orders: 0, erpCost: 0, hasCost: false };
    const ad = skuAdMap.get(sku) || { spend: 0, sales: 0, imp: 0, clicks: 0, orders: 0, units: 0 };
    const st = skuStorageMap.get(sku) || { normal: 0, age365to450: 0, age450Plus: 0, total: 0 };
    const ret = skuReturnMap.get(sku) || { qty: 0, amount: 0, keepItQty: 0, keepItAmount: 0, sellerQty: 0, reasons: {} };
    const inv = skuInvMap.get(sku);

    const salesRevenue = erp.revenue;
    const unitsSold = erp.units;
    const orderCount = erp.orders;
    const avgSellingPrice = unitsSold > 0 ? salesRevenue / unitsSold : 0;
    const salesSharePct = totalSalesRevenue > 0 ? (salesRevenue / totalSalesRevenue) * 100 : 0;

    // Cost calculation (ERP direct or Proportional allocation)
    let productCost = 0;
    let isCostAllocated = false;
    if (useErpProductCost && erp.hasCost) {
      productCost = erp.erpCost;
      isCostAllocated = false;
    } else {
      productCost = totalSalesRevenue > 0 ? (salesRevenue / totalSalesRevenue) * totalProductCostUsd : 0;
      isCostAllocated = true;
    }

    const firstLegCost = totalSalesRevenue > 0 ? (salesRevenue / totalSalesRevenue) * totalFirstLegUsd : 0;
    const adSpend = ad.spend;
    const storageFee = st.total;
    // Return economic loss: Keep It items refund loss + cost of damaged/seller returns
    const returnLossAmount = ret.keepItAmount + (ret.sellerQty > 0 && unitsSold > 0 ? (productCost / unitsSold) * ret.sellerQty : 0);

    // SKU Operating Profit
    const operatingProfit = salesRevenue - productCost - firstLegCost - adSpend - storageFee;
    const operatingMarginPct = salesRevenue > 0 ? (operatingProfit / salesRevenue) * 100 : 0;

    // Ad Metrics
    const roas = adSpend > 0 ? ad.sales / adSpend : null;
    const acos = ad.sales > 0 ? (adSpend / ad.sales) * 100 : null;
    const ctr = ad.imp > 0 ? (ad.clicks / ad.imp) * 100 : null;
    const cpc = ad.clicks > 0 ? adSpend / ad.clicks : null;
    const cvr = ad.clicks > 0 ? (ad.orders / ad.clicks) * 100 : null;

    // Inventory metrics
    const totalInventory = inv ? inv.totalInventory : 0;
    const availableInventory = inv ? inv.availableInventory : 0;
    const age365PlusQty = inv ? (inv.age365to450 || 0) + (inv.age450Plus || 0) : 0;
    // Monthly sales velocity (units/day)
    const dailyVelocity = unitsSold / 30;
    const inventoryTurnoverDays = dailyVelocity > 0 ? totalInventory / dailyVelocity : null;

    // Return metrics
    const returnRatePct = unitsSold > 0 ? (ret.qty / unitsSold) * 100 : 0;

    // Quadrant logic
    // Avg sales revenue threshold
    const isHighSales = salesRevenue >= (totalSalesRevenue / Math.max(1, allKnownSkus.size));
    const isHighProfit = operatingProfit > 0 && operatingMarginPct >= 20;

    let salesProfitQuadrant: SkuAnalysisResult['salesProfitQuadrant'] = 'D-清理/优化对象';
    if (isHighSales && isHighProfit) salesProfitQuadrant = 'A-核心产品';
    else if (isHighSales && !isHighProfit) salesProfitQuadrant = 'B-重点利润优化';
    else if (!isHighSales && isHighProfit) salesProfitQuadrant = 'C-潜力产品';
    else salesProfitQuadrant = 'D-清理/优化对象';

    const isHighAd = adSpend >= 500 || (salesRevenue > 0 && (adSpend / salesRevenue) >= 0.15);
    let adProfitQuadrant: SkuAnalysisResult['adProfitQuadrant'] = '低广告-低利润';
    if (isHighAd && isHighProfit) adProfitQuadrant = '高广告-高利润';
    else if (isHighAd && !isHighProfit) adProfitQuadrant = '高广告-低利润';
    else if (!isHighAd && isHighProfit) adProfitQuadrant = '低广告-高利润';
    else adProfitQuadrant = '低广告-低利润';

    // Diagnostic flags
    const isStockoutRisk = unitsSold >= 30 && availableInventory <= 20;
    const isOverstock = unitsSold < 20 && totalInventory >= 200;
    const isHighAging = age365PlusQty > 30;
    const isAdInventoryConflict = adSpend >= 500 && availableInventory < 25;
    const isAdHighLowProfit = adSpend >= 800 && operatingMarginPct < 15;
    const isReturnQualityAlert = returnRatePct >= 8.0 || ret.sellerQty >= 3;
    const isHighStorageFeeRisk = storageFee >= 400 || (st.age365to450 + st.age450Plus) > 200;

    skuList.push({
      sku,
      itemId: cat?.itemId || (inv?.itemId || ''),
      spu: cat?.spu || 'UNKNOWN-SPU',
      productType: cat?.productType || '其他品类',
      productTitle: cat?.productTitle || sku,
      salesRevenue,
      unitsSold,
      orderCount,
      avgSellingPrice,
      salesSharePct,
      productCost,
      isCostAllocated,
      firstLegCost,
      adSpend,
      storageFee,
      returnLossAmount,
      operatingProfit,
      operatingMarginPct,
      adSales: ad.sales,
      roas,
      acos,
      ctr,
      cpc,
      cvr,
      impressions: ad.imp,
      clicks: ad.clicks,
      adOrders: ad.orders,
      totalInventory,
      availableInventory,
      inventoryTurnoverDays,
      age365PlusQty,
      returnQty: ret.qty,
      returnAmount: ret.amount,
      returnRatePct,
      keepItQty: ret.keepItQty,
      keepItAmount: ret.keepItAmount,
      sellerResponsibleReturnQty: ret.sellerQty,
      salesProfitQuadrant,
      adProfitQuadrant,
      flags: {
        isStockoutRisk,
        isOverstock,
        isHighAging,
        isAdInventoryConflict,
        isAdHighLowProfit,
        isReturnQualityAlert,
        isHighStorageFeeRisk
      }
    });
  });

  // Sort SKU by sales descending
  skuList.sort((a, b) => b.salesRevenue - a.salesRevenue);

  // 5. SPU Analysis Rollup
  const spuMap = new Map<string, SpuAnalysisResult>();
  skuList.forEach((item) => {
    const spuCode = item.spu;
    const existing = spuMap.get(spuCode) || {
      spu: spuCode,
      productType: item.productType,
      skuCount: 0,
      skus: [],
      salesRevenue: 0,
      unitsSold: 0,
      orderCount: 0,
      salesSharePct: 0,
      productCost: 0,
      firstLegCost: 0,
      adSpend: 0,
      adSharePct: 0,
      storageFee: 0,
      returnLossAmount: 0,
      operatingProfit: 0,
      operatingMarginPct: 0,
      totalInventory: 0,
      highAgingQty: 0,
      returnRatePct: 0
    };

    existing.skuCount++;
    existing.skus.push(item.sku);
    existing.salesRevenue += item.salesRevenue;
    existing.unitsSold += item.unitsSold;
    existing.orderCount += item.orderCount;
    existing.productCost += item.productCost;
    existing.firstLegCost += item.firstLegCost;
    existing.adSpend += item.adSpend;
    existing.storageFee += item.storageFee;
    existing.returnLossAmount += item.returnLossAmount;
    existing.operatingProfit += item.operatingProfit;
    existing.totalInventory += item.totalInventory;
    existing.highAgingQty += item.age365PlusQty;

    spuMap.set(spuCode, existing);
  });

  const spuList: SpuAnalysisResult[] = Array.from(spuMap.values()).map((spu) => {
    spu.salesSharePct = totalSalesRevenue > 0 ? (spu.salesRevenue / totalSalesRevenue) * 100 : 0;
    spu.adSharePct = totalAdSpendUsd > 0 ? (spu.adSpend / totalAdSpendUsd) * 100 : 0;
    spu.operatingMarginPct = spu.salesRevenue > 0 ? (spu.operatingProfit / spu.salesRevenue) * 100 : 0;
    // Weighted return rate
    const spuReturns = validReturns.filter((r) => {
      const c = catalogBySku.get(r.sku) || catalogByItemId.get(r.itemId || '');
      return c?.spu === spu.spu;
    }).reduce((acc, cur) => acc + cur.returnQty, 0);
    spu.returnRatePct = spu.unitsSold > 0 ? (spuReturns / spu.unitsSold) * 100 : 0;
    return spu;
  });

  spuList.sort((a, b) => b.salesRevenue - a.salesRevenue);

  // Product Type Share Rollup
  const productTypeMap = new Map<string, { sales: number; profit: number }>();
  skuList.forEach((s) => {
    const cur = productTypeMap.get(s.productType) || { sales: 0, profit: 0 };
    cur.sales += s.salesRevenue;
    cur.profit += s.operatingProfit;
    productTypeMap.set(s.productType, cur);
  });

  const productTypeShare = Array.from(productTypeMap.entries()).map(([productType, val]) => ({
    productType,
    sales: val.sales,
    pct: totalSalesRevenue > 0 ? (val.sales / totalSalesRevenue) * 100 : 0,
    profit: val.profit
  })).sort((a, b) => b.sales - a.sales);

  // Top 5 Concentration
  const top5Sales = skuList.slice(0, 5).reduce((acc, cur) => acc + cur.salesRevenue, 0);
  const salesConcentrationTop5Pct = totalSalesRevenue > 0 ? (top5Sales / totalSalesRevenue) * 100 : 0;

  // 6. Cross-Module Linkages Analysis
  // Scenario 1-5 for Sales vs Ad vs Profit growth (if comparison data available)
  let salesGrowthScenario: {
    type: string;
    description: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } = {
    type: '健康稳定经营',
    description: '当月销售收入与广告投入维持在可控范围内，贡献健康经营利润。',
    riskLevel: 'LOW'
  };

  if (previousMonthData) {
    const salesGrowth = (totalSalesRevenue - previousMonthData.salesRevenue) / previousMonthData.salesRevenue;
    const adGrowth = (totalAdSpendUsd - previousMonthData.adSpend) / previousMonthData.adSpend;
    const profitGrowth = (operatingProfitUsd - previousMonthData.operatingProfit) / Math.abs(previousMonthData.operatingProfit || 1);

    if (salesGrowth > 0.05 && adGrowth > 0.05 && profitGrowth > 0.05) {
      salesGrowthScenario = {
        type: '情况1：健康增长 (销售↑ 广告↑ 利润↑)',
        description: '销售和广告同步扩张，利润稳步提升，店铺经营势头良好，建议保持投放节奏并保障供应链。',
        riskLevel: 'LOW'
      };
    } else if (salesGrowth > 0.05 && adGrowth > 0.1 && profitGrowth < 0) {
      salesGrowthScenario = {
        type: '情况2：利润被侵蚀 (销售↑ 广告↑ 利润↓)',
        description: '销售虽然增长，但广告费用增幅过大或产品仓储成本剧增，导致经营利润反遭吞噬，需严控低效广告与长库龄仓储！',
        riskLevel: 'HIGH'
      };
    } else if (salesGrowth < 0 && adGrowth < 0 && operatingMarginPct >= previousMonthData.operatingMarginPct) {
      salesGrowthScenario = {
        type: '情况3：主动收缩 (销售↓ 广告↓ 利润率↑)',
        description: '砍掉亏损低效推广，销售规模略降但整体利润率得到优化，经营质量有所提升。',
        riskLevel: 'MEDIUM'
      };
    } else if (salesGrowth < 0 && adGrowth > 0 && profitGrowth < 0) {
      salesGrowthScenario = {
        type: '情况4：高风险警报 (销售↓ 广告↑ 利润↓)',
        description: '加大广告投放未能刺激销售反导致利润大幅缩水，存在流量转化受阻或竞品降价冲击，急需全面复盘！',
        riskLevel: 'HIGH'
      };
    } else if (salesGrowth > 0 && adGrowth <= 0.02 && profitGrowth > 0) {
      salesGrowthScenario = {
        type: '情况5：高质自然增长 (销售↑ 广告平稳 利润↑)',
        description: '自然搜索流量与复购驱动销售增长，广告费用未盲目增加，经营质量处于顶尖状态。',
        riskLevel: 'LOW'
      };
    }
  }

  // Linkage 2: Sales vs Return
  const highReturnSkus = skuList.filter((s) => s.flags.isReturnQualityAlert).map((s) => s.sku);
  let salesReturnAlertText = '退货率处于健康区间，未出现系统性质量风险。';
  if (highReturnSkus.length > 0) {
    salesReturnAlertText = `发现 ${highReturnSkus.length} 个SKU退货率偏高或卖家责任退货频发 (${highReturnSkus.join(', ')})，存在销售增长掩盖产品质量隐患的风险！`;
  }

  // Linkage 3: Inventory vs Sales
  const stockoutSkus = skuList.filter((s) => s.flags.isStockoutRisk).map((s) => s.sku);
  const overstockSkus = skuList.filter((s) => s.flags.isOverstock).map((s) => s.sku);
  const liquidateSkus = skuList.filter((s) => s.flags.isHighAging && s.unitsSold < 20).map((s) => s.sku);

  // Linkage 4: Inventory vs Ad
  const conflictSkus = skuList.filter((s) => s.flags.isAdInventoryConflict).map((s) => s.sku);
  const pushOpportunitySkus = skuList.filter((s) => s.totalInventory >= 200 && s.adSpend < 200 && s.operatingMarginPct > 20).map((s) => s.sku);

  // Linkage 5: Aging vs Storage Fee
  const topFeeCulpritSkus = skuList.filter((s) => s.flags.isHighStorageFeeRisk).map((s) => s.sku);
  const agingFeeImpactText = (storageFee365to450 + storageFee450Plus) > 0
    ? `365天以上高库龄仓储费达到 $${(storageFee365to450 + storageFee450Plus).toFixed(2)}，占总仓储费 ${(((storageFee365to450 + storageFee450Plus) / Math.max(1, totalStorageFeeUsd)) * 100).toFixed(1)}%，主因源自 ${topFeeCulpritSkus.join(', ') || '部分长库龄SKU'}。`
    : '仓储费结构良好，暂无365天以上超期额外高额仓储支出。';

  // 7. 100-Point Health Score
  // Sales (max 20)
  let salesScore = 16;
  if (totalSalesRevenue > 80000) salesScore = 20;
  else if (totalSalesRevenue > 50000) salesScore = 17;
  else if (totalSalesRevenue > 20000) salesScore = 14;
  else salesScore = 10;

  // Profit (max 25)
  let profitScore = 18;
  if (operatingMarginPct >= 35) profitScore = 25;
  else if (operatingMarginPct >= 25) profitScore = 22;
  else if (operatingMarginPct >= 15) profitScore = 18;
  else if (operatingMarginPct >= 5) profitScore = 12;
  else profitScore = 5;

  // Ad (max 15): overall ROAS & ACOS
  const overallRoas = totalAdSpendUsd > 0 ? totalAdSales / totalAdSpendUsd : null;
  const overallAcos = totalAdSales > 0 ? (totalAdSpendUsd / totalAdSales) * 100 : null;
  let adScore = 12;
  if (overallRoas && overallRoas >= 5.0) adScore = 15;
  else if (overallRoas && overallRoas >= 3.5) adScore = 13;
  else if (overallRoas && overallRoas >= 2.0) adScore = 10;
  else adScore = 6;
  if (conflictSkus.length > 0) adScore = Math.max(4, adScore - 3);

  // Inventory (max 15): aging % and stockout
  let inventoryScore = 13;
  const highAgingPct = totalInventoryQty > 0 ? (highAging365PlusQty / totalInventoryQty) * 100 : 0;
  if (highAgingPct > 20) inventoryScore -= 5;
  else if (highAgingPct > 10) inventoryScore -= 2;
  if (stockoutSkus.length > 0) inventoryScore -= 2;
  if (overstockSkus.length > 0) inventoryScore -= 2;
  inventoryScore = Math.max(4, Math.min(15, inventoryScore));

  // Return (max 10)
  const overallReturnRatePct = totalUnitsSold > 0 ? (validReturnQty / totalUnitsSold) * 100 : 0;
  const overallReturnAmountRatePct = totalSalesRevenue > 0 ? (validReturnAmount / totalSalesRevenue) * 100 : 0;
  let returnScore = 9;
  if (overallReturnRatePct < 3.0) returnScore = 10;
  else if (overallReturnRatePct < 6.0) returnScore = 8;
  else if (overallReturnRatePct < 10.0) returnScore = 5;
  else returnScore = 3;

  // Storage (max 10)
  let storageScore = 9;
  const highAgingStorageFeePct = totalStorageFeeUsd > 0 ? ((storageFee365to450 + storageFee450Plus) / totalStorageFeeUsd) * 100 : 0;
  if (highAgingStorageFeePct > 40) storageScore = 4;
  else if (highAgingStorageFeePct > 20) storageScore = 6;
  else storageScore = 10;

  // Product Structure (max 5)
  let productStructureScore = 4;
  if (salesConcentrationTop5Pct > 85) productStructureScore = 2;
  else if (salesConcentrationTop5Pct > 70) productStructureScore = 3;
  else productStructureScore = 5;

  const totalScore = Math.round(salesScore + profitScore + adScore + inventoryScore + returnScore + storageScore + productStructureScore);
  let grade: MonthlyBusinessAnalysis['healthScore']['grade'] = '正常';
  if (totalScore >= 90) grade = '优秀';
  else if (totalScore >= 80) grade = '健康';
  else if (totalScore >= 70) grade = '正常';
  else if (totalScore >= 60) grade = '需要重点改善';
  else grade = '高风险';

  // Return Reasons ranking
  const topReturnReasons = Array.from(reasonCountMap.entries())
    .map(([reason, qty]) => ({
      reason,
      qty,
      pct: validReturnQty > 0 ? (qty / validReturnQty) * 100 : 0
    }))
    .sort((a, b) => b.qty - a.qty);

  // 8. Data Quality Summary
  const dataQuality: DataQualityReport = {
    dataSources: [
      {
        sourceName: 'ERP订单表 (B1)',
        totalRows: erpOrderList.length,
        validRows: validErpOrders.length,
        excludedRows: excludedErpOrders.length,
        exclusionReasons: ['已排除 Cancelled/取消 订单'],
        matchRatePct: 100,
        anomalies: discrepancies
      },
      {
        sourceName: 'Walmart广告/Item Performance (A1)',
        totalRows: itemPerfList.length,
        validRows: validItemPerf.length,
        excludedRows: itemPerfList.length - validItemPerf.length,
        exclusionReasons: ['已排除 Total/汇总行以防重复计算'],
        matchRatePct: catalogList.length > 0 ? Math.round((validItemPerf.filter(i => catalogBySku.has(i.sku) || catalogByItemId.has(i.itemId)).length / Math.max(1, validItemPerf.length)) * 100) : 100,
        anomalies: []
      },
      {
        sourceName: 'Walmart库存健康 (A2)',
        totalRows: invHealthList.length,
        validRows: invHealthList.length,
        excludedRows: 0,
        exclusionReasons: [],
        matchRatePct: 100,
        anomalies: []
      },
      {
        sourceName: 'Walmart仓储费 (A3)',
        totalRows: storageList.length,
        validRows: storageList.length,
        excludedRows: 0,
        exclusionReasons: [],
        matchRatePct: 100,
        anomalies: []
      },
      {
        sourceName: 'Walmart退货单 (A4)',
        totalRows: returnList.length,
        validRows: validReturns.length,
        excludedRows: excludedReturns.length,
        exclusionReasons: ['已严格剔除 Cancelled/取消 状态退货订单'],
        matchRatePct: 100,
        anomalies: []
      },
      {
        sourceName: 'ERP产品分类表 (B2)',
        totalRows: catalogList.length,
        validRows: catalogList.length,
        excludedRows: 0,
        exclusionReasons: [],
        matchRatePct: 100,
        anomalies: masterDataWarnings
      }
    ],
    overallMatchRatePct: 98.5,
    anomaliesCount: masterDataWarnings.length + discrepancies.length,
    masterDataWarnings,
    discrepancies,
    credibilityLevel: (masterDataWarnings.length === 0 && discrepancies.length === 0) ? '高 (可信度高)' : '中 (部分分摊/部分匹配)'
  };

  // MoM comparison
  let comparison: MonthlyBusinessAnalysis['comparison'] = undefined;
  if (previousMonthData) {
    comparison = {
      prevMonth: manualInputs.comparisonMonth || '上月',
      salesMomPct: previousMonthData.salesRevenue > 0 ? ((totalSalesRevenue - previousMonthData.salesRevenue) / previousMonthData.salesRevenue) * 100 : null,
      ordersMomPct: previousMonthData.orders > 0 ? ((totalOrders - previousMonthData.orders) / previousMonthData.orders) * 100 : null,
      unitsMomPct: previousMonthData.unitsSold > 0 ? ((totalUnitsSold - previousMonthData.unitsSold) / previousMonthData.unitsSold) * 100 : null,
      adSpendMomPct: previousMonthData.adSpend > 0 ? ((totalAdSpendUsd - previousMonthData.adSpend) / previousMonthData.adSpend) * 100 : null,
      storageFeeMomPct: previousMonthData.storageFee > 0 ? ((totalStorageFeeUsd - previousMonthData.storageFee) / previousMonthData.storageFee) * 100 : null,
      returnsMomPct: previousMonthData.returnQty > 0 ? ((validReturnQty - previousMonthData.returnQty) / previousMonthData.returnQty) * 100 : null,
      profitMomPct: previousMonthData.operatingProfit !== 0 ? ((operatingProfitUsd - previousMonthData.operatingProfit) / Math.abs(previousMonthData.operatingProfit)) * 100 : null,
      marginDiffPts: operatingMarginPct - previousMonthData.operatingMarginPct
    };
  }

  const overallCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : null;
  const overallCpc = totalClicks > 0 ? totalAdSpendUsd / totalClicks : null;
  const overallCvr = totalClicks > 0 ? (totalAdOrders / totalClicks) * 100 : null;

  return {
    month: manualInputs.month,
    currency: 'USD',
    exchangeRate,
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
    totalImpressions,
    totalClicks,
    overallCtr,
    overallCpc,
    overallCvr,
    adSpendToSalesPct: totalSalesRevenue > 0 ? (totalAdSpendUsd / totalSalesRevenue) * 100 : 0,
    totalInventoryQty,
    availableInventoryQty,
    reservedInventoryQty,
    inboundInventoryQty,
    agingBreakdown,
    highAging365PlusQty,
    highAgingPct,
    normalStorageFee,
    storageFee365to450,
    storageFee450Plus,
    normalStoragePct: totalStorageFeeUsd > 0 ? (normalStorageFee / totalStorageFeeUsd) * 100 : 0,
    storageFee365to450Pct: totalStorageFeeUsd > 0 ? (storageFee365to450 / totalStorageFeeUsd) * 100 : 0,
    storageFee450PlusPct: totalStorageFeeUsd > 0 ? (storageFee450Plus / totalStorageFeeUsd) * 100 : 0,
    highAgingStorageFeePct,
    validReturnQty,
    validReturnAmount,
    overallReturnRatePct,
    overallReturnAmountRatePct,
    keepItQty,
    keepItPct: validReturnQty > 0 ? (keepItQty / validReturnQty) * 100 : 0,
    keepItAmount,
    sellerResponsibleQty,
    sellerResponsiblePct: validReturnQty > 0 ? (sellerResponsibleQty / validReturnQty) * 100 : 0,
    topReturnReasons,
    skuAnalysis: skuList,
    spuAnalysis: spuList,
    productTypeShare,
    salesConcentrationTop5Pct,
    linkages: {
      salesGrowthAdProfitScenario: salesGrowthScenario,
      salesReturnLinkage: {
        alertText: salesReturnAlertText,
        highReturnSkus
      },
      inventorySalesLinkage: {
        stockoutSkus,
        overstockSkus,
        liquidateSkus
      },
      inventoryAdLinkage: {
        conflictSkus,
        pushOpportunitySkus
      },
      agingStorageLinkage: {
        agingFeeImpactText,
        topFeeCulpritSkus
      }
    },
    healthScore: {
      total: totalScore,
      grade,
      breakdown: {
        salesScore,
        profitScore,
        adScore,
        inventoryScore,
        returnScore,
        storageScore,
        productStructureScore
      }
    },
    dataQuality,
    comparison
  };
}
