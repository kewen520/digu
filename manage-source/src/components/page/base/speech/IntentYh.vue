<template>
    <div class="speech-tab-pane">
        <div>
            <el-row >
                <el-form :inline="true" class="demo-form-inline">
                    <el-form-item label="关键词:" >
                        <el-input v-model="queryKey" @change="searchChange" placeholder="用户名称"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <el-table
                @sort-change="sortChange"
                :data="memberData"
                style="width: 100%;border-left:1px solid #ebeef5;">
                <el-table-column
                    prop="userName"
                    label="创建用户">
                </el-table-column>
                <el-table-column
                    sortable
                    prop="latestApplyTime"
                    width="180"
                    label="更新时间">
                </el-table-column>
                <el-table-column
                    width="100"
                    label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleEdit(scope.row,scope.$index)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
            
            <div class="pagination" >
                <el-pagination background @current-change="handleCurrentChange" 
                    layout="total, prev, pager, next,jumper"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    >
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
    import bus from '@/components/common/bus';
    export default {
        name: 'dashboard',
        data() {
            return {
                queryKey:'',
                type:'3',
                multipleSelection:[],
                disabled:true,
                memberData:[],
                sortList:[],
                cur_page:1,
                releaseRow:{},
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
            }
        },

        computed: {
            
        },
        created(){
            this.userInfo = this.$store.getters.getUserInfo;
            this.queryMemberList();
        },
        watch: {
            
        },
        methods: {
            onSearch(){
                this.queryMemberList();
            },
            searchChange(val){
                if(!val){
                    this.queryMemberList();
                }
            },
            sortChange(column){
                let flag = true;
                if(column.order=='ascending'){
                    flag = true;
                }else{
                    flag = false;
                }
                this.sortList =[{
                    propertyName:column.prop,
                    ascendingFlag:flag
                }]
                this.queryMemberList();
            },
            changeValue(){

            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryMemberList();
            },
            handleEdit(row,index){
                this.$router.push(`/speech/member/${row.memberId}`);
            },
            handleRelease(row,index){
                this.releaseOneVisible = true;
                this.releaseRow = row;
            },
            //查询会员列表
            queryMemberList(){
                let params = {
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };

                let queryKey = this.queryKey;
                if(queryKey){
                    params.queryKey=queryKey;
                }
                if(this.sortList.length){
                    params.sortList = this.sortList;
                }

                $.post(this.$baseUrl+'services/member/queryMemberList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.memberData = res.returnObject.recordList;

                        this.memberData.filter((item)=>{
                            item.userName = item.enterpriseName || item.accountName;
                        })

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
        },
        destroyed(){
           
        }
    }

</script>


<style scoped lang="less">
    .import-pop-file{
        width:100px;
        color: #409EFF;
        font-size:22px;
        line-height:33px;
        text-align:right;
        padding-right: 20px;
    }
    .import-tip{
        font-size: 12px;
        color: #FF425C;
        margin-top: 5px;
        &.top{
            display: block;
            position: absolute;
            left:0;
            top: -25px;
        }
    }

    .fileCol{
        position: relative;
        .fileInput{
            position: absolute;
            top:0px;
            left: 0;
            opacity: 0;
        }
    }
    // .validIndustryList{
    //     .validIndustryList-ul{
    //         .validIndustryList-li{
    //             border-bottom: none;
    //             &.active{
    //                 background-color: #E6F7FF;
    //                 border-right: 3px solid #1890FF;
    //             }
    //         }
    //     }
    // }
    .operation-box{
        .line{
            color: #E8E8E8;
        }
    }
    .status-info{
        position: relative;
        padding-left: 10px;
        &:before{
            content: '';
            width: 5px;
            height: 5px;
            background-color: #909399;
            border-radius: 50%;
            position: absolute;
            left: 0;
            top:6px;
        }
    }
    .status-success{
        position: relative;
        padding-left: 10px;
        &:before{
            content: '';
            width: 5px;
            height: 5px;
            background-color: #67c23a;
            border-radius: 50%;
            position: absolute;
            left: 0;
            top:6px;
        }
    }
    .addIntent-box{
        .el-input__inner{
            width:248px;
        }
    }
</style>
