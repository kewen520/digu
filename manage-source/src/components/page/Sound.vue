<template>
    <div class="sound-page" :class="{'soundPath':isSound}">
        <div class="sound-top" v-show="!isSound">
            <el-button type="primary" icon="el-icon-arrow-left" @click="goBack">返回</el-button>
        </div>
        <div class="w-container">
            <el-card class="box-card sound-card">
                <div slot="header" class="clearfix">
                    <el-row>
                        <el-col :span="5" class="sound-card-left">
                            <span>音频管理库</span>
                        </el-col>
                        <el-col :span="9" >
                            <el-input v-model="queryKey" clearable @change="searchChange" placeholder="输入音频名称或文本" class="handle-input mr10"></el-input>
                            <el-button type="primary" icon="search" @click="search">搜索音频</el-button> 
                        </el-col>
                        <el-col :span="10" class="sound-card-right">
                            <el-button type="primary" :disabled="uploadDisabled" class="upload-btn-sound">上传音频
                            <input multiple="multiple" :disabled="uploadDisabled" ref="upload_input" type="file" id="file" @change="uploadSoundFileList" ></el-button>
                            <el-button type="primary" :disabled="disabled" @click="createSoundConfigItemExcelFile">导出表格</el-button>
                            <el-button type="primary" :disabled="disabled" class="upload-btn-sound" @click="uploadBtn">上传表格</el-button>
                            <el-button type="primary" icon="delete" class="sound_top_btn_del" :disabled="del_disabled" @click="delVisible = true">删除</el-button>
                        </el-col>
                    </el-row>
                </div>
                <div class="repository-box">
                    <el-row>
                        <el-col :span="5" class="repository-menu-box" :style="{height:height+72+'px'}">
                            <div class="repository-menu-top">文件夹<i class="el-icon-circle-plus" @click="addGroup"></i></div>
                            <div class="repository-menu sound-menu">
                                <!-- <keep-alive> -->
                                <el-menu 
                                    class="repository-menu" 
                                    :unique-opened="true"
                                    :default-openeds="openeds"
                                    @open="handleOpen">
                                    <el-submenu index="1" >
                                        <template slot="title">话术音频</template>
                                        <draggable v-model="speechMenu" @end="draggableEnd" @start="draggableStart('speech')">
                                            <el-menu-item 
                                            :index="`1-${index}`"
                                            class="repository-menu-item"
                                            :class="{active:item.index==itemActive,edit:item.isEdit}" 
                                            v-for="(item,index) in speechMenu" 
                                            :key="`${index}`">
                                                <div class="duplicate" v-if="item.duplicateFlag == 1">通用</div>
                                                <div class="repository-menu-input-box" v-show="item.show">
                                                    <el-input
                                                    v-model="item.configGroupName" 
                                                    v-if="item.type!=1&&item.type!=2"
                                                    ></el-input>
                                                </div>
                                                
                                                <span v-show="!item.show" class="groupName" @click="querySoundConfigItemList(item,index)">{{item.configGroupName}}</span>
                                                <div class="repository-icon-box edit-box">
                                                    <i class="el-icon-check" @click="modifySoundConfigGroup(item,index)"></i>
                                                    <i class="el-icon-close" @click="cancelEdit(item,index)"></i>
                                                </div>
                                                <div class="repository-icon-box hover-box" v-if="item.groupFlag!=1&&item.groupFlag!=0">
                                                    <i class="iconfont icon-ico_move-sort"></i>
                                                    <i class="iconfont icon-ico_edit-content" @click="editConfigGroupMenu(item,'speech')"></i>
                                                    <i class="iconfont icon-ico_delete" @click="deletSound(item,index)"></i>
                                                </div>
                                            </el-menu-item>
                                        </draggable>
                                    </el-submenu>
                                    <el-submenu index="2"  class="repository-menu" >
                                        <template slot="title">知识库音频</template>
                                        <draggable v-model="knowledgeMenu" @end="draggableEnd" @start="draggableStart('knowledge')">
                                            <el-menu-item 
                                            :index="`2-${index}`"
                                            class="repository-menu-item"
                                            :class="{active:item.index==itemActive,edit:item.isEdit}" 
                                            v-for="(item,index)  in knowledgeMenu" 
                                            :key="index">
                                                <div class="duplicate" v-if="item.duplicateFlag == 1">通用</div>
                                                <div class="repository-menu-input-box" v-show="item.show">
                                                    <el-input 
                                                    v-model="item.configGroupName" 
                                                    v-if="item.type!=1&&item.type!=2"
                                                    ></el-input>
                                                </div>
                                                
                                                <span v-show="!item.show" class="groupName" @click="querySoundConfigItemList(item,index)">{{item.configGroupName}}</span>
                                                <div class="repository-icon-box edit-box">
                                                    <i class="el-icon-check" @click="modifySoundConfigGroup(item,index)"></i>
                                                    <i class="el-icon-close" @click="cancelEdit(item,index)"></i>
                                                </div>
                                                <div class="repository-icon-box hover-box" v-if="item.groupFlag!=1&&item.groupFlag!=0">
                                                    <i class="iconfont icon-ico_move-sort"></i>
                                                    <i class="iconfont icon-ico_edit-content" @click="editConfigGroupMenu(item,'knowledge')"></i>
                                                    <i class="iconfont icon-ico_delete" @click="deletSound(item,index)"></i>
                                                </div>
                                            </el-menu-item>
                                        </draggable>
                                    </el-submenu>
                                </el-menu>
                            </div>
                        </el-col>
                        <el-col :span="19">
                            <el-table stripe :data="configGroupIdData" 
                                class="table tb-edit sound-table" 
                                id="configGroupIdData" 
                                :height="height" 
                                ref="configGroupIdData" 
                                @selection-change="handleSelectionChange" @sort-change="sortChange">
                                <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable"></el-table-column>
                                <el-table-column label="音频名称" prop="fileName" width="140" sortable></el-table-column>
                                <el-table-column label="文本内容" prop="soundContent" >
                                    <template slot-scope="scope" >
                                        <div class="video-edit-box">
                                            <i class="iconfont icon-icon_play" @click="handleVideo(scope.$index, scope.row)"></i>
                                            <el-input type="textarea" class="tb-edit-input" v-if="!scope.row.edit" placeholder="输入文本内容" v-model="scope.row.soundContent" @change="handleChange(scope.$index, scope.row)">></el-input>
                                            <span v-else class="video-edit-box-text">{{scope.row.soundContent}}</span>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="更新时间" prop="editTime" width="140" sortable></el-table-column>
                                <el-table-column label="操作" prop="" width="60" v-if="!isSound">
                                    <template slot-scope="scope">
                                        <el-button type="text" v-if="scope.row.useFlag==0" @click="handleUse(scope.row)">使用</el-button>
                                    </template>
                                </el-table-column>
                                <el-table-column label="状态" prop="useFlag" :formatter="soundUseStatus" width="60" v-if="isSound"></el-table-column>
                            </el-table>
                            <div class="pagination">
                                <el-pagination background @current-change="handleCurrentChange" 
                                    layout="total, prev, pager, next,jumper"
                                    :total="pagination.total"
                                    :page-size="pagination.pageSize"
                                    >
                                </el-pagination>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </div>
        <!--  使用音频 -->
         <el-dialog title="填充回答文本" :visible.sync="useSoundVisible" width="400px" :append-to-body="true">
            <div >您确定要使用音频吗？使用后音频文件将自动填充。</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="useSoundVisible = false">取 消</el-button>
                <el-button type="primary" @click="use">确 定</el-button>
            </span>
        </el-dialog>
       <!--  删除知识库分类 -->
         <el-dialog title="删除确认" :visible.sync="removeSoundVisible" width="400px" :append-to-body="true">
            <div >您确定要删除音频管理库分类<span v-show="removeSoundInfo.configGroupName">“{{removeSoundInfo.configGroupName}}”</span>吗？删除后相关音频也会被删除</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="removeSoundVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeSoundConfigGroup">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除提示框 -->
        <el-dialog title="话术删除确认" :visible.sync="delVisible" width="400px" :append-to-body="true">
            <div >您确定要删除{{this.multipleSelection.length}}条音频吗？删除后将不可恢复？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeSoundConfigItemList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 上传提示框 -->
        <el-dialog title="上传确认" :visible.sync="uploadVisible" width="400px" :append-to-body="true">
            <div >上传内容可能会覆盖相关已有文本内容！</div>
            <span slot="footer" class="dialog-footer">
                
                <el-button type="primary" class="upload-btn-sound">确 定
                    <input type="file" :disabled="disabled" id="importFile"  @change="importSoundConfigItemExcelFile" >
                </el-button>
            </span>
        </el-dialog>
        <!-- 删除提示框 -->
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px" :append-to-body="true">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
        
    </div>
