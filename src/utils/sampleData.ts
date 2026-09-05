import {
  ItemPerformanceRaw,
  InventoryHealthRaw,
  StorageRaw,
  ReturnOrderRaw,
  ErpOrderRaw,
  ProductCatalogRaw,
  ManualInputs
} from '../types';

export const SAMPLE_CATALOG: ProductCatalogRaw[] = [
  { itemId: 'WMT-1001', sku: 'WM-CHAIR-BLK', spu: 'SPU-OFFICE-CHAIR', productType: '办公家具', productTitle: 'Ergonomic Mesh Office Chair High Back - Black' },
  { itemId: 'WMT-1002', sku: 'WM-CHAIR-GRY', spu: 'SPU-OFFICE-CHAIR', productType: '办公家具', productTitle: 'Ergonomic Mesh Office Chair High Back - Grey' },
  { itemId: 'WMT-1003', sku: 'WM-DESK-55IN', spu: 'SPU-ELECTRIC-DESK', productType: '办公家具', productTitle: 'Electric Height Adjustable Standing Desk 55x28 Inch' },
  { itemId: 'WMT-1004', sku: 'WM-DESK-48IN', spu: 'SPU-ELECTRIC-DESK', productType: '办公家具', productTitle: 'Electric Height Adjustable Standing Desk 48x24 Inch' },
  { itemId: 'WMT-1005', sku: 'WM-MON-ARM-S', spu: 'SPU-MONITOR-MOUNT', productType: '电脑数码周边', productTitle: 'Single Gas Spring Monitor Desk Mount 17-32 Inch' },
  { itemId: 'WMT-1006', sku: 'WM-MON-ARM-D', spu: 'SPU-MONITOR-MOUNT', productType: '电脑数码周边', productTitle: 'Dual Gas Spring Monitor Arm Heavy Duty 35 lbs' },
  { itemId: 'WMT-1007', sku: 'WM-LAMP-LED', spu: 'SPU-DESK-LIGHT', productType: '家居灯饰', productTitle: 'Architect LED Desk Lamp with Clamp Eye-Care' },
  { itemId: 'WMT-1008', sku: 'WM-MAT-ANTI', spu: 'SPU-FLOOR-MAT', productType: '办公家具', productTitle: 'Anti-Fatigue Standing Mat for Standing Desk Cushion' },
  { itemId: 'WMT-1009', sku: 'WM-RGB-BAR', spu: 'SPU-DESK-LIGHT', productType: '家居灯饰', productTitle: 'Monitor Light Bar RGB Backlight ScreenBar' },
  { itemId: 'WMT-1010', sku: 'WM-CBL-TRAY', spu: 'SPU-CABLE-MGMT', productType: '家居配件', productTitle: 'Under Desk Cable Management Tray No Drill' }
];

export const SAMPLE_MANUAL_INPUTS_AUG_2026: ManualInputs = {
  month: '2026-08',
  totalFirstLegRmb: 58500, // RMB
  totalProductCostRmb: 184500, // RMB
  exchangeRate: 7.20, // USD/RMB 用户手动输入
  otherExpensesUsd: 1250, // 软件费/杂费 USD
  comparisonMonth: '2026-07'
};

export const SAMPLE_MANUAL_INPUTS_JUL_2026: ManualInputs = {
  month: '2026-07',
  totalFirstLegRmb: 52000,
  totalProductCostRmb: 168000,
  exchangeRate: 7.20,
  otherExpensesUsd: 1100
};

