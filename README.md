
# 航信开票接口api
**已经实现的接口**
- 开票接口
- 打印接口

**示例**
```
  /**
   * 实例化
   * @param {销方税号} xfsh 
   * @param {销方名称} xfmc 
   * @param {销方地址电话} xfdzdh 
   * @param {销方银行账户} xfyhzh 
   * @param {请求地址} url 
   * @param {收款人} payee 
   * @param {开票人} drawer 
   * @param {复核人} reviewer 
   * @param {登录用户名} wsname 
   * @param {登录密码} wspwd 
   */
  let invoice = new Invoice(xfsh,xfmc,xfdzdh,xfyhzh,url,payee,drawer,reviewer,wsname,wspwd)
  
  
  /**
   * 打印发票
   * @param {发票代码} fpdm 
   * @param {发票号码} fphm 
   */
  let data = await invoice.print(fpdm, fphm)
  
  
  /**
   * 申请发票
   * @param {购方名称} gfmc 
   * @param {购方税号} gfsh 
   * @param {购方地址电话} gfdzdh 
   * @param {购方银行卡号} gfyhzh
   * @param {发票明细} invoices
   * invoices=[{
   * amount,//金额
   * taxRate,//税率
   * invoiceTypeName,//发票类型名称
   * number,//数量
   * price,//单价
   * taxAmount,//税额
   * invoiceType//发票编码
   * }]
   */
   let data = invoice.applyInvoice(gfmc, gfsh, gfdzdh, gfyhzh, invoices)
```
