<template>
    <div>
        <div class="w-container log-form">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>企业付费</span>
                </div>
                <div class="recharge-from-box">
                    <span class="service－box">客服热线：0551-69101456</span>
                    <el-form ref="rechrgeForm" :model="rechrgeForm" label-width="100px">
                        <el-form-item label="账户余额：" >
                            <span class="blue">{{changeMoney}}元</span>
                        </el-form-item>
                        <el-form-item label="剩余通话时长：" label-width="120px">
                            <span class="blue time" v-html="leaveConnectedDuration"></span>
                            <el-popover
                                placement="right"
                                width="200"
                                trigger="hover">
                                <div>通话{{yuan}}元／分钟</div>
                                <span slot="reference" class="blue"><i class="el-icon-lx-redpacket"></i>收费标准</span>
                            </el-popover>
                        </el-form-item>
                        
                        <el-form-item label="充值金额">
                            <el-input v-model="rechrgeForm.money" placeholder="充值金额" style="width:284px"></el-input> 元
                        </el-form-item>
                        <el-form-item>
                            <el-radio v-model="rechrgeForm.money" label="1000" border>1000</el-radio>
                            <el-radio v-model="rechrgeForm.money" label="3000" border>3000</el-radio>
                            <el-radio v-model="rechrgeForm.money" label="5000" border>5000</el-radio>
                            <el-radio v-model="rechrgeForm.money" label="10000" border>10000</el-radio>
                            <el-radio v-model="rechrgeForm.money" label="15000" border>15000</el-radio>
                        </el-form-item>
                        <el-form-item label="支付方式" class="pay-type-box">
                            <el-radio class="alipay-radio" v-model="rechrgeForm.paymentType" label="2" border>支付宝支付</el-radio>
                            <el-radio class="wechat-radio" v-model="rechrgeForm.paymentType" label="1" border>微信支付</el-radio>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="addCashOrder" class="pay-btn">充值</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-card>
        </div>
        <!-- 支付提示框 -->
        <el-dialog title="正在支付中" :visible.sync="payVisible" width="560px">
            <div class="del-dialog-cnt">请在支付宝中完成支付！</div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handlePayed">已完成支付</el-button>
            </span>
        </el-dialog>
        <el-dialog title="微信支付" :visible.sync="weixinVisible" width="560px">
            <div class="weixin-pay-box">
                <img :src="weixinQrcodeSrc" alt="" class="weixinQrcode">
                <p class="paystatus" v-show="paystatus"><i class="el-icon-success"></i>{{paystatus}}</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handlePayed">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'baseform',
        data: function(){
            return {
                payVisible:false,
                orderId:'',
                timer:null,
                yuan:null,
                rechrgeForm:{
                    money:'1000',
                    paymentType:'2',
                },
                changeMoney:0,
                leaveConnectedDuration:0,
                weixinVisible:false,
                weixinQrcodeSrc:'',
                timer:null,
                paystatus:''
            }
        },
        created(){
            this.queryMemberDetail();
            this.querySystemConfigValue();
        },
        methods: {
            handlePayed(){
                this.payVisible=false;
                this.weixinVisible=false;
                this.timer&&clearInterval(this.timer);
                this.queryMemberDetail();
            },
            addCashOrder(){
                let data={
                    transferMoney:this.rechrgeForm.money,
                    paymentType:this.rechrgeForm.paymentType
                }
                $.post(this.$baseUrl+'order/addCashOrder.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.orderId = res.returnObject.orderId;
                        
                        if(this.rechrgeForm.paymentType==2){
                            const {href} = this.$router.resolve({
                                name: 'pay',
                                path:`/pay/${this.orderId}`,
                                query: {}
                            });
                            this.payVisible = true;
                            window.open(href, '_blank')
                        }else {
                            this.weixinVisible = true;
                            this.paystatus="支付中..."
                            this.weixinQrcodeSrc = this.$baseUrl +"order/showQRCodeImage.html?cashOrderId=" + res.returnObject.orderId;
                            this.timer = setInterval(()=>{
                                this.queryCashOrder().then((res)=>{
                                    clearInterval(this.timer);
                                    if(res==true){
                                        this.paystatus="支付成功！"
                                    }else{
                                        this.paystatus="支付失败！"
                                    }
                                })
                            },1000)
                        }
                        

                        // this.$router.push('/pay/'+this.orderId);

                        // window.open("index4.html?cashOrderId=" + res.returnObject.orderId, "_blank");
                        //启动刷新查询结果，10秒刷一次
                        // this.timer = setInterval(()=>{
                        //     this.queryCashOrder();
                        // },1000)
                        // window.setInterval(queryCashOrder, 10000,res.returnObject.orderId );
                          
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.9.3.显示收款二维码
            queryCashOrder(){
                return new Promise((resolve,reject)=>{
                    $.get(this.$baseUrl+'order/queryCashOrderDetail.json?cashOrderId='+this.orderId).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                        
                            if(res.returnObject.orderStatus != "1" && res.returnObject.orderStatus != "2" ){
                                resolve(true);
                                //支付成功
                                // this.$message({
                                //     showClose: true,
                                //     duration:0,
                                //     message: '支付成功！',
                                //     type: 'success'
                                // });
                                // window.location.reload();
                            }else{
                                resolve(false);
                            }  
                            
                        }else{
                            resolve(res.errorInfoList[0].errorMessage);
                            // this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                })
                
            },
            // 2.3.1.查询会员信息
            queryMemberDetail(){
                $.get(this.$baseUrl+'member/queryMemberDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject;
                        this.changeMoney=data.changeMoney || 0;
                        this.leaveConnectedDuration = this.formatterTime(data.leaveConnectedDuration||0)
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.1.8.查询配置信息
            querySystemConfigValue(){
                let data={
                    configGroup:1,
                    key:'CHANGE_FEE_STANDARD'
                }
                $.get(this.$baseUrl+'common/querySystemConfigValue.json',data).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.yuan = res.returnObject;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            formatterTime(time){
                if(time){
                    // var h = Math.floor(time/3600%24);
                    var m = Math.floor(time/60);
                    return time =`<span class="grid-num">${m}</span>分`;
                }else{
                    return time =`<span class="grid-num">0</span>分`;
                }
                
            },
        },
        watch:{
            weixinVisible(val){
                if(!val){
                    this.paystatus='';
                    this.weixinQrcodeSrc='';
                }
            }
        }
    }
</script>
<style scoped lang="less">
.pay-btn{
    float:right;
    margin: 40px 40px 0 0;
}
.recharge-from-box{
    position: relative;
    min-height:600px;
    .time{
        margin-right: 20px;
    }
}
.service－box{
    position: absolute;
    right: 40px;
    top:10px;
}
.blue{
    color: #4E8FF9;
}
.weixin-pay-box{
    text-align:center;
}
.weixinQrcode{
    width: 200px;
    height: 200px;
}
.paystatus{
    color: #4E8FF9;
    font-size: 20px;
}
</style>