// Walmart Item Performance / Advertising for August 2026
export const SAMPLE_ITEM_PERFORMANCE_AUG_2026: ItemPerformanceRaw[] = [
  { itemId: 'WMT-1001', sku: 'WM-CHAIR-BLK', itemName: 'Ergonomic Mesh Office Chair Black', adSpend: 2450.00, impressions: 215000, clicks: 3820, orders: 195, attributedSales: 19480.50, unitsSold: 195, level: 'SKU' },
  { itemId: 'WMT-1002', sku: 'WM-CHAIR-GRY', itemName: 'Ergonomic Mesh Office Chair Grey', adSpend: 1120.00, impressions: 98000, clicks: 1650, orders: 74, attributedSales: 7392.60, unitsSold: 74, level: 'SKU' },
  { itemId: 'WMT-1003', sku: 'WM-DESK-55IN', itemName: 'Electric Standing Desk 55x28', adSpend: 3650.00, impressions: 290000, clicks: 4210, orders: 142, attributedSales: 28385.80, unitsSold: 142, level: 'SKU' },
  { itemId: 'WMT-1004', sku: 'WM-DESK-48IN', itemName: 'Electric Standing Desk 48x24', adSpend: 1880.00, impressions: 162000, clicks: 2380, orders: 88, attributedSales: 14951.20, unitsSold: 88, level: 'SKU' },
  { itemId: 'WMT-1005', sku: 'WM-MON-ARM-S', itemName: 'Single Monitor Desk Mount', adSpend: 420.00, impressions: 65000, clicks: 1120, orders: 95, attributedSales: 3790.50, unitsSold: 95, level: 'SKU' },
  { itemId: 'WMT-1006', sku: 'WM-MON-ARM-D', itemName: 'Dual Gas Spring Monitor Arm', adSpend: 1680.00, impressions: 145000, clicks: 2150, orders: 52, attributedSales: 3634.80, unitsSold: 52, level: 'SKU' },
  { itemId: 'WMT-1007', sku: 'WM-LAMP-LED', itemName: 'Architect LED Desk Lamp', adSpend: 350.00, impressions: 52000, clicks: 940, orders: 82, attributedSales: 3271.80, unitsSold: 82, level: 'SKU' },
  { itemId: 'WMT-1008', sku: 'WM-MAT-ANTI', itemName: 'Anti-Fatigue Standing Mat', adSpend: 290.00, impressions: 41000, clicks: 760, orders: 61, attributedSales: 1823.90, unitsSold: 61, level: 'SKU' },
  { itemId: 'WMT-1009', sku: 'WM-RGB-BAR', itemName: 'Monitor Light Bar RGB', adSpend: 1450.00, impressions: 188000, clicks: 2980, orders: 38, attributedSales: 1896.20, unitsSold: 38, level: 'SKU' },
  { itemId: 'WMT-1010', sku: 'WM-CBL-TRAY', itemName: 'Under Desk Cable Tray', adSpend: 95.00, impressions: 22000, clicks: 390, orders: 46, attributedSales: 1145.40, unitsSold: 46, level: 'SKU' }
];

// Inventory Health for August 2026
export const SAMPLE_INVENTORY_HEALTH_AUG_2026: InventoryHealthRaw[] = [
  { itemId: 'WMT-1001', sku: 'WM-CHAIR-BLK', totalInventory: 280, availableInventory: 260, reservedInventory: 15, inboundInventory: 200, age0to90: 210, age91to180: 50, age181to270: 20, age271to365: 0, age365to450: 0, age450Plus: 0 },
  { itemId: 'WMT-1002', sku: 'WM-CHAIR-GRY', totalInventory: 190, availableInventory: 180, reservedInventory: 10, inboundInventory: 80, age0to90: 120, age91to180: 45, age181to270: 25, age271to365: 0, age365to450: 0, age450Plus: 0 },
  { itemId: 'WMT-1003', sku: 'WM-DESK-55IN', totalInventory: 85, availableInventory: 70, reservedInventory: 15, inboundInventory: 150, age0to90: 75, age91to180: 10, age181to270: 0, age271to365: 0, age365to450: 0, age450Plus: 0 }, // Low stock vs high sales
  { itemId: 'WMT-1004', sku: 'WM-DESK-48IN', totalInventory: 140, availableInventory: 130, reservedInventory: 10, inboundInventory: 50, age0to90: 110, age91to180: 30, age181to270: 0, age271to365: 0, age365to450: 0, age450Plus: 0 },
  { itemId: 'WMT-1005', sku: 'WM-MON-ARM-S', totalInventory: 410, availableInventory: 395, reservedInventory: 15, inboundInventory: 0, age0to90: 280, age91to180: 90, age181to270: 40, age271to365: 0, age365to450: 0, age450Plus: 0 },
  { itemId: 'WMT-1006', sku: 'WM-MON-ARM-D', totalInventory: 650, availableInventory: 630, reservedInventory: 20, inboundInventory: 0, age0to90: 80, age91to180: 120, age181to270: 160, age271to365: 140, age365to450: 95, age450Plus: 55 }, // High aging & long-term fee!
  { itemId: 'WMT-1007', sku: 'WM-LAMP-LED', totalInventory: 320, availableInventory: 310, reservedInventory: 10, inboundInventory: 0, age0to90: 260, age91to180: 60, age181to270: 0, age271to365: 0, age365to450: 0, age450Plus: 0 },
  { itemId: 'WMT-1008', sku: 'WM-MAT-ANTI', totalInventory: 520, availableInventory: 510, reservedInventory: 10, inboundInventory: 0, age0to90: 90, age91to180: 110, age181to270: 140, age271to365: 110, age365to450: 45, age450Plus: 25 }, // High stock, slow sales
  { itemId: 'WMT-1009', sku: 'WM-RGB-BAR', totalInventory: 35, availableInventory: 25, reservedInventory: 10, inboundInventory: 0, age0to90: 35, age91to180: 0, age181to270: 0, age271to365: 0, age365to450: 0, age450Plus: 0 }, // Low stock but high ad spend conflict!
  { itemId: 'WMT-1010', sku: 'WM-CBL-TRAY', totalInventory: 480, availableInventory: 470, reservedInventory: 10, inboundInventory: 0, age0to90: 380, age91to180: 100, age181to270: 0, age271to365: 0, age365to450: 0, age450Plus: 0 }
];

