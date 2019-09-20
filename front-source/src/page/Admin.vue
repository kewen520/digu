<template>
    <div>
        <div class="content-box-top">
            <el-input v-model="select_word" clearable placeholder="筛选关键词" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
            <div class="content-box-top-right">
                <el-button type="primary" icon="el-icon-circle-plus-outline" >添加角色任务</el-button>
            </div>
        </div>
        <div class="w-container">
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="角色权限" name="first">
                    <el-table :data="roleTableData" style="width: 100%">
                        <el-table-column prop="num" label="序号" width="100"></el-table-column>
                        <el-table-column prop="name" label="角色名称" ></el-table-column>
                        <el-table-column prop="desc" label="角色说明" ></el-table-column>
                        <el-table-column  label="操作" width="220">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleModify">修改信息</el-button>
                                <el-button type="text" @click="handleManagement(scope.$index, scope.row)">成员管理</el-button>
                                <el-button type="text" @click="settingVisible=true">权限设置</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="人员管理" name="second">
                    
                </el-tab-pane>
            </el-tabs>
        </div>

        <el-dialog title="权限设置" class="authenticationDialog" :visible.sync="settingVisible" width="600px">
            <div>
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                <div style="margin: 15px 0;"></div>
                <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
                    <el-checkbox v-for="city in cities" :label="city" :key="city">{{city}}</el-checkbox>
                </el-checkbox-group>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="settingVisible=false">取 消</el-button>
                <el-button type="primary" @click="handleStting(scope.$index, scope.row)">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    
    import bus from '../common/bus';
    const cityOptions = ['创建任务', '新建话语', '报表导出', '管理任务','分配权限'];
    export default {
        name: 'baseform',
        data: function(){

            return {
                select_cate: '',
                select_word: '',
                settingVisible:false,
                activeName:'first',
                roleTableData:[
                    {
                        num:1,
                        name:'jiaosemingcheng',
                        desc:'说明'
                    }
                ],
                checkAll: false,
                checkedCities: ['创建任务', '新建话语'],
                cities: cityOptions,
                isIndeterminate: true,
                
            }
        },
        created() {
            bus.$emit('contentTop', true);

            // this.queryMemberDetail();
        },
        methods: {
            handleClick(){
                
            },
            // 搜索
            search(){
                if(!this.select_word){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                if(this.activeName=='recharge_record'){
                    this.queryCashOrderList();
                }else{
                    this.queryConsumptionOrderList();
                }
            },
            handleModify(index,row){
                this.$router.push('/account');
            },
            handleManagement(index,row){

            },
            handleStting(index,row){

            },
            handleCheckAllChange(val) {
                this.checkedCities = val ? cityOptions : [];
                this.isIndeterminate = false;
            },
            handleCheckedCitiesChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.cities.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
            },
        },
        destroyed(){
            bus.$emit('contentTop', false);
        }
    }
</script>
<style scoped lang="less">
    .handle-input {
        width:240px;
        display: inline-block;
    }
</style>