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
                                <el-input clearable v-model="queryKey" @change="searchChange" placeholder="音频名称/文本内容"  @keyup.native.13="onSearch"></el-input>
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
                            <el-table stripe @sort-change="sortChange" :data="soundYhYpData" @selection-change="handleSelectionChange" style="width: 100%;border-left:1px solid #ebeef5;">
                                <el-table-column type="selection" width="50" align="center" ></el-table-column>
                                <el-table-column sortable label="音频名称" prop="fileName" width="140"></el-table-column>
                                <el-table-column label="文本内容" prop="soundContent" >
                                    <template slot-scope="scope" >
                                        <div class="video-edit-box">
                                            <i class="iconfont icon-icon_play" @click="handleVideo(scope.$index, scope.row)"></i>
                                            <span class="video-edit-box-text">{{scope.row.soundContent}}</span>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column sortable prop="editTime" width="140" label="更新时间"> </el-table-column>
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
        <!-- 音频播放 -->
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px" :append-to-body="true">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '@/components/common/bus';
    import wVideo from '../../base/Video';
    export default {
        name: 'dashboard',
        components: {
            wVideo,
        },
        data() {
            return {
            	memberId:'',
                groupId:'',
                queryKey:'',
                multipleSelection:[],
                soundYhYpData:[],
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
                videoVisible:false,
                viewSource:'',
                viewPlaying:false,
            }
        },
        created(){
            if(this.$route.params.memberId){
                this.memberId = this.$route.params.memberId;
            }
            if(this.$route.params.groupId){
                this.groupId = this.$route.params.groupId;
            }
           this.queryMemberSoundConfigItemList();
        },        
        methods: {
            handleBack(){
                this.$router.push(`/sound/yh/${this.memberId}`);
            },
            onSearch(){
                this.activeIndex = 0;
                this.industryId = '';
                this.queryMemberSoundConfigItemList();
            },
            searchChange(val){
                if(!val){
                    this.queryMemberSoundConfigItemList();
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
                this.queryMemberSoundConfigItemList();
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
                this.queryMemberSoundConfigItemList();
            },
            handleSizeChange(val){
                this.pagination.pageSize = val;
                this.queryMemberSoundConfigItemList();
            },            
            //查询会员音频列表
            queryMemberSoundConfigItemList(){
                let params = {
                	memberId:this.memberId,
                    configGroupId:this.groupId,
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

                $.post(this.$baseUrl+'services/sound/queryMemberSoundConfigItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.soundYhYpData = res.returnObject.recordList;
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
                        soundConfigItemIdList.push(value.id);
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
                        soundConfigItemIdList.push(value.id);
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
            handleVideo(index,row){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =row.soundPath;
                })
            },
        },
        computed: {
            
        },
        watch: {
            videoVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            }

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
    .video-edit-box{
        .icon-icon_play{
        }
        .el-textarea {
            width:auto;
            margin-left:28px;
            border:none;
            vertical-align: middle;
            display: inherit;
            .el-textarea__inner{
                border:none;
            }
        }
        .video-edit-box-text{
            margin-left: 5px;
            padding-top: 5px;
        }
    }
</style>