// Storage for August 2026
export const SAMPLE_STORAGE_AUG_2026: StorageRaw[] = [
  { itemId: 'WMT-1001', sku: 'WM-CHAIR-BLK', normalStorageFee: 420.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 420.00 },
  { itemId: 'WMT-1002', sku: 'WM-CHAIR-GRY', normalStorageFee: 285.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 285.00 },
  { itemId: 'WMT-1003', sku: 'WM-DESK-55IN', normalStorageFee: 310.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 310.00 },
  { itemId: 'WMT-1004', sku: 'WM-DESK-48IN', normalStorageFee: 260.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 260.00 },
  { itemId: 'WMT-1005', sku: 'WM-MON-ARM-S', normalStorageFee: 145.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 145.00 },
  { itemId: 'WMT-1006', sku: 'WM-MON-ARM-D', normalStorageFee: 230.00, storageFee365to450: 425.00, storageFee450Plus: 590.00, totalStorageFee: 1245.00 }, // Culprit for high aging storage fee!
  { itemId: 'WMT-1007', sku: 'WM-LAMP-LED', normalStorageFee: 95.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 95.00 },
  { itemId: 'WMT-1008', sku: 'WM-MAT-ANTI', normalStorageFee: 180.00, storageFee365to450: 195.00, storageFee450Plus: 160.00, totalStorageFee: 535.00 }, // Culprit 2
  { itemId: 'WMT-1009', sku: 'WM-RGB-BAR', normalStorageFee: 35.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 35.00 },
  { itemId: 'WMT-1010', sku: 'WM-CBL-TRAY', normalStorageFee: 85.00, storageFee365to450: 0, storageFee450Plus: 0, totalStorageFee: 85.00 }
];