</template>

<script>

    import bus from '../common/bus';
    import common from '../common/common';
    import wVideo from './base/Video';
    import draggable from 'vuedraggable';
    let formPath = '';
    export default {
        name: 'sound',
        components: {
            wVideo,
            draggable
        },
        props:['from'],
        data() {
            return {
                isSound:false,
                queryKey:'',
                filePath:'',
                importFile:'',
                uploadDisabled:true,
                disabled:true,
                videoVisible:false,
                viewSource:'',
                viewPlaying:false,
                removeSoundVisible:false,
                uploadVisible:false,
                removeSoundInfo:{
                    name:''
                },
                // uploadDisabled:true,
                height:554,
                cur_page:1,
                itemActive:0,
                delVisible:false,
                del_disabled:true,
                multipleSelection:[],
                configGroupMenu:[],
                configGroupIdData:[],
                videoStatus:false,
                useSoundVisible:false,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                speechMenu:[],
                knowledgeMenu:[],
                activeGroupType:'speech',
                openeds:['1'],
                sortList:[],
                selectable:false,
                activeGroupId:'',
            }
        },
        created() {
            if(this.$route.path.indexOf('/sound')>-1){
                bus.$emit('contentTop', false);
                this.isSound = true;
            }else{
                this.isSound = false;
            }

            this.querySoundConfigGroupList();
        },
        computed: {
        },
        // beforeRouteEnter(to,form,next){
        //     console.log(form)
        //     next();
        // },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.querySoundConfigItemList();
            },
            handleOpen(val,b){
                if(val=='1'){
                    this.activeGroupType='speech'
                }else if(val=='2'){
                    this.activeGroupType='knowledge'
                }
            },
            goBack(){
                bus.$emit('closeSound',true);
            },
            handleUse(row){
                this.useSoundVisible = true;
                this.currentRow = row;
            },
            use(){

                if(this.from =='repositoryEdit' || this.from=='knowledgeConfig'){
                    bus.$emit('fileName',this.currentRow );
                }
                bus.$emit('closeSound',true);
                this.useSoundVisible = false;
            },
            uploadBtn(){
                this.uploadVisible = true;
            },
            draggableStart(type){
                // this.oldConfigGroupMenu = this.configGroupMenu;

                this.activeGroupType = type;

                this.oldConfigGroupMenu = this.configGroupMenu;


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
                this.querySoundConfigItemList();
            },
            // 移动结束
            draggableEnd(param){

                let sortData = [];
                // this.configGroupMenu.forEach((item)=>{
                //     sortData.push(item.id);
                // });

                if(this.activeGroupType =='speech'){
                    this.speechMenu.forEach((item)=>{
                        sortData.push(item.id);
                    });
                    sortData.concat(this.knowledgeMenu);
                }

                if(this.activeGroupType =='knowledge'){

                    sortData.concat(this.speechMenu);

                    this.knowledgeMenu.forEach((item)=>{
                        sortData.push(item.id);
                    });
                    
                }
                
                this.configGroupMenu = this.speechMenu.concat(this.knowledgeMenu);

                this.configGroupMenu.forEach((item,index)=>{
                  item.index = index;  
                })

                this.sortSoundConfigGroup(sortData).then(res=>{

                    // this.itemActive = param.newIndex;
                    // if(this.itemActive==param.oldIndex){
                        // this.itemActive = param.newIndex;
                    // }else{
                        // console.log(this.configGroupMenu,this.itemActive);
                        // this.querySoundConfigItemList(this.configGroupMenu[this.itemActive],this.itemActive);
                    // }

                    this.querySoundConfigItemList(this.configGroupMenu[this.itemActive],this.itemActive);

                });
            },
            // 排序
            sortSoundConfigGroup(list){
                var dtd = $.Deferred();
                $.post(this.$baseUrl+'sound/sortSoundConfigGroup.json?',JSON.stringify(list)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        dtd.resolve();
                    }else{
                        this.configGroupMenu = this.oldConfigGroupMenu;
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                return dtd;
            },
            // 查询录音文件夹列表
            querySoundConfigGroupList(){
                $.get(this.$baseUrl+'services/sound/querySoundConfigGroupList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let newData = res.returnObject;
                        if(newData && newData.length){
                            newData.forEach(el => {
                                el.isEdit = false;
                                el.show = false;
                            });

                            this.configGroupMenu = newData;

                            newData.forEach((item,index)=>{
                                item.index = index;
                                if(item.soundConfigGroupType==1){
                                    this.speechMenu.push(item)
                                }else{
                                    this.knowledgeMenu.push(item);
                                }
                            })

                            this.querySoundConfigItemList(newData[0],0);
                        }
                        
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },  
            //添加录音配置文件明细列表
            modifySoundConfigGroup(item,index){
                
                index = item.index;

                // this.configGroupMenu = this.speechMenu.concat(this.knowledgeMenu);

                if(!item.configGroupName){
                    if(item.newAdd){
                        this.configGroupMenu.splice(item.index,1);
                        // this.initGroupMenu();
                    }else{
                        this.removeSoundVisible = true;
                        this.removeSoundInfo=item;
                        this.removeSoundInfo.index = item.index;
                    }
                    return false;
                }
                // 如果为新添加的
                if(item.newAdd){
                    let data={
                        configGroupName:item.configGroupName,
                        soundConfigGroupType:this.activeGroupType=='speech'?1:2
                    }
                    $.post(this.$baseUrl+'sound/addSoundConfigGroup.json',JSON.stringify(data)).then((res)=>{

                        if(res.resultMessageEnum=='0000'){
                            this.configGroupMenu[index].newAdd = false;
                            this.configGroupMenu[index].show = false;
                            this.configGroupMenu[index].isEdit = false;
                            this.configGroupMenu[index].id = res.returnObject;
                            if(this.configGroupMenu.length==1){
                                this.querySoundConfigItemList(this.configGroupMenu[0],0);
                            }
                            this.$message.success('添加成功！');
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                }else{
                // 否则为修改
                    
                    let data={
                        id:item.id,
                        configGroupName:item.configGroupName
                    }
                    $.post(this.$baseUrl+'sound/modifySoundConfigGroup.json',JSON.stringify(data)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){

                            this.configGroupMenu[index].show = false;
                            this.configGroupMenu[index].isEdit = false;
                            this.$message.success('修改成功！');

                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                }

                this.initGroupMenu();
            },
            // 新建分类ui
            addGroup(){
                let item = {
                    newAdd:true,
                    isEdit:true,
                    show:true,
                    configGroupName:''
                }

                if(this.activeGroupType=='speech'){
                    item.soundConfigGroupType=1;
                    this.speechMenu.push(item);
                    // this.defaultOpeneds = ['1']
                }
                if(this.activeGroupType=='knowledge'){
                    item.soundConfigGroupType=2;
                    this.knowledgeMenu.push(item);
                }
                
                this.configGroupMenu = this.speechMenu.concat(this.knowledgeMenu);

                this.setIndex()

            },
            setIndex(){
                this.configGroupMenu.forEach((item,index)=>{
                    item.index = index;
                })
            },
            initGroupMenu(){
                this.speechMenu=[];
                this.knowledgeMenu=[];
                this.configGroupMenu.forEach((item,index)=>{
                    item.index = index;
                    if(item.soundConfigGroupType==1){
                        this.speechMenu.push(item)
                    }else{
                        this.knowledgeMenu.push(item);
                    }
                })
            },
            deletSound(item,index){
                this.removeSoundVisible = true;
                this.removeSoundInfo=item;
                this.removeSoundInfo.index = item.index;
            },
            // 删除分类
            removeSoundConfigGroup(){
                    // this.removeGroupName = this.removeSoundInfo.configGroupName;
                    this.removeGroupId = this.removeSoundInfo.id;
                    this.removeGroupIndex = this.removeSoundInfo.index; 
                    let data={
                        soundConfigGroupId:this.removeGroupId
                    }
                    $.post(this.$baseUrl+'sound/removeSoundConfigGroup.json?soundConfigGroupId='+data.soundConfigGroupId).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            this.configGroupMenu.splice(this.removeGroupIndex,1);
                            this.$message.success('删除成功！');
                            this.removeSoundVisible = false;
                            if(this.removeGroupIndex==this.itemActive){
                                this.querySoundConfigItemList(this.configGroupMenu[0],0);
                            }

                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                        this.initGroupMenu();
                    });

            },

            // 查询录音配置文件明细列表
            querySoundConfigItemList(item,index){
                if (item) {
                    if (item.duplicateFlag == 1){
                        this.selectable = false;
                        this.uploadDisabled = true;
                    }else {
                        this.selectable = true;
                        this.uploadDisabled = false;
                    };
                };

                // unclassified 未分类
                let data={
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };
                if(item && item.id){
                    data.configGroupId = item.id;
                    this.activeGroupId = item.id;
                }else{
                    data.configGroupId = this.activeGroupId;
                }
                if(this.queryKey){
                    data.queryKey=this.queryKey;
                }
                if(this.sortList.length){
                    data.sortList = this.sortList;
                }
                $.post(this.$baseUrl+'services/sound/querySoundConfigItemList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject.recordList;
                        
                        
                        if(typeof index != 'undefined'){

                            this.itemActive=item.index;
                        }

                        // this.itemActive=item.index;

                        // 记录当前分类数据
                        if(item){
                            this.activeGroupId = item.id;
                            this.activeGroupName = item.groupName;
                        }
                        if(data.length){
                            this.disabled = false;
                            data.forEach((list,index)=>{
                                list.edit= false;
                            });
                        }else{
                            this.disabled = true;
                        }
                        
                        this.configGroupIdData = data;

                        this.pagination.total = res.returnObject.totalNumber;

                    }else{
                        
                    }
                });
            },
            search() {
                if(!this.queryKey){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                this.querySoundConfigItemList();
            },
            // 搜索框为空时
            searchChange(val){
                if(!val){
                    this.querySoundConfigItemList();
                }
            },
            handleEdit(index, row) {
                this.configGroupIdData.forEach(item=>{
                    if(item.id==row.id){
                        item['edit'] = true;
                    }else{
                        item['edit'] = false;
                    }
                });
            },
            handleChange(index, row){
                this.modifySoundConfigItem(index, row);
            },
            handleDelete(index, row) {
                // console.log(index, row);
            },
            // 2.10.7.修改录音文件明细
            modifySoundConfigItem(index, row){
                let data={
                    id:row.id,
                    // soundContent:this.configGroupIdData[index].soundContent
                }
                if(this.configGroupIdData[index].soundContent){
                    data.soundContent = this.configGroupIdData[index].soundContent
                }
                $.post(this.$baseUrl+'sound/modifySoundConfigItem.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.configGroupIdData[index].edit = false;
                        this.$message.success('修改成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.10.8.删除录音文件明细列表
            removeSoundConfigItemList(){
                let data = [];
                this.multipleSelection.forEach(item=>{
                    data.push(item.id);
                })
                $.post(this.$baseUrl+'sound/removeSoundConfigItemList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.delVisible = false;
                        this.querySoundConfigItemList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            checkSelectable(row, index){
                return this.selectable;

            },
             // 选择
            handleSelectionChange(val) {
                this.multipleSelection = val;
                if(this.multipleSelection.length){
                    this.del_disabled = false;
                }else{
                    this.del_disabled = true;
                }
            },
            // 编辑左侧分类
            editConfigGroupMenu(item,type){
                this.configGroupMenu[item.index].oldConfigGroupName = item.configGroupName;
                this.configGroupMenu[item.index].show = true;
                this.configGroupMenu[item.index].isEdit = true;
            },
            // 取消编辑
            cancelEdit(item,index){
                if(this.configGroupMenu[item.index].oldConfigGroupName){
                    this.configGroupMenu[item.index].show = false;
                    this.configGroupMenu[item.index].isEdit = false;
                    this.configGroupMenu[item.index].configGroupName=this.configGroupMenu[item.index].oldConfigGroupName;
                }else{
                    if(item.newAdd){
                        this.configGroupMenu.splice(item.index,1);
                    }else{
                        this.removeSoundVisible = true;
                        this.removeSoundInfo=item;
                        this.removeSoundInfo.index = item.index;
                    }
                }
                this.initGroupMenu()
            },
            //2.10.9.批量上传录音文件
            uploadSoundFileList(){
                
                let self = this;
                var oMyForm = new FormData();
                let data = [];
                oMyForm.append("configGroupId", this.activeGroupId);
                let files = $('#file')[0].files;

                let size = 5242880;

                for(var i=0;i<files.length;i++){
                    if(files[i].size>size){
                        this.$message.error('请选择5M以内的文件！');
                        this.changeFileType();
                        return false;
                    }
                    let ext = files[i].name.substr(files[i].name.lastIndexOf(".")).toLowerCase(); 
                    // if(ext!=".mp3"&&ext!=".wma"&&ext!=".wav"&&ext!=".amr"){
                    if(ext!=".wav"){
                        self.$message.error('文件格式错误,重新选择！');
                        this.changeFileType();
                        return false;
                    }
                    oMyForm.append("file",files[i]);
                }
                this.changeFileType();
                if(!this.configGroupMenu.length){
                    this.$message.error('请先创建文件夹分类！');
                    return false;
                }
                if(!this.activeGroupId){
                    this.$message.error('请选择文件夹！');
                    return false;
                }
                $.ajax({
                    url: this.$baseUrl+'sound/uploadSoundFileList.json',
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
                        self.$message.success('上传成功！');
                        self.querySoundConfigItemList();
                    }else{
                        self.$message.error('上传失败！');
                    }
                }).fail(function(res) {
                    
                });

                
            },
            changeFileType(){
                $('#file').val('');
            },
            // 2.11.2.创建录音Excel下载文件
            createSoundConfigItemExcelFile(){
                var data={
                    soundConfigGroupId:this.activeGroupId
                }
                $.post(this.$baseUrl+'file/createSoundConfigItemExcelFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        window.location.href = this.$baseUrl+'file/downloadFile.html?filePath='+res.returnObject.filePath;
                        this.$message.success('下载成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.11.3.上传录音Excel文件
            importSoundConfigItemExcelFile(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("configGroupId", this.activeGroupId);
                oMyForm.append("file", $('#importFile')[0].files[0]);
                this.changeExcelFile();
                $.ajax({
                    url: this.$baseUrl+'file/importSoundConfigItemExcelFile.json',
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
                        self.$message.success('上传成功！');
                        self.uploadVisible = false;
                        self.querySoundConfigItemList();
                    }else{
                        self.$message.error('上传失败！');
                    }
                    
                }).fail(function(res) {

                });
            },
            changeExcelFile(){
                $('#importFile').val('');
            },
            handleVideo(index,row){
                
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =row.soundPath;
                    // this.viewSource =this.$baseUrl+'file/downloadFile.html?filePath='+row.soundPath;
                })
            },
            /**
             * 音频使用状态
             * @param row
             * @param column
             * @returns {*|string}
             */
            soundUseStatus(row, column){
                return common.soundUseStatus(row.useFlag);
            },
        },
        destroyed(){
            // bus.$emit('contentTop', false);
        },
        watch:{
            videoVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            }
        }
    }

</script>

<style scoped lang="less">
    .sound-page{
        .el-card__body{
            padding: 0;
        }
        .sound-body{
            margin: 0 auto;
        }
        .sound-top{
            margin-bottom:20px;
        }
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .sound_top_btn_del{
        float:right;
    }
    .upload-btn-sound{
        position: relative;
        .el-input{
            position: absolute;
            left: 0;
            width: 100%;
            top: 0;
            height:100%;
            opacity: 0;
            filter: alpha(opacity=0);
        }
    }
    .crumbs{
        display: inline;
        float: left;
        margin-top: 0;
        .link{
            color: #4E8FF9;
        }
    }
    .sound-table {
        .icon-icon_play{
            float: left;
            cursor: pointer;
            color: #4E8FF9;
        }
    }
    #file,
    #importFile{
        position:absolute;
        width: 100%;
        height: 100%;
        left:0;
        top:0;
        opacity: 0;
    }
    .video-edit-box{
        .icon-icon_play{
            // margin-top:4px;
        }
        .el-textarea {
            width:auto;
            margin-left:28px;
            // margin-top: -5px;
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
    .menu-parent{
        height: 48px;
        line-height: 48px;
        padding: 0 0 0 30px;
        &.active{
            background-color: #F7F8FB;
            border-left: 4px solid #4E8FF9;
        }
    }
    .repository-menu-item{
        padding-left: 40px;
    }
</style>
