import * as XLSX from 'xlsx';
import {
  ItemPerformanceRaw,
  InventoryHealthRaw,
  StorageRaw,
  ReturnOrderRaw,
  ErpOrderRaw,
  ProductCatalogRaw
} from '../types';

// Helper to normalize header string
function cleanHeader(header: string): string {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-\(\)\[\]\/]+/g, '');
}

// Helper to parse float safely
export function parseNumber(val: any, defaultVal = 0): number {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[$,¥￥\s,%]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? defaultVal : n;
}

// Helper to parse boolean safely
export function parseBoolean(val: any): boolean {
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === '是';
}

// Convert Excel worksheet or CSV string into array of object records
export function parseSheetToRecords(content: string | ArrayBuffer): Record<string, any>[] {
  try {
    let workbook: XLSX.WorkBook;
    if (typeof content === 'string') {
      workbook = XLSX.read(content, { type: 'string' });
    } else {
      workbook = XLSX.read(content, { type: 'array' });
    }
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  } catch (err) {
    console.error('Error parsing sheet:', err);
    return [];
  }
}

// A1: Item Performance Semantic Matcher
export function parseItemPerformance(rows: Record<string, any>[]): ItemPerformanceRaw[] {
  return rows.map((row) => {
    const keys = Object.keys(row);
    const getVal = (patterns: string[]) => {
      for (const k of keys) {
        const norm = cleanHeader(k);
        if (patterns.some((p) => norm.includes(p))) {
          return row[k];
        }
      }
      return '';
    };

    const itemId = String(getVal(['itemid', 'walmartitemid', '商品id', '产品id', 'item_id']) || '').trim();
    const sku = String(getVal(['sku', 'productsku', 'itemsku', '商家sku']) || '').trim();
    const itemName = String(getVal(['itemname', 'productname', 'title', '商品名称', '品名']) || '').trim();
    const adSpend = parseNumber(getVal(['adspend', 'advertisingspend', 'adcost', 'cost', 'spend', '广告花费', '广告支出', '总花费']));
    const impressions = parseNumber(getVal(['impressions', 'impression', '曝光', '曝光量', '展示']));
    const clicks = parseNumber(getVal(['clicks', 'click', '点击', '点击量']));
    const orders = parseNumber(getVal(['orders', 'adorders', 'attributedorders', '订单', '广告订单', '转化订单']));
    const attributedSales = parseNumber(getVal(['attributedsales', 'adsales', 'sales', '广告销售额', '归因销售额', '销售额']));
    const unitsSold = parseNumber(getVal(['unitssold', 'units', '数量', '销量', '广告销量']) || orders);

    // Level check: SKU vs SPU vs TOTAL
    let level: 'SKU' | 'SPU' | 'TOTAL' = 'SKU';
    const normSku = sku.toLowerCase();
    const normName = itemName.toLowerCase();
    if (normSku.includes('total') || normSku.includes('总计') || normName.includes('total') || normName.includes('汇总')) {
      level = 'TOTAL';
    } else if (normSku.startsWith('spu-') || normSku.includes('spu')) {
      level = 'SPU';
    }

    return {
      itemId,
      sku,
      itemName,
      adSpend,
      impressions,
      clicks,
      orders,
      attributedSales,
      unitsSold,
      level,
      ctr: impressions > 0 ? clicks / impressions : undefined,
      cpc: clicks > 0 ? adSpend / clicks : undefined,
      cvr: clicks > 0 ? orders / clicks : undefined
    };
  });
}

