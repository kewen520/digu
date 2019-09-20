<template>
    <div class="container-admin">
        <el-row class="back-btn-box">
            <router-link to="/information"><el-button>返回</el-button></router-link>
            <el-button type="primary" v-show="activeName=='second'||activeName=='third'" @click="onHandleRefresh">刷新</el-button>
        </el-row>
        
        <div class="admin-content">
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="基本信息" name="first">
                    <b-info :datas='datas'/>
                </el-tab-pane>
                <el-tab-pane label="充值管理" name="second">
                    <r-manage :datas='datas' :tabActive='activeNameA' :refresh="secondRefresh"/>
                </el-tab-pane>
                <el-tab-pane label="消费记录" name="third">
                    <e-record :datas='datas' :tabActive='activeNameA' :refresh="thirdRefresh"/>
                </el-tab-pane>
                <el-tab-pane label="通话统计" name="fourth">
                    <c-statistics :datas='datas' :tabActive='activeNameA'/>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<script>
    import bus from '../common/bus';
    import bInfo from './base/BasicInformation'
    import rManage from './base/RechargeManagement'
    import eRecord from './base/ExpensesRecord'
    import cStatistics from './base/CallStatistics'
    export default {
        name: 'user',
        data() {
            return {
                activeName:'first',
                activeNameA:'',
                datas:{},
                secondRefresh:false,
                thirdRefresh:false,
            }
        },
        components: {
            bInfo,
            rManage,
            eRecord,
            cStatistics
        },
        mounted(){
            let clintHeight = document.documentElement.clientHeight;
            let height = clintHeight - 123;
            bus.$on('setRefresh',msg=>{
                if(msg=='false'){
                    if(this.activeName=='second'){
                        this.secondRefresh=false;
                    }else{
                        this.thirdRefresh=false;
                    }
                }
            });

            this.queryMemberDetail();
        },
        created(){
            let types = ['first','second','third','fourth'];
            this.type = this.$route.query.type;

            let name = types[this.type-1] || 'first';

            this.activeName = name;

            this.$nextTick(() => {
                this.activeNameA = name.toString();
            })
        },
        methods: {
            handleClick(num){
                let n = num.index*1+1;
                this.activeNameA = num.name;

                this.$router.push({query:{type:n}})
            },
            onHandleRefresh(){
                if(this.activeName =='second'){
                    this.secondRefresh=true;
                }
                if(this.activeName =='third'){
                    this.thirdRefresh=true;
                }
            },
            queryMemberDetail(){
                let data = {
                    memberId:this.$route.params.id
                }
                $.get(this.$baseUrl+'services/member/queryMemberDetail.json',$.param(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        this.datas = res.returnObject;

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }

                }).fail(res=>{

                });
            },
        }
    }

</script>


<style scoped lang="less">
    .admin-content{
        margin-top: 20px;
        background:transparent;
    }
    .w-box-card{
        background-color: #fff;
    }
</style>