// Return Orders for August 2026 (including Cancelled orders to verify filtering!)
export const SAMPLE_RETURN_ORDERS_AUG_2026: ReturnOrderRaw[] = [
  { returnOrderId: 'RET-202608-001', orderId: 'ORD-9801', sku: 'WM-CHAIR-BLK', itemId: 'WMT-1001', returnQty: 1, returnAmount: 99.90, returnReason: '产品质量/部件损坏', isKeepIt: false, responsibleParty: 'Seller', status: 'Completed' },
  { returnOrderId: 'RET-202608-002', orderId: 'ORD-9804', sku: 'WM-CHAIR-BLK', itemId: 'WMT-1001', returnQty: 1, returnAmount: 99.90, returnReason: '尺寸不合', isKeepIt: false, responsibleParty: 'Customer', status: 'Completed' },
  { returnOrderId: 'RET-202608-003', orderId: 'ORD-9812', sku: 'WM-CHAIR-BLK', itemId: 'WMT-1001', returnQty: 1, returnAmount: 99.90, returnReason: '少发配件', isKeepIt: true, responsibleParty: 'Seller', status: 'Completed' }, // Keep It
  { returnOrderId: 'RET-202608-004', orderId: 'ORD-9820', sku: 'WM-CHAIR-GRY', itemId: 'WMT-1002', returnQty: 1, returnAmount: 99.90, returnReason: '颜色与描述不符', isKeepIt: false, responsibleParty: 'Seller', status: 'Completed' },
  { returnOrderId: 'RET-202608-005', orderId: 'ORD-9831', sku: 'WM-DESK-55IN', itemId: 'WMT-1003', returnQty: 1, returnAmount: 199.90, returnReason: '电机升降异响', isKeepIt: false, responsibleParty: 'Seller', status: 'Completed' },
  { returnOrderId: 'RET-202608-006', orderId: 'ORD-9839', sku: 'WM-DESK-55IN', itemId: 'WMT-1003', returnQty: 1, returnAmount: 199.90, returnReason: '桌面轻微磕碰', isKeepIt: true, responsibleParty: 'Seller', status: 'Completed' }, // Keep It
  { returnOrderId: 'RET-202608-007', orderId: 'ORD-9844', sku: 'WM-DESK-48IN', itemId: 'WMT-1004', returnQty: 1, returnAmount: 169.90, returnReason: '客户不需要了/改变心意', isKeepIt: false, responsibleParty: 'Customer', status: 'Completed' },
  { returnOrderId: 'RET-202608-008', orderId: 'ORD-9855', sku: 'WM-MON-ARM-D', itemId: 'WMT-1006', returnQty: 1, returnAmount: 69.90, returnReason: '承重不足下垂', isKeepIt: false, responsibleParty: 'Seller', status: 'Completed' },
  { returnOrderId: 'RET-202608-009', orderId: 'ORD-9860', sku: 'WM-MON-ARM-D', itemId: 'WMT-1006', returnQty: 1, returnAmount: 69.90, returnReason: '螺丝滑丝无法固定', isKeepIt: false, responsibleParty: 'Seller', status: 'Completed' },
  { returnOrderId: 'RET-202608-010', orderId: 'ORD-9872', sku: 'WM-RGB-BAR', itemId: 'WMT-1009', returnQty: 1, returnAmount: 49.90, returnReason: '遥控器失灵', isKeepIt: false, responsibleParty: 'Seller', status: 'Completed' },
  { returnOrderId: 'RET-202608-011', orderId: 'ORD-9875', sku: 'WM-RGB-BAR', itemId: 'WMT-1009', returnQty: 1, returnAmount: 49.90, returnReason: '灯条闪烁', isKeepIt: true, responsibleParty: 'Seller', status: 'Completed' }, // Keep It
  // CANCELLED RETURNS: Must be ignored in calculation according to prompt Section 5!
  { returnOrderId: 'RET-202608-CANCEL-1', orderId: 'ORD-9880', sku: 'WM-CHAIR-BLK', itemId: 'WMT-1001', returnQty: 2, returnAmount: 199.80, returnReason: '买家取消退货', isKeepIt: false, responsibleParty: 'Customer', status: 'Cancelled' },
  { returnOrderId: 'RET-202608-CANCEL-2', orderId: 'ORD-9881', sku: 'WM-DESK-55IN', itemId: 'WMT-1003', returnQty: 1, returnAmount: 199.90, returnReason: '协商撤销', isKeepIt: false, responsibleParty: 'Customer', status: '取消' }
];