// A2: Inventory Health Semantic Matcher
export function parseInventoryHealth(rows: Record<string, any>[]): InventoryHealthRaw[] {
  return rows.map((row) => {
    const keys = Object.keys(row);
    const getVal = (patterns: string[]) => {
      for (const k of keys) {
        const norm = cleanHeader(k);
        if (patterns.some((p) => norm.includes(p))) {
          return row[k];
        }
      }
      return '';
    };

    const sku = String(getVal(['sku', 'productsku', '商家sku']) || '').trim();
    const itemId = String(getVal(['itemid', 'walmartitemid', '商品id']) || '').trim();
    const totalInventory = parseNumber(getVal(['totalinventory', 'totalonhand', 'onhand', '总库存', '库存数量']));
    const availableInventory = parseNumber(getVal(['availableinventory', 'available', '可售库存', '在架库存']) || totalInventory);
    const reservedInventory = parseNumber(getVal(['reservedinventory', 'reserved', '预留库存', '锁定库存']));
    const inboundInventory = parseNumber(getVal(['inboundinventory', 'inbound', '在途库存', '在途']));

    // Age brackets
    const age0to90 = parseNumber(getVal(['0to90', '0-90', '090days', '0至90天', '0-90天']));
    const age91to180 = parseNumber(getVal(['91to180', '91-180', '91180days', '91至180天', '91-180天']));
    const age181to270 = parseNumber(getVal(['181to270', '181-270', '181270days', '181至270天', '181-270天']));
    const age271to365 = parseNumber(getVal(['271to365', '271-365', '271365days', '271至365天', '271-365天']));
    const age365to450 = parseNumber(getVal(['365to450', '365-450', '365450days', '365至450天', '365-450天']));
    const age450Plus = parseNumber(getVal(['450plus', '450+', '450days', '450天以上', '超过450天', '450+天']));

    return {
      sku,
      itemId,
      totalInventory,
      availableInventory,
      reservedInventory,
      inboundInventory,
      age0to90,
      age91to180,
      age181to270,
      age271to365,
      age365to450,
      age450Plus
    };
  });
}

// A3: Storage Semantic Matcher
export function parseStorage(rows: Record<string, any>[]): StorageRaw[] {
  return rows.map((row) => {
    const keys = Object.keys(row);
    const getVal = (patterns: string[]) => {
      for (const k of keys) {
        const norm = cleanHeader(k);
        if (patterns.some((p) => norm.includes(p))) {
          return row[k];
        }
      }
      return '';
    };

    const itemId = String(getVal(['itemid', 'walmartitemid', '商品id']) || '').trim();
    const sku = String(getVal(['sku', 'productsku', '商家sku']) || '').trim();
    const normalStorageFee = parseNumber(getVal(['normalstoragefee', 'monthlystorage', 'regularstorage', '正常仓储费', '月度仓储费']));
    const storageFee365to450 = parseNumber(getVal(['365to450', '365-450', '365450daysstorage', '365至450天仓储费', '365-450天仓储费']));
    const storageFee450Plus = parseNumber(getVal(['450plus', '450+', '450daysstorage', '450天以上仓储费', '超过450天仓储费']));
    let totalStorageFee = parseNumber(getVal(['totalstoragefee', 'totalstorage', '总仓储费', '仓储费用总计']));

    if (totalStorageFee === 0 && (normalStorageFee > 0 || storageFee365to450 > 0 || storageFee450Plus > 0)) {
      totalStorageFee = normalStorageFee + storageFee365to450 + storageFee450Plus;
    }

    return {
      itemId,
      sku,
      normalStorageFee,
      storageFee365to450,
      storageFee450Plus,
      totalStorageFee
    };
  });
}

