const request = require('request')
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const xml2js = require('xml2js')
const builder = new xml2js.Builder();
const moment = require('moment');
class Invoice{
  constructor(xfsh,xfmc,xfdzdh,xfyhzh,url,payee='收款人',drawer='开票人',reviewer='复核人',wsname='admin',wspwd='admin'){
      this.XFSH = xfsh
      this.xfmc = xfmc
      this.xfdzdh = xfdzdh
      this.xfyhzh = xfyhzh
      this.url = url
      this.SKR = payee
      this.KJR = drawer
      this.FHR = reviewer
      this.wsname = wsname
      this.wspwd = wspwd
  }
  /**
   * 发送请求
   * @param {请求的数据} postData 
   */
  http(postData){
    return new Promise((resolve,reject)=>{
      var options = {  
        url: this.url,  
        headers: {  
          'Content-Type': 'text/xml'
        },  
        body: postData
      };
      request.post(options, function(err, res, html) {
        if(err){
          reject(err)
        }else{
          resolve(html)
        }
      });
    })
  }
  /**
   * xml转json
   * @param {xml字符串} xml 
   */
  string2json(xml){
    return new Promise((resolve, reject)=>{
      parseString(xml,function(e,r){
        if(e){
          reject(e)
        }else{
          resolve(r)
        }
      })
    })
  }
  /**
   * 打印发票
   * @param {发票代码} fpdm 
   * @param {发票号码} fphm 
   */
  async print(fpdm, fphm){
    try {
      let printObj = {
        DataArea:{
          SID:'Invoice_pr',
          wsname: this.wsname,
          wspwd: this.wspwd,
          Data: {
            Order: {
              Head: {
                FPZL:'00',
                fpdm,
                fphm
              }
            }
          }
        }
      }
      var postData = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:AutokpIntf-IAutokp"><soapenv:Header/><soapenv:Body><urn:Invoice_pr soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><fpxx xsi:type="xsd:string">`
      var xml = builder.buildObject(printObj);
      xml = entities.encode(xml)
      postData += xml
      postData += `</fpxx></urn:Invoice_pr></soapenv:Body></soapenv:Envelope>`;  
      let data = await this.http(postData)
      return data
    } catch (error) {
      throw error
    }
  }
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
  async applyInvoice(gfmc, gfsh, gfdzdh, gfyhzh, invoices){
    let invoiceObjInfo = {
      DataArea: {
        SID: 'SID_ZP',
        wsname: this.wsname,
        wspwd: this.wspwd,
        Data: {
          Order: {
            Head: {
              FPZL: '00',
              gflx: '01',
              fpzf: '00',
              XFSH:this.XFSH,
              xfmc: this.xfmc,
              xfdzdh: this.xfdzdh,
              xfyhzh: this.xfyhzh,
              BZ: '',
              KJR: this.KJR,
              FHR: this.FHR,
              SKR: this.SKR,
              QDBZ: '0',
              XSDJBH:new Date().getTime(),
              GFMC:gfmc,
              GFSH:gfsh,
              gfdzdh,
              gfyhzh,
              KJRQ:moment().format('YYYY-MM-DD')
            },
            Items: {
              Item: [{
                HSBZ: '0',
                goodsnover: '30.0',
                YHZCBS: '0',
                zkhbs: '0',
              }],
            },
          },
        },
      },
    };
    let itemArr = []
    for(let i=0;i<invoices.length;i++){
      let tmpInfo = invoices[i]
      itemArr.push({
        MXXH:i+1,
        JE:tmpInfo.amount,
        SLV:tmpInfo.taxRate,
        SPMC:tmpInfo.invoiceTypeName,
        SL:tmpInfo.number,
        DJ:tmpInfo.price,
        shuier:tmpInfo.taxAmount,
        sw_spbm:tmpInfo.invoiceType,
        HSBZ:0,
        goodsnover:'30.0',
        YHZCBS:0,
        zkhbs:0
      })
    }
    invoiceObjInfo.DataArea.Data.Order.Items.Item = itemArr
    let postData = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:AutokpIntf-IAutokp"><soapenv:Header/><soapenv:Body><urn:Invoice soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><fpxx xsi:type="xsd:string">`
    let xml = builder.buildObject(invoiceObjInfo);
    xml = entities.encode(xml)
    postData += xml
    postData += `</fpxx></urn:Invoice></soapenv:Body></soapenv:Envelope>`;  
    let html = await this.http(postData)
    let a = html.match(/<return xsi:type="xsd:string">(\S*)<\/return>/)[1]
    let s = entities.decode(a)
    s = `<xml>${s}</xml>`
    let obj = await this.string2json(s)
    return obj
  }
}
