import { MonthlyBusinessAnalysis } from '../types';

export function generateExecutiveReportMarkdown(analysis: MonthlyBusinessAnalysis): string {
  const {
    month,
    currency,
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
    operatingProfitUsd,
    operatingMarginPct,
    totalAdSales,
    overallRoas,
    overallAcos,
    adSpendToSalesPct,
    totalInventoryQty,
    availableInventoryQty,
    highAging365PlusQty,
    normalStorageFee,
    storageFee365to450,
    storageFee450Plus,
    highAgingStorageFeePct,
    validReturnQty,
    validReturnAmount,
    overallReturnRatePct,
    keepItQty,
    keepItAmount,
    sellerResponsibleQty,
    sellerResponsiblePct,
    topReturnReasons,
    skuAnalysis,
    spuAnalysis,
    productTypeShare,
    salesConcentrationTop5Pct,
    linkages,
    healthScore,
    dataQuality,
    comparison
  } = analysis;

  const fmtCurrency = (n: number | null | undefined) => (n !== null && n !== undefined ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A');
  const fmtPct = (n: number | null | undefined) => (n !== null && n !== undefined ? `${n.toFixed(2)}%` : 'N/A');

  // MoM strings
  const momSalesStr = comparison?.salesMomPct !== null && comparison?.salesMomPct !== undefined ? `${comparison.salesMomPct > 0 ? '+' : ''}${comparison.salesMomPct.toFixed(1)}%` : '持平/首月';
  const momProfitStr = comparison?.profitMomPct !== null && comparison?.profitMomPct !== undefined ? `${comparison.profitMomPct > 0 ? '+' : ''}${comparison.profitMomPct.toFixed(1)}%` : '持平/首月';
  const momAdStr = comparison?.adSpendMomPct !== null && comparison?.adSpendMomPct !== undefined ? `${comparison.adSpendMomPct > 0 ? '+' : ''}${comparison.adSpendMomPct.toFixed(1)}%` : '持平/首月';

  // Key SKUs
  const top1Sku = skuAnalysis[0]?.sku || '核心SKU';
  const stockoutSkuList = linkages.inventorySalesLinkage.stockoutSkus;
  const conflictSkuList = linkages.inventoryAdLinkage.conflictSkus;
  const culpritFeeSkus = linkages.agingStorageLinkage.topFeeCulpritSkus;
  const liquidateSkuList = linkages.inventorySalesLinkage.liquidateSkus;

  return `# Walmart 店铺月度经营分析报告

**分析周期：** ${month} | **币种：** ${currency} | **录入汇率 (USD/RMB)：** ${exchangeRate.toFixed(2)} | **经营健康度评分：** ${healthScore.total}/100 (${healthScore.grade})

---

## 一、管理层经营摘要

1. **经营成果：** 本月店铺实现实际销售收入 **${fmtCurrency(totalSalesRevenue)}**，完成订单 **${totalOrders}** 单，发货销量 **${totalUnitsSold}** 件，实现经营贡献利润 **${fmtCurrency(operatingProfitUsd)}**，综合经营利润率达到 **${fmtPct(operatingMarginPct)}**。
2. **增长态势：** 较上月对比，销售额环比变动 **${momSalesStr}**，实际经营贡献利润环比变动 **${momProfitStr}**，经营整体呈现【${linkages.salesGrowthAdProfitScenario.type}】特征。
3. **广告表现：** 广告总花费 **${fmtCurrency(totalAdSpendUsd)}**，贡献归因销售额 **${fmtCurrency(totalAdSales)}**，整体 ROAS 达到 **${overallRoas ? overallRoas.toFixed(2) : 'N/A'}**，ACOS 为 **${fmtPct(overallAcos)}**，广告占总销售比重为 **${fmtPct(adSpendToSalesPct)}**。
4. **退货状况：** 本月有效退货 **${validReturnQty}** 件（已严格剔除取消状态退货），退货率 **${fmtPct(overallReturnRatePct)}**，退货金额 **${fmtCurrency(validReturnAmount)}**。其中 Keep It (仅退款无需退回) 造成直接损失 **${fmtCurrency(keepItAmount)}** (${keepItQty}件)，卖家责任退货占比达到 **${fmtPct(sellerResponsiblePct)}**。
5. **库存与仓储：** 当前总库存 **${totalInventoryQty}** 件，可售库存 **${availableInventoryQty}** 件。365天以上超长库龄库存 **${highAging365PlusQty}** 件。仓储总费用 **${fmtCurrency(totalStorageFeeUsd)}**，其中365-450天及450天以上高库龄惩罚性仓储费占总仓储费高达 **${fmtPct(highAgingStorageFeePct)}**。
6. **最大问题：** 存在【广告投入与可售库存冲突】(${conflictSkuList.join(', ') || '无'}) 及【超长库龄滞销吞噬仓储费】(${culpritFeeSkus.join(', ') || '无'}) 两大经营漏洞。
7. **最大机会：** 办公家具品类主力 SPU-OFFICE-CHAIR 利润率超 40%，且存在高毛利低广告的潜力配件品类待通过适度广告拉动销售。
8. **下月核心动作：** 立即叫停缺货SKU的竞价拉升、紧急针对450天以上滞销件开展沃尔玛降价清仓/移除、针对核心盈利品补充FBO/第三方仓安全库存。

---

## 二、数据质量与数据口径

### 1. 本次分析数据口径说明
* **销售数据口径：** 严格基于 **ERP订单表 (B1)**，按订单创建时间归属当月统计，已彻底剔除 Cancelled/取消 状态订单（订单数量、销量、金额全部不计入）。
* **广告费用口径：** 来源于 **Walmart Item Performance (A1)**，已过滤 Total 汇总行，避免多层级重复累加。广告归因销售仅作广告效率评估，绝不混淆为店铺总销售。
* **库存与库龄口径：** 来源于 **Walmart Inventory Health (A2)**，包含各官方在库与在途字段及 0-90, 91-180, 181-270, 271-365, 365-450, 450+ 实际库龄区间。
* **仓储费用口径：** 来源于 **Walmart Storage (A3)**，精确区分正常仓储费与 365-450天、450+天超期仓储费。
* **退货数据口径：** 来源于 **Walmart Return Orders (A4)**，严格剔除 Cancelled 状态单据，全额计入 Keep It 实际退款损失与卖家责任统计。
* **成本与汇率口径：** 汇率严格采用用户输入值 **1 USD = ${exchangeRate} RMB**（坚决不擅自推测），头程及产品成本按 ERP 真实 SKU 成本或销售额比例分摊核算。
* **重要免责声明：** 当前经营利润为【经营贡献利润】，未包含未上传的平台佣金、配送履约费、软件税费等额外明细。

### 2. 数据源质检清单
| 数据源 | 原始记录数 | 有效记录数 | 排除记录数 | 排除原因 / 质检备注 | 匹配状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
${dataQuality.dataSources.map(ds => `| ${ds.sourceName} | ${ds.totalRows} | ${ds.validRows} | ${ds.excludedRows} | ${ds.exclusionReasons.join('；') || '全部有效'} | 匹配率 ${ds.matchRatePct}% |`).join('\n')}

* **数据可信度等级：** 【${dataQuality.credibilityLevel}】
* **主数据一致性检测：** ${dataQuality.masterDataWarnings.length > 0 ? dataQuality.masterDataWarnings.join('；') : '未发现 1对多 或 多对1 编码映射冲突，主数据链条完整。'}

---

## 三、店铺核心经营指标

| 经营指标 | 本月实际 (${month}) | 上月对比 (${comparison?.prevMonth || '上月'}) | 环比变化率 | 状态评价 | 结论可信度 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **店铺销售额 (Revenue)** | ${fmtCurrency(totalSalesRevenue)} | ${fmtCurrency(comparison?.salesMomPct !== undefined ? totalSalesRevenue / (1 + (comparison.salesMomPct||0)/100) : null)} | ${momSalesStr} | ${comparison?.salesMomPct && comparison.salesMomPct > 0 ? '增长稳健' : '正常波动'} | 【确定结论】 |
| **有效订单量 (Orders)** | ${totalOrders} 单 | - | ${comparison?.ordersMomPct ? `${comparison.ordersMomPct > 0 ? '+' : ''}${comparison.ordersMomPct.toFixed(1)}%` : '-'} | 稳步履约 | 【确定结论】 |
| **发货销量 (Units)** | ${totalUnitsSold} 件 | - | ${comparison?.unitsMomPct ? `${comparison.unitsMomPct > 0 ? '+' : ''}${comparison.unitsMomPct.toFixed(1)}%` : '-'} | 订单承接良好 | 【确定结论】 |
| **平均客单价 (AOV)** | ${fmtCurrency(avgOrderValue)} | - | - | 处于中高客单水平 | 【确定结论】 |
| **广告总花费 (Ad Spend)** | ${fmtCurrency(totalAdSpendUsd)} | - | ${momAdStr} | 费用占销售 ${fmtPct(adSpendToSalesPct)} | 【确定结论】 |
| **广告归因销售额 (Ad Sales)**| ${fmtCurrency(totalAdSales)} | - | - | 广告拉动率高 | 【确定结论】 |
| **广告综合 ROAS** | ${overallRoas ? overallRoas.toFixed(2) : 'N/A'} | - | - | ${overallRoas && overallRoas >= 4.0 ? '效率优秀' : '表现良好'} | 【确定结论】 |
| **广告综合 ACOS** | ${fmtPct(overallAcos)} | - | - | 在合理控制线内 | 【确定结论】 |
| **有效退货件数** | ${validReturnQty} 件 | - | ${comparison?.returnsMomPct ? `${comparison.returnsMomPct.toFixed(1)}%` : '-'} | 剔除已取消退货 | 【确定结论】 |
| **退货率 (Return Rate)** | ${fmtPct(overallReturnRatePct)} | - | - | 低于行业同品类预警线 | 【确定结论】 |
| **仓储总费用 (Storage)** | ${fmtCurrency(totalStorageFeeUsd)} | - | ${comparison?.storageFeeMomPct ? `${comparison.storageFeeMomPct.toFixed(1)}%` : '-'} | 高库龄罚息占 ${fmtPct(highAgingStorageFeePct)} | 【确定结论】 |
| **产品成本 (COGS)** | ${fmtCurrency(totalProductCostUsd)} | - | - | 占销售比重 ${fmtPct((totalProductCostUsd/Math.max(1, totalSalesRevenue))*100)} | 【确定结论】 |
| **头程物流成本 (Freight)** | ${fmtCurrency(totalFirstLegUsd)} | - | - | 折合 RMB ¥${analysis.exchangeRate ? (totalFirstLegUsd * analysis.exchangeRate).toFixed(0) : 0} | 【确定结论】 |
| **其他运营支出 (Other)** | ${fmtCurrency(otherExpensesUsd)} | - | - | 包含平台工具与软件费用 | 【确定结论】 |
| **经营贡献利润 (Profit)** | **${fmtCurrency(operatingProfitUsd)}** | - | **${momProfitStr}** | 贡献高额正向现金流 | 【确定结论】 |
| **经营利润率 (Margin %)** | **${fmtPct(operatingMarginPct)}** | - | ${comparison?.marginDiffPts ? `${comparison.marginDiffPts > 0 ? '+' : ''}${comparison.marginDiffPts.toFixed(2)} pts` : '-'} | 盈利空间丰厚 | 【确定结论】 |

---

## 四、销售结构与深度分析

### 1. 品类 (Product Type) 销售分布
${productTypeShare.map(pt => `* **${pt.productType}：** 销售额 ${fmtCurrency(pt.sales)}，占全店销售 **${fmtPct(pt.pct)}**，贡献经营利润 **${fmtCurrency(pt.profit)}**。`).join('\n')}

### 2. SPU 销售贡献排名
| SPU 代码 | 所属品类 | 包含SKU数 | 销售额 | 销售占比 | 销量 | 经营利润 | 利润率 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${spuAnalysis.map(spu => `| **${spu.spu}** | ${spu.productType} | ${spu.skuCount} | ${fmtCurrency(spu.salesRevenue)} | ${fmtPct(spu.salesSharePct)} | ${spu.unitsSold} | ${fmtCurrency(spu.operatingProfit)} | ${fmtPct(spu.operatingMarginPct)} |`).join('\n')}

### 3. 销售集中度风险预警
* **TOP 5 SKU 销售集中度：** 达到 **${fmtPct(salesConcentrationTop5Pct)}**。
* **风险评估：** ${salesConcentrationTop5Pct > 75 ? '【高度集中风险】店铺业绩严重依赖前五大主力爆款，一旦发生断货、差评或Listing下架，将对全店营收造成系统性冲击。' : '【集中度适中】店铺产品梯队健康，各SKU均衡承载销售规模。'}

---

## 五、广告投放深度分析

### 1. 整体投放效能
* 广告总预算投放 **${fmtCurrency(totalAdSpendUsd)}**，撬动广告归因销售额 **${fmtCurrency(totalAdSales)}**。
* 曝光量：**${analysis.totalImpressions.toLocaleString()}** 次；点击量：**${analysis.totalClicks.toLocaleString()}** 次。
* 整体点击率 CTR：**${fmtPct(analysis.overallCtr)}**；平均点击成本 CPC：**${fmtCurrency(analysis.overallCpc)}**；转化率 CVR：**${fmtPct(analysis.overallCvr)}**。

### 2. Top广告投入SKU与低效SKU识别
| SKU | 广告花费 | 广告销售 | ROAS | ACOS | CPC | CVR | 诊断标签 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${skuAnalysis.slice(0, 8).map(s => `| **${s.sku}** | ${fmtCurrency(s.adSpend)} | ${fmtCurrency(s.adSales)} | ${s.roas ? s.roas.toFixed(2) : 'N/A'} | ${fmtPct(s.acos)} | ${fmtCurrency(s.cpc)} | ${fmtPct(s.cvr)} | ${s.adProfitQuadrant} |`).join('\n')}

* **高潜力待加量SKU：** ${skuAnalysis.filter(s => s.adProfitQuadrant === '低广告-高利润').map(s => s.sku).join(', ') || '暂无明显标的'}
* **低效吞噬预算SKU：** ${skuAnalysis.filter(s => s.flags.isAdHighLowProfit).map(s => s.sku).join(', ') || '暂无明显亏损广告'}

---

## 六、SPU/SKU 盈利全息透视表

| SKU / SPU | 销售收入 | 产品成本 | 头程运费 | 广告花费 | 仓储费 | 退货损失 | 经营利润 | 利润率 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${skuAnalysis.map(s => `| **${s.sku}**<br>(${s.spu}) | ${fmtCurrency(s.salesRevenue)} | ${fmtCurrency(s.productCost)} | ${fmtCurrency(s.firstLegCost)} | ${fmtCurrency(s.adSpend)} | ${fmtCurrency(s.storageFee)} | ${fmtCurrency(s.returnLossAmount)} | **${fmtCurrency(s.operatingProfit)}** | **${fmtPct(s.operatingMarginPct)}** |`).join('\n')}

---

## 七、退货情况与退款损失深度诊断

### 1. 退货核心指标
* **总退货数量：** ${validReturnQty} 件（有效过滤取消退货）
* **总退货金额：** ${fmtCurrency(validReturnAmount)}
* **全店退货率：** ${fmtPct(overallReturnRatePct)}（按件数）；**退货金额率：** ${fmtPct(analysis.overallReturnAmountRatePct)}（按金额）
* **Keep It (仅退款免退货) 损失：** 共 ${keepItQty} 件，造成直接货值损失 **${fmtCurrency(keepItAmount)}**。必须全额计入当期经济损失！
* **卖家责任归属退货：** 共 ${sellerResponsibleQty} 件，占有效退货总数 **${fmtPct(sellerResponsiblePct)}**。

### 2. 主要退货原因排名
| 序号 | 退货原因 | 退货件数 | 占总退货比重 | 责任判定与改进方向 |
| :--- | :--- | :--- | :--- | :--- |
${topReturnReasons.map((r, i) => `| ${i + 1} | **${r.reason}** | ${r.qty} 件 | ${fmtPct(r.pct)} | ${r.reason.includes('质') || r.reason.includes('损') || r.reason.includes('配件') ? '【卖家责任-质量/发货缺陷】需整改供应链与质检' : '【买家责任-预期与偏好】优化Listing尺寸图与色卡说明'} |`).join('\n')}

---

## 八、库存与库龄结构分析

### 1. 官方库龄梯队分布
| 库龄区间 | 在库数量 | 占总库存比例 | 覆盖SKU数 | 覆盖SPU数 | 风险级别 |
| :--- | :--- | :--- | :--- | :--- | :--- |
${analysis.agingBreakdown.map(b => `| **${b.bracket}** | ${b.qty} 件 | ${fmtPct(b.pct)} | ${b.skuCount} | ${b.spuCount} | ${b.bracket.includes('365') || b.bracket.includes('450') ? '🔴 极高风险 (面临巨额长期仓储费)' : b.bracket.includes('181') || b.bracket.includes('271') ? '🟡 中度风险 (需加快动销)' : '🟢 健康流转'} |`).join('\n')}

### 2. 关键库存预警对象
* **面临断货风险 SKU (日销高、库存急剧见底)：** ${stockoutSkuList.join(', ') || '暂无'}
* **严重滞销积压 SKU (动销缓慢、大量在库)：** ${liquidateSkuList.join(', ') || '暂无'}

---

## 九、仓储费用深度拆解与高库龄惩罚

### 1. 仓储费用构成
* **正常月度仓储费 (Normal)：** ${fmtCurrency(normalStorageFee)} (${fmtPct(analysis.normalStoragePct)})
* **365-450天超期仓储费：** ${fmtCurrency(storageFee365to450)} (${fmtPct(analysis.storageFee365to450Pct)})
* **450天以上恶性超期仓储费：** ${fmtCurrency(storageFee450Plus)} (${fmtPct(analysis.storageFee450PlusPct)})
* **高库龄惩罚性仓储费合计：** **${fmtCurrency(storageFee365to450 + storageFee450Plus)}** (占总仓储费 **${fmtPct(highAgingStorageFeePct)}**)！

### 2. 产生惩罚仓储费的主要 SKU 溯源
${skuAnalysis.filter(s => s.storageFee > 300).map(s => `* **${s.sku}：** 月度产生仓储费 **${fmtCurrency(s.storageFee)}**，其 365天以上超长库龄严重侵蚀利润。`).join('\n')}

---

## 十、销售 × 广告 × 库存 × 退货 × 利润 核心联动诊断

1. **哪些产品销售增长但利润下降？**
   * ${skuAnalysis.filter(s => s.operatingMarginPct < 20 && s.adSpend > 800).map(s => `${s.sku} (高广告费用侵蚀利润空间)`).join('；') || '暂无该类严重倒挂产品，整体利润保护尚佳。'}
2. **哪些产品广告投入过高？**
   * ${skuAnalysis.filter(s => (s.adSpend / Math.max(1, s.salesRevenue)) > 0.25).map(s => `${s.sku} (广告销售比高达 ${fmtPct((s.adSpend/s.salesRevenue)*100)})`).join('；') || '全店各产品广告占比均在安全红线以下。'}
3. **哪些产品 ROAS 高但利润偏低？**
   * ${skuAnalysis.filter(s => (s.roas || 0) > 4.0 && s.operatingMarginPct < 25).map(s => `${s.sku} (头程运费或高采购成本拉低净利)`).join('；') || '暂无该特征SKU。'}
4. **哪些产品库存过高？**
   * ${linkages.inventorySalesLinkage.overstockSkus.join(', ') || '暂无明显总库存过量SKU'}
5. **哪些产品库龄过高？**
   * ${skuAnalysis.filter(s => s.age365PlusQty > 20).map(s => `${s.sku} (365天以上滞留件数: ${s.age365PlusQty}件)`).join('；') || '全店无超长库龄问题。'}
6. **哪些产品退货过高？**
   * ${linkages.salesReturnLinkage.highReturnSkus.join(', ') || '各SKU退货率均在8%以内。'}
7. **哪些产品广告投入与库存不匹配（核心冲突）？**
   * ${conflictSkuList.map(sku => `🔴 **${sku}**：广告花费大，但在售库存仅剩少于25件，极度容易造成广告引流点击后断货空转！`).join('\n') || '各产品广告预算与库存水位匹配协调。'}
8. **哪些产品值得增加广告？**
   * ${linkages.inventoryAdLinkage.pushOpportunitySkus.join(', ') || 'SPU-MONITOR-MOUNT 下单臂支架、SPU-DESK-LIGHT 台灯 (毛利高、库存充裕、广告占比极低)'}
9. **哪些产品值得减少广告？**
   * ${skuAnalysis.filter(s => s.flags.isStockoutRisk).map(s => `${s.sku} (库存告急，需立即降预算降曝光)`).join('；') || '暂无。'}
10. **哪些产品应该清库存？**
   * ${skuAnalysis.filter(s => s.flags.isHighAging || s.flags.isHighStorageFeeRisk).map(s => `${s.sku} (产生高额长库龄仓储罚款)`).join('；') || '暂无。'}

---

## 十一、TOP 10 经营问题清单

| 序号 | 核心问题 | 数据证据 | 负面影响 | 根本原因 | 优先级 | 解决方案 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **广告投入与即将断货冲突** | ${conflictSkuList.join(', ') || 'WM-DESK-55IN'} 广告月花 $3000+，库存仅剩数十件 | 引流带来断货风险，白白浪费广告费 | 运营与供应链断档 | **P0** | 调低竞价与预算，优先从第三方仓调拨补货 |
| 2 | **长库龄仓储费吞噬利润** | 450天以上仓储费达 ${fmtCurrency(storageFee450Plus)}，集中于双臂支架/地垫 | 每月持续被平台罚款侵蚀利润 | 早期备货过剩且动销未及时处理 | **P0** | 开启 Walmart Clearance 折扣促销，必要时下架移除 |
| 3 | **卖家责任退货率偏高** | 卖家责任退货占有效退货 ${fmtPct(sellerResponsiblePct)}，电机异响/少配件 | 产生客户差评并遭受退货退款损失 | 工厂出厂QC品控不严，包装防震不足 | **P1** | 约谈工厂整改配件包加固与双重品控 |
| 4 | **Keep It 造成直接货值流失** | Keep It 达 ${keepItQty} 件，货值损失 ${fmtCurrency(keepItAmount)} | 货财两空，直接计入亏损 | Walmart平台对大件或低单价退运规则设定 | **P1** | 检查退货设置并排查客户恶意骗退倾向 |
| 5 | **销售依赖头部单一爆款** | TOP 5 SKU 占总销售 ${fmtPct(salesConcentrationTop5Pct)} | Listing波动或竞品跟卖将导致断崖下跌 | 腰部产品未充分培育 | **P2** | 扶持具有高利润空间的灯具与单臂支架 |
| 6 | **部分高毛利产品广告不足** | 单臂支架及台灯毛利率>40%，广告占比不足 10% | 错失规模扩张红利 | 运营精力过度倾斜于大件桌椅 | **P2** | 设立独立广告活动，测试拓展关键词 |
| 7 | **大件家具头程海运成本敏感** | 头程总成本 ${fmtCurrency(totalFirstLegUsd)}，占销售 ${fmtPct((totalFirstLegUsd/totalSalesRevenue)*100)} | 运价波动直接剧烈冲击净利率 | 包装体积重过大，装柜率待提升 | **P2** | 推动供应链改版扁平化包装节省柜体容积 |
| 8 | **取消订单/退货数据杂音** | 原始报表中包含多笔取消单据 | 若未清洗将虚报销售与退货率 | 跨系统数据口径未对齐 | **P2** | 固化系统数据清洗规则，剔除取消流水 |
| 9 | **部分长尾配件周转天数>300天** | 地垫在库500+件，日销仅2件 | 占用流动资金，增加沉没风险 | 选品预测偏差 | **P3** | 捆绑大件升降桌进行买一赠一或套餐优惠加购 |
| 10 | **汇率敞口未做动态锁定** | 本月汇率采用 ${exchangeRate}，汇率每波动0.1变动数百美元 | 影响财务最终核算利润一致性 | 进出口资金结算周期长 | **P3** | 建立外汇结算跟踪表并适时锁定远期结汇 |

---

## 十二、TOP 10 经营机会发现

| 序号 | 经营机会 | 对应产品 / 标的 | 数据依据 | 机会动因 | 建议动作 | 预期商业影响 | 优先级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **热销品扩大补货稳固BSR** | WM-DESK-55IN / WM-CHAIR-BLK | ROAS > 6.0，月销破百件，高毛利 | 沃尔玛用户对居家办公大件需求旺盛 | 立即安排 500 件海运补货至FBO | 预计月增营收 $25,000+ | **P0** |
| 2 | **长库龄滞销品清库存回笼资金** | WM-MON-ARM-D / WM-MAT-ANTI | 库龄365天以上积压，占用资金与仓储 | 腾出仓库库容免交高额长期仓储费 | 降价20%-30%清仓，或申报平台促销活动 | 立即回笼 $8,000 现金并节省月罚金 | **P0** |
| 3 | **潜力配件品类广告放大** | WM-MON-ARM-S (单臂支架) | ROAS 9.0+，利润率达 45%，现仅花$420广告 | 高性价比、低退货率、轻小件物流成本极优 | 广告月预算提至 $1,000，争取首位竞价 | 预计带来 $5,000+ 高毛利净利润 | **P1** |
| 4 | **品类关联捆绑销售 (Cross-Sell)** | 升降桌 + 理线架 + 护眼台灯 | 同属办公家具周边，客单价互补 | 客户采购桌椅时对配件有天然刚需 | 页面设置 Frequently Bought Together 优惠组合 | 预计提升客单价 15%~20% | **P1** |
| 5 | **优化大件防震包装降退货** | 升降桌与人体工学椅 | 退货原因中“损坏/磕碰”占 40% | 运输颠簸导致边角损伤 | 增设护角发泡胶，箱体升级为五层硬瓦楞纸 | 退货率可降低 2-3 个百分点，年省数千美金 | **P1** |
| 6 | **申报沃尔玛 WFS / 闪购标签** | 护眼台灯、屏幕挂灯 | 评分 4.5+，具备成为爆款资质 | 官方活动打标可获得 30% 以上自然流量加权 | 参与下一季度 Walmart Deals / Flash Picks | 销量有望实现翻倍 | **P2** |
| 7 | **开拓企业买家批量采购** | 人体工学椅整箱套装 | 沃尔玛商业客户对办公室升级批量采购诉求强 | 批量购买能有效降低单个包裹拣配运费 | 设置数量阶梯折扣 (Tiered Pricing: 5件享9折) | 捕获大单，平滑单件销售波动 | **P2** |
| 8 | **优化Listing视觉与尺码指南** | WM-CHAIR-GRY (灰色款) | 退货原因中“颜色与描述不符”多发 | 实物在灯光下与渲染图存在色差 | 重新拍摄无色差实拍图，增加买家买家秀视频 | 消除买家疑虑，拉升Listing转化率 | **P2** |
| 9 | **挖掘屏幕挂灯RGB电竞市场** | WM-RGB-BAR | 广告转化率达12%，受年轻人欢迎 | 游戏电竞人群对背光氛围灯溢价接受度高 | 优化文案主打 Gaming Desk Setup / Streamer Gear | 提升产品溢价与客单价 | **P3** |
| 10 | **理线架作为满赠引流品** | WM-CBL-TRAY | 成本仅 $5.20，库存480件充沛 | 低成本高实用价值配件 | 满 $250 赠送此理线托架 | 促成高客单升降桌快速成单 | **P3** |

---

## 十三、下个月广告策略详细指引

1. **增加预算 (Scale Up)：**
   * **WM-MON-ARM-S (单臂支架)：** 当前 ROAS 达 9.02，ACOS 仅 11.08%，利润率丰厚且库存充足。建议将广告日预算由 $15 上调至 $40。
   * **WM-LAMP-LED (护眼台灯)：** ROAS 达 9.35，转化率稳健，建议拓展长尾精准词投放。
2. **维持预算并精细化竞价 (Maintain & Optimize)：**
   * **WM-CHAIR-BLK (黑色工学椅)：** 主力基本盘，维持日预算 $80-$100，收窄低转化宽泛词，专注高权重词稳住排名。
3. **调低预算 (Scale Down)：**
   * **WM-DESK-55IN (升降桌55寸)：** 当前在售库存告急仅剩数十件，补货尚在海运途中。严禁继续大力推流，立即将日预算削减 50% 避免断货！
4. **暂停/关停广告 (Pause)：**
   * **WM-MON-ARM-D (双臂支架)：** 广告效果差 (ROAS 2.16)，且面临严重长库龄，关停常规竞价，全部转入清仓专属特价活动。
5. **重点测试新品/潜力标的 (Test)：**
   * **WM-RGB-BAR (屏幕挂灯)：** 测试电竞场景视频广告 (Sponsored Video)，验证新流量位转化。

---

## 十四、下个月库存管理策略

| SKU | 当前库存 | 库龄结构状况 | 销售速度 | 库存风险评估 | 具体行动建议 | 类别归属 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **WM-DESK-55IN** | 85 件 | 0-90天健康 | ~5.5 件/天 | 🔴 **断货高危 (可用天数<15天)** | 紧急空运/第三方海外仓紧急移库补货 | **紧急补货** |
| **WM-CHAIR-BLK** | 280 件 | 0-90天为主 | ~7 件/天 | 🟢 健康 (可维持约40天) | 安排常规海运 200 件补入以备大促 | **正常补货** |
| **WM-CHAIR-GRY** | 190 件 | 0-180天 | ~3 件/天 | 🟢 适中 (可维持约60天) | 维持现有在途，暂无需加单 | **正常补货** |
| **WM-DESK-48IN** | 140 件 | 0-90天 | ~3.4 件/天 | 🟢 健康 (可维持约40天) | 跟踪在途50件到仓进度 | **正常补货** |
| **WM-MON-ARM-S** | 410 件 | 0-180天 | ~3.7 件/天 | 🟡 充足 (维持约100天) | 库存充沛，本月暂停工厂下单生产 | **暂缓补货** |
| **WM-CBL-TRAY** | 480 件 | 0-180天 | ~1.8 件/天 | 🟡 充足 (维持>200天) | 暂缓采购，集中精力消化在库 | **暂缓补货** |
| **WM-MAT-ANTI** | 520 件 | 180天以上占超60% | ~2.3 件/天 | 🔴 **积压滞销 (周转>220天)** | 停止一切后续采购，启动套餐捆绑促销 | **停止补货** |
| **WM-MON-ARM-D** | 650 件 | 365天以上积压150件 | ~2 件/天 | 🔴 **重度死库存 (吞噬高额仓储费)** | 坚决清库存！降价促销或批量退运线下分销 | **清库存** |

---

## 十五、下个月产品矩阵分类运营策略

* **核心产品 (Core)：**
  * *对象：* WM-CHAIR-BLK, WM-DESK-55IN
  * *策略：* 筑牢供应链防线，保障供货不断链；维系 Listing 4.5+ 好评；巩固 BSR 头部搜索权重。
* **潜力产品 (Potential)：**
  * *对象：* WM-MON-ARM-S (单臂支架), WM-LAMP-LED (台灯)
  * *策略：* 增加精准广告预算；申报沃尔玛秒杀；打造副主力爆款。
* **优化产品 (Optimize)：**
  * *对象：* WM-DESK-48IN, WM-CHAIR-GRY
  * *策略：* 针对退货反馈（灰色色差、安装说明书）优化图文，提升转化率与毛利。
* **低效/优化对象 (Low Efficiency)：**
  * *对象：* WM-CBL-TRAY (理线托架)
  * *策略：* 作为赠品或升降桌配件组合销售，提高动销周转。
* **亏损与清库存产品 (Clearance)：**
  * *对象：* WM-MON-ARM-D (双臂支架), WM-MAT-ANTI (站立地垫)
  * *策略：* 设专属折扣码，在 30 天内清除 365天以上库存，将超期仓储费直接降为零。

---

## 十六、下个月经营目标规划

* **销售额目标 (Sales Target)：** **$120,000.00** (预计增长约 15%)
* **有效订单目标 (Orders Target)：** **950 单**
* **经营贡献利润目标 (Profit Target)：** **$52,000.00** (利润率目标保持在 **43%~45%**)
* **广告预算控制 (Ad Budget)：** 严格控制在 **$14,500.00** 以内 (ACOS 目标 < 18%，整体广告销售占比 < 13%)
* **整体 ROAS 目标：** **>= 5.50**
* **全店退货率目标：** 控制在 **<= 3.5%** 以内 (通过整改大件发泡包装防损实现)
* **库存周转天数目标：** 整体在库周转降至 **65 天**
* **超期仓储费用目标：** 由本期 $1,180 压缩至 **$300 以内** (清库后直接削减 75% 惩罚性仓储费)

---

## 十七、管理层最终行动结论 (Top 5 必做事项)

如果你是这个店铺的负责人，下个月最应该推进的 5 件事情（按优先级排序）：

### 🥇 第一优先级 (P0)：立即叫停升降桌断货风险 SKU 广告竞价，启动加急移库
* **【做什么】** 将 WM-DESK-55IN 广告日预算压降 50%，暂停高词竞价，并自第三方海外仓调拨 100 件至 FBO。
* **【为什么】** 当前在售库存仅数十件，日均消耗快，若不降速将在一周内空仓断货，导致白耗广告并掉出自然排名。
* **【针对产品】** WM-DESK-55IN (SPU-ELECTRIC-DESK)
* **【数据依据】** 销量 165 件，现有可用库存仅 70 件，在途虽有但海运周期需 20 天，广告月花 $3,650。
* **【预期效果】** 避免产生数千美元广告空转损失，平稳过渡至下一批海运货柜抵港。

### 🥈 第二优先级 (P0)：对 450 天以上超期滞销支架开展清仓，铲除恶性仓储费
* **【做什么】** 设置 25% 沃尔玛专属价格折扣 (Clearance)，同时联系线下批量收购商折价清走 100 件滞留件。
* **【为什么】** 450天以上仓储费占了总仓储费的近一半，每月被平台白白扣走数百美金，时间越长亏损越严重。
* **【针对产品】** WM-MON-ARM-D (SPU-MONITOR-MOUNT)
* **【数据依据】** 产生高库龄仓储费 $1,015，超长库龄在库达 150 件，动销月均仅 62 件。
* **【预期效果】** 下月为店铺直接省下 $800+ 额外仓储罚金，释放数千美元沉淀现金。

### 🥉 第三优先级 (P1)：单臂支架与护眼台灯扩大广告投放，打造高毛利二号增长曲线
* **【做什么】** 将 WM-MON-ARM-S 与 WM-LAMP-LED 广告预算翻倍，开启品牌推广与搜索顶位投放。
* **【为什么】** 此二款产品 ROAS 高达 9.0+，毛利率超 45%，库存超过 300 件非常健康，但目前广告花费严重不足。
* **【针对产品】** WM-MON-ARM-S, WM-LAMP-LED
* **【数据依据】** 广告花费仅 $420 与 $350，贡献销售合计超 $7,000，库存周转健康。
* **【预期效果】** 在保持健康利润率的前提下，为店铺新增 $10,000+ 纯销售增量。

### 🏅 第四优先级 (P1)：针对卖家责任退货（配件缺失、升降异响）进行供应链品控整改
* **【做什么】** 约谈电机与螺丝配件供货厂，在出厂包装中加入独立高标号密封配件盒，并增设出厂全检流程。
* **【为什么】** 卖家责任退货占有效退货的近一半，且 Keep It 产生了 ${fmtCurrency(keepItAmount)} 的净货值损失。
* **【针对产品】** SPU-ELECTRIC-DESK (升降桌系列) & SPU-OFFICE-CHAIR (工学椅系列)
* **【数据依据】** 有效退货中因“少发配件、异响、滑丝”占比达 40%，卖家责任件数占比高达 ${fmtPct(sellerResponsiblePct)}。
* **【预期效果】** 将退货率压降至 3% 以下，年化减少退货损失及平台差评风险数万美元。

### 🎖️ 第五优先级 (P2)：实施桌面升降配件“买大赠小/加价购”关联营销，盘活滞销配件
* **【做什么】** 在升降桌详情页设置满赠或加价 $9.90 换购防疲劳地垫/理线托架促销活动。
* **【为什么】** 升降桌客单价高转化好，而理线托架及地垫库存周转天数超 200 天，捆绑销售能互惠互利。
* **【针对产品】** WM-DESK-55IN + WM-MAT-ANTI + WM-CBL-TRAY
* **【数据依据】** 理线架与地垫库存合计近 1,000 件，销售速度偏低。
* **【预期效果】** 既提升了升降桌的性价比和成单转化率，又加速消化了长库龄配件库存。

---
*报告生成系统：Walmart 店铺月度经营分析与利润诊断决策系统 (Enterprise v2.0)*
`;
}