// A4: Return Orders Semantic Matcher
export function parseReturnOrders(rows: Record<string, any>[]): ReturnOrderRaw[] {
  return rows.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (patterns: string[]) => {
      for (const k of keys) {
        const norm = cleanHeader(k);
        if (patterns.some((p) => norm.includes(p))) {
          return row[k];
        }
      }
      return '';
    };

    const returnOrderId = String(getVal(['returnorderid', 'returnid', 'rma', '退货单号', '退货id']) || `RET-${idx + 1}`).trim();
    const orderId = String(getVal(['orderid', 'originalorder', '订单号']) || '').trim();
    const sku = String(getVal(['sku', 'productsku', '商家sku']) || '').trim();
    const itemId = String(getVal(['itemid', 'walmartitemid', '商品id']) || '').trim();
    const returnQty = parseNumber(getVal(['returnqty', 'quantity', 'qty', '退货数量', '数量']) || 1);
    const returnAmount = parseNumber(getVal(['returnamount', 'refundamount', 'amount', '退款金额', '退货金额']));
    const returnReason = String(getVal(['returnreason', 'reason', '退货原因', '原因']) || '其他').trim();
    const isKeepItRaw = getVal(['keepit', 'iskeepit', '无需退回', '留存产品']);
    const isKeepIt = parseBoolean(isKeepItRaw) || String(isKeepItRaw).toLowerCase().includes('keep');

    const partyRaw = String(getVal(['responsibleparty', 'responsibility', '责任方', '责任归属']) || '').toLowerCase();
    let responsibleParty: 'Seller' | 'Customer' | 'Walmart' | 'Carrier' | 'Other' = 'Other';
    if (partyRaw.includes('seller') || partyRaw.includes('卖家') || returnReason.includes('质量') || returnReason.includes('损坏') || returnReason.includes('少发')) {
      responsibleParty = 'Seller';
    } else if (partyRaw.includes('customer') || partyRaw.includes('买家') || partyRaw.includes('客户') || returnReason.includes('不需要') || returnReason.includes('心意')) {
      responsibleParty = 'Customer';
    } else if (partyRaw.includes('walmart') || partyRaw.includes('平台')) {
      responsibleParty = 'Walmart';
    } else if (partyRaw.includes('carrier') || partyRaw.includes('物流')) {
      responsibleParty = 'Carrier';
    }

    const status = String(getVal(['status', 'returnstatus', '状态', '退货状态']) || 'Completed').trim();
    const returnDate = String(getVal(['returndate', 'date', '退货时间', '退货日期']) || '').trim();

    return {
      returnOrderId,
      orderId,
      sku,
      itemId,
      returnQty,
      returnAmount,
      returnReason,
      isKeepIt,
      responsibleParty,
      status,
      returnDate
    };
  });
}

// B1: ERP Orders Semantic Matcher
export function parseErpOrders(rows: Record<string, any>[]): ErpOrderRaw[] {
  return rows.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (patterns: string[]) => {
      for (const k of keys) {
        const norm = cleanHeader(k);
        if (patterns.some((p) => norm.includes(p))) {
          return row[k];
        }
      }
      return '';
    };

    const orderId = String(getVal(['orderid', 'orderno', '订单号', 'erp订单号']) || `ERP-${idx + 1}`).trim();
    const orderDate = String(getVal(['orderdate', 'date', 'createdat', '下单时间', '订单时间', '日期']) || '').trim();
    const sku = String(getVal(['sku', 'productsku', '商家sku']) || '').trim();
    const unitPrice = parseNumber(getVal(['unitprice', 'price', '单价', '产品单价']));
    const shippedQty = parseNumber(getVal(['shippedqty', 'quantity', 'qty', '发货数量', '数量']) || 1);
    let orderAmount = parseNumber(getVal(['orderamount', 'totalamount', 'amount', '订单金额', '金额']));
    const productCost = parseNumber(getVal(['productcost', 'cost', 'unitcost', '产品成本', '采购单价']));
    const orderStatus = String(getVal(['orderstatus', 'status', '状态', '订单状态']) || 'Shipped').trim();

    // Verification check: unitPrice * shippedQty vs orderAmount
    if (orderAmount === 0 && unitPrice > 0) {
      orderAmount = unitPrice * shippedQty;
    }

    return {
      orderId,
      orderDate,
      sku,
      unitPrice,
      shippedQty,
      orderAmount,
      productCost: productCost > 0 ? productCost : undefined,
      orderStatus
    };
  });
}

// B2: Product Catalog Semantic Matcher
export function parseProductCatalog(rows: Record<string, any>[]): ProductCatalogRaw[] {
  return rows.map((row) => {
    const keys = Object.keys(row);
    const getVal = (patterns: string[]) => {
      for (const k of keys) {
        const norm = cleanHeader(k);
        if (patterns.some((p) => norm.includes(p))) {
          return row[k];
        }
      }
      return '';
    };

    const itemId = String(getVal(['itemid', 'walmartitemid', '商品id']) || '').trim();
    const sku = String(getVal(['sku', 'productsku', '商家sku']) || '').trim();
    const spu = String(getVal(['spu', 'parentsku', '父体sku', 'spucode']) || sku).trim();
    const productType = String(getVal(['producttype', 'category', '分类', '产品类型', '品类']) || '通用产品').trim();
    const productTitle = String(getVal(['producttitle', 'title', 'itemname', '商品名称', '标题']) || '').trim();

    return {
      itemId,
      sku,
      spu,
      productType,
      productTitle
    };
  });
}
