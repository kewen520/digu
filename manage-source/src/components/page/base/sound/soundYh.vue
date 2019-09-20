<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>资源管理</el-breadcrumb-item>
                <el-breadcrumb-item>音频库</el-breadcrumb-item>
                <el-breadcrumb-item>用户音频库</el-breadcrumb-item>
                <el-breadcrumb-item>查看用户音频库</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button class="back-btn" @click="handleBack">返回</el-button>
        </div>
        <div class="admin-body">
            <div class="speech-tab-pane">
                <div>
                    <el-row >
                        <el-form :inline="true" class="demo-form-inline">
                            <el-form-item label="关键词:" >
                                <el-input clearable v-model="queryKey" @change="searchChange" placeholder="文件夹名称"  @keyup.native.13="onSearch"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onSearch">搜索</el-button>
                            </el-form-item>
                        </el-form>
                    </el-row>
	                <el-row style="padding-bottom:20px;">
	                    <el-col>
	                        <el-button type="primary" :disabled="downDisabled" @click="exportSoundZipFile" >下载音频</el-button>
	                        <el-button type="primary" :disabled="expDisabled" @click="downloadSoundConfigItemExcelFile" >下载表格</el-button>
	                    </el-col>
	                </el-row>
                    <el-row>
                        <el-col>
                            <el-table stripe @sort-change="sortChange" :data="soundYhData" @selection-change="handleSelectionChange" style="width: 100%;border-left:1px solid #ebeef5;">
                                <el-table-column type="selection" width="50" align="center" ></el-table-column>
                                <el-table-column sortable prop="configGroupName" label="文件夹名称"></el-table-column>
                                <el-table-column sortable prop="editTime" width="140" label="更新时间"></el-table-column>
                                <el-table-column width="50" label="操作">
                                    <template slot-scope="scope">
                                        <span class="operation-box">
                                            <el-button type="text" @click="handleView(scope.row,scope.$index)">查看</el-button>
                                        </span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>
                    <div class="pagination" >
                        <el-pagination background
                           @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="pagination.total"
                           :page-size="pagination.pageSize"
                           :page-sizes="[10, 50, 100, 200]"
                            >
                        </el-pagination>
                    </div>
                </div>
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
                id:'',
                queryKey:'',
                multipleSelection:[],
                soundYhData:[],
                sortList:[],
                cur_page:1,
                activeIndex:0,
                selectOpt:[],
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:10
                },
                downDisabled:true,
                expDisabled:true,
            }
        },
        created(){
            if(this.$route.params.id){
                this.id = this.$route.params.id;
            }
           this.queryMemberSoundConfigGroupList();
        },        
        methods: {
            handleBack(){
                this.$router.push('/resource?active=2');
            },
            onSearch(){
                this.activeIndex = 0;
                this.industryId = '';
                this.queryMemberSoundConfigGroupList();
            },
            searchChange(val){
                if(!val){
                    this.queryMemberSoundConfigGroupList();
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
                this.queryMemberSoundConfigGroupList();
            },
            // 查看音频列表
            handleView(row,index){
            	this.$router.push(`/sound/yhyp/${this.id}/${row.id}`);
            },
            handleSelectionChange(val){
                this.multipleSelection=[];
                this.multipleSelection = val;
                if(this.multipleSelection.length){
                    this.downDisabled = false;
                    this.expDisabled = false;
                }else{
                    this.downDisabled = true;
                    this.expDisabled = true;
                }
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryMemberSoundConfigGroupList();
            },
            handleSizeChange(val){
                this.pagination.pageSize = val;
                this.queryMemberSoundConfigGroupList();
            },
            //查询会员音频文件夹列表
            queryMemberSoundConfigGroupList(){
                let params = {
                    memberId:this.id,
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

                $.post(this.$baseUrl+'services/sound/queryMemberSoundConfigGroupList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.soundYhData = res.returnObject.recordList;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 下载音频文件
             */
            exportSoundZipFile() {
                // 音频文件夹列表
                let soundConfigGroupList = [];
                // 音频文件列表
                let soundConfigItemIdList = [];

                if (this.multipleSelection.length) {
                    this.multipleSelection.forEach(value => {
                        soundConfigGroupList.push({id: value.id, configGroupName: value.configGroupName});
                    });
                }
                let data = {
                    soundConfigGroupList: soundConfigGroupList,
                    soundConfigItemIdList: soundConfigItemIdList
                }
                $.post(this.$baseUrl + 'services/file/createSoundCompressFile.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        window.location.href = this.$baseUrl + 'services/file/downloadCompressFile.html?filePath=' + res.returnObject.filePath;
                        this.$message.success('导出成功！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 下载音频Excel文件
             */
            downloadSoundConfigItemExcelFile() {
                // 音频文件夹列表
                let soundConfigGroupList = [];
                // 音频文件列表
                let soundConfigItemIdList = [];

                if (this.multipleSelection.length) {
                    this.multipleSelection.forEach(value => {
                        soundConfigGroupList.push({id: value.id, configGroupName: value.configGroupName});
                    });
                }
                let data = {
                    soundConfigGroupList: soundConfigGroupList,
                    soundConfigItemIdList: soundConfigItemIdList
                }
                $.post(this.$baseUrl + 'services/file/createSoundCompressExcelFile.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        window.location.href = this.$baseUrl + 'services/file/downloadCompressFile.html?filePath=' + res.returnObject.filePath;
                        this.$message.success('下载成功！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
        },
        computed: {
            
        },
        watch: {
            
        },
        destroyed(){
           
        },
    }

</script>


<style scoped lang="less">
    .admin-page{
        padding-bottom:10px;
        position: relative;
        .back-btn{
            position: absolute;
            top:8px;
            right:40px;
        }
    }
</style>