// ERP Orders for August 2026
// Total ~832 valid orders across SKUs, total sales ~$104,260, units ~875.
// We generate realistic representative aggregate line items for August:
export const SAMPLE_ERP_ORDERS_AUG_2026: ErpOrderRaw[] = [
  { orderId: 'ERP-AUG-001', orderDate: '2026-08-02', sku: 'WM-CHAIR-BLK', unitPrice: 99.90, shippedQty: 215, orderAmount: 21478.50, productCost: 32.50, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-002', orderDate: '2026-08-05', sku: 'WM-CHAIR-GRY', unitPrice: 99.90, shippedQty: 88, orderAmount: 8791.20, productCost: 32.50, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-003', orderDate: '2026-08-08', sku: 'WM-DESK-55IN', unitPrice: 199.90, shippedQty: 165, orderAmount: 32983.50, productCost: 68.00, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-004', orderDate: '2026-08-11', sku: 'WM-DESK-48IN', unitPrice: 169.90, shippedQty: 102, orderAmount: 17329.80, productCost: 56.00, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-005', orderDate: '2026-08-14', sku: 'WM-MON-ARM-S', unitPrice: 39.90, shippedQty: 110, orderAmount: 4389.00, productCost: 11.50, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-006', orderDate: '2026-08-17', sku: 'WM-MON-ARM-D', unitPrice: 69.90, shippedQty: 62, orderAmount: 4333.80, productCost: 22.00, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-007', orderDate: '2026-08-20', sku: 'WM-LAMP-LED', unitPrice: 39.90, shippedQty: 95, orderAmount: 3790.50, productCost: 10.20, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-008', orderDate: '2026-08-23', sku: 'WM-MAT-ANTI', unitPrice: 29.90, shippedQty: 70, orderAmount: 2093.00, productCost: 8.50, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-009', orderDate: '2026-08-26', sku: 'WM-RGB-BAR', unitPrice: 49.90, shippedQty: 42, orderAmount: 2095.80, productCost: 14.80, orderStatus: 'Shipped' },
  { orderId: 'ERP-AUG-010', orderDate: '2026-08-29', sku: 'WM-CBL-TRAY', unitPrice: 24.90, shippedQty: 54, orderAmount: 1344.60, productCost: 5.20, orderStatus: 'Shipped' },
  // Cancelled Orders: Must be completely excluded from sales, units and revenue per Section 6!
  { orderId: 'ERP-AUG-CANCEL-1', orderDate: '2026-08-12', sku: 'WM-DESK-55IN', unitPrice: 199.90, shippedQty: 5, orderAmount: 999.50, productCost: 68.00, orderStatus: 'Cancelled' },
  { orderId: 'ERP-AUG-CANCEL-2', orderDate: '2026-08-19', sku: 'WM-CHAIR-BLK', unitPrice: 99.90, shippedQty: 3, orderAmount: 299.70, productCost: 32.50, orderStatus: '取消' }
];

// July 2026 baseline for Month-over-Month (MoM) comparison
export const SAMPLE_JULY_DATA = {
  salesRevenue: 95400,
  orders: 760,
  unitsSold: 795,
  adSpend: 11200,
  storageFee: 2650,
  returnQty: 18,
  returnAmount: 1450,
  productCost: 31200,
  firstLegCost: 7222, // 52000 / 7.20
  operatingProfit: 41978, // 95400 - 31200 - 7222 - 11200 - 2650 - 1100 = 42028
  operatingMarginPct: 44.05
};

// Aliases for August 2026
export const sampleAugust2026Catalog = SAMPLE_CATALOG;
export const sampleAugust2026ManualInputs = SAMPLE_MANUAL_INPUTS_AUG_2026;
export const sampleAugust2026ItemPerformance = SAMPLE_ITEM_PERFORMANCE_AUG_2026;
export const sampleAugust2026InventoryHealth = SAMPLE_INVENTORY_HEALTH_AUG_2026;
export const sampleAugust2026Storage = SAMPLE_STORAGE_AUG_2026;
export const sampleAugust2026ReturnOrders = SAMPLE_RETURN_ORDERS_AUG_2026;
export const sampleAugust2026ErpOrders = SAMPLE_ERP_ORDERS_AUG_2026;

// Aliases for July 2026
export const sampleJuly2026Catalog = SAMPLE_CATALOG;
export const sampleJuly2026ManualInputs = SAMPLE_MANUAL_INPUTS_JUL_2026;
export const sampleJuly2026ItemPerformance = SAMPLE_ITEM_PERFORMANCE_AUG_2026.map(item => ({
  ...item,
  adSpend: Number((item.adSpend * 0.91).toFixed(2)),
  attributedSales: Number((item.attributedSales * 0.92).toFixed(2)),
  clicks: Math.round(item.clicks * 0.92),
  impressions: Math.round(item.impressions * 0.92)
}));
export const sampleJuly2026InventoryHealth = SAMPLE_INVENTORY_HEALTH_AUG_2026;
export const sampleJuly2026Storage = SAMPLE_STORAGE_AUG_2026;
export const sampleJuly2026ReturnOrders = SAMPLE_RETURN_ORDERS_AUG_2026.slice(0, 18);
export const sampleJuly2026ErpOrders = SAMPLE_ERP_ORDERS_AUG_2026.map(order => ({
  ...order,
  shippedQty: Math.round(order.shippedQty * 0.91),
  orderAmount: Number((order.orderAmount * 0.91).toFixed(2))
}));

