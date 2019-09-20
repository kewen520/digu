<template>
    <div class="speech-tab-pane">
        <div>
            <el-row >
                <el-form :inline="true" class="demo-form-inline">
                    <el-form-item label="关键词:" >
                        <el-input v-model="keyword" @change="searchChange" placeholder="ID／意图名称"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <el-row style="padding-bottom:20px;">
                <el-button type="primary" @click="handleAdd">新增</el-button>
                <el-button type="primary" :disabled="disabled" @click="delIntentVisible=true">删除</el-button>
                <el-button type="primary" :disabled="disabled" @click="createExportIntentionExcelFile">导出</el-button>
                <el-button type="primary" @click="importIntentVisible=true">导入</el-button>
            </el-row>
            <el-table
                :data="intentTyData"
                @selection-change="handleSelectionChange"
                style="width: 100%">
                <el-table-column 
                    type="selection" 
                    width="55" 
                    align="center">
                </el-table-column>
                <el-table-column
                    prop="id"
                    width="240"
                    label="ID">
                </el-table-column>
                <el-table-column
                    prop="intentionName"
                    label="意图名称">
                </el-table-column>
                <el-table-column
                    prop="createTime"
                    label="更新时间">
                </el-table-column>
                <el-table-column
                    prop="creator"
                    label="操作人"
                    width="180">
                </el-table-column>
                <el-table-column
                    width="80"
                    label="操作">
                    <template slot-scope="scope">
                        <span>
                            <el-button type="text" @click="handleEdit(scope.row,scope.$index)">编辑</el-button>
                        </span>
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
        <!-- 删除 -->
        <el-dialog class="addQuestion" title="删除意图"  :visible.sync="delIntentVisible" width="400px">
            <div>
                您确定要删除已选中的{{this.multipleSelection.length}}个意图吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delIntentVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeIntentionSpeechcraftList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 导入提醒 -->
        <el-dialog title="导入通用意图"  :visible.sync="importEntenVisible" width="400px">
            <div>
                本次导入将新增{{importFileLength}}个意图，确定继续导入吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="importEntenVisible = false">取 消</el-button>
                <el-button type="primary" @click="importIntentionExcelFileList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 导入 -->
        <el-dialog title="导入通用意图"  :visible.sync="importIntentVisible" width="400px">
            <div>
                <el-row>
                    <el-col :span="3" class="import-pop-file"><i class="el-icon-tickets"></i></el-col>
                    <el-col :span="20" class="fileCol">
                        <span class="import-tip top">{{errorMsg}}</span>
                        <el-input type="text" v-model="fileName" >
                        </el-input>
                        <input type="file" id="importInput" class="fileInput" placeholder="选择本地文件" @change="fileChange">
                        <span class="import-tip">注：格式excel、txt,文件大小必须控制在5M以内</span>
                    </el-col>
                </el-row>
                
                
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="importIntentVisible = false">取 消</el-button>
                <el-button type="primary" @click="importIntentEnter">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '@/components/common/bus';
    // import dateSet from '@/components/common/date';
    // import common from '@/components/common/common';
    export default {
        name: 'dashboard',
        data() {
            return {
                keyword:'',
                type:'1',
                fileName:'',
                multipleSelection:[],
                disabled:true,
                intentTyData:[],
                sortList:[],
                cur_page:1,
                delIntentVisible:false,
                importIntentVisible:false,
                importEntenVisible:false,
                errorMsg:'',
                importFilePath:'',
                importFileLength:0,
                importFileErrorLength:0,
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
           this.queryIntentionSpeechcraftManageList();
        },
        watch: {
            
        },
        methods: {
            onSearch(){
                this.queryIntentionSpeechcraftManageList();
            },
            searchChange(val){
                if(!val){
                    this.queryIntentionSpeechcraftManageList();
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
                
            },
            handleAdd(){
                this.$router.push('/speech/add');
            },
            handleSelectionChange(val){
                this.multipleSelection=[];
                this.multipleSelection = val;
                if(this.multipleSelection.length){
                    this.disabled = false;
                }else{
                    this.disabled = true;
                }
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryIntentionSpeechcraftManageList();
            },
            handleImport(){
                
            },
            handleEdit(row,index){
                // this.$store.dispatch('setIntentData',row)
                this.$router.push(`/speech/add/${row.id}`);
            },
            importIntentEnter(){

                if(this.importFileLength*1>0){
                    this.importIntentVisible = false;
                    this.importEntenVisible = true;  
                }else{
                    this.$message.error('请重新选择导入文件！');
                }
                
            },
            //查询通用意图列表
            queryIntentionSpeechcraftManageList(){
                let params = {
                    intentionType:this.type,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };

                let keyword = this.keyword;
                if(keyword){
                    params.keyword=keyword;
                }
                if(this.sortList){
                    params.sortList = this.sortList;
                }
                $.post(this.$baseUrl+'services/intention/queryIntentionSpeechcraftManageList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.intentTyData = res.returnObject.recordList;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //删除意图
            removeIntentionSpeechcraftList(){
                let ids = this.multipleSelection.map((item)=>{
                    return item.id;
                })
                $.post(this.$baseUrl+'services/intention/removeIntentionSpeechcraftList.json',JSON.stringify(ids)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.delIntentVisible = false;
                        this.queryIntentionSpeechcraftManageList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //导入通用意图
            importIntentionExcelFileList(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("intentionType",1);
                oMyForm.append("file", $('#importInput')[0].files[0]);

                $('#importInput').val('')
                $.ajax({
                    url: self.$baseUrl+'services/intention/importIntentionExcelFileList.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.importEntenVisible = false;
                        self.$message.success(`语料上传成功${self.importFileLength}条！失败${self.importFileErrorLength}条！`);
                        self.queryIntentionSpeechcraftManageList();
                    }else{
                        self.errorMsg = res.errorInfoList[0].errorMessage;
                    }
                });
            },
            //创建意图导出Excel文件
            createExportIntentionExcelFile(){
                let ids = this.multipleSelection.map((item)=>{
                    return item.id;
                })
                let params = {
                    intentionType:this.type,
                    intentionIdList:ids
                };
                $.post(this.$baseUrl+'services/intention/createExportIntentionExcelFile.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.downloadFile(res.returnObject.filePath);
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //下载Excel文件
            downloadFile(file){
                let params = {
                    filePath:file
                };
                window.location.href = this.$baseUrl+'services/file/downloadFile.html?filePath='+params.filePath;

            },
            // 上传文件
            fileChange(res){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#importInput')[0].files[0]);
                
                this.fileName = $('#importInput').val();
                
                $.ajax({
                    url: self.$baseUrl+'services/common/uploadAnnexFile.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.importFilePath = res.returnObject;
                        self.checkIntentionExcelFileList();
                    }else{
                        self.$message.error('上传失败！');
                    }
                })
            },
            checkIntentionExcelFileList(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("intentionType",1);
                oMyForm.append("file", $('#importInput')[0].files[0]);

                $.ajax({
                    url: self.$baseUrl+'services/intention/checkIntentionExcelFileList.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.importFileLength = res.returnObject.correctRowNumber;
                        self.errorMsg = `成功导入${self.importFileLength}条。`;
                        // this.importFileErrorLength = res.returnObject
                    }else{
                        self.errorMsg = res.errorInfoList[0].errorMessage;
                    }
                });
            }
        },
        destroyed(){
           
        }
    }

</script>


<style scoped lang="less">
    .import-pop-file{
        color: #409EFF;
        font-size:22px;
        line-height:33px;
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
            width: 100%;
            height: 32px;
        }
    }
</style>
