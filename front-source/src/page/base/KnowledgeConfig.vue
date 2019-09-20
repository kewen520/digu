<template>
    <div>
        <div class="content-box-top">
            <el-input v-model="queryKey" clearable placeholder="筛选关键词"  @change="searchChange" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
        </div>
        <div slot="header" class="clearfix knowledge-header">
            <a @click="goBack1" class="link"><i class="el-icon-arrow-left"></i>返回知识库列表</a>
            <div class="right-menu-box">
                <div class="right-menu-item">
                    <el-button type="primary" icon="iconfont icon-icon_rep_search" @click="publishKnowledgeGroup">&nbsp;发布</el-button>
                </div>
                <div class="right-menu-item">
                    <el-button
                    type="primary"
                    icon="iconfont icon-icon_rep_search"
                    @click="soundMatchVisible = true"
                    >&nbsp;匹配音频</el-button>
                </div>
                 <div class="right-menu-item">
                    <el-button
                    type="primary"
                    icon="iconfont icon-icon_rep_search"
                    @click="editSigleKnowledgeData(null)"
                    >&nbsp;新增问答</el-button>
                </div>
                <el-dropdown @command="handleDropdown">
                    <el-button type="primary">
                    <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="upload">批量上传问答</el-dropdown-item>
                    <el-dropdown-item command="export">批量导出问答</el-dropdown-item>
                    <el-dropdown-item command="delete">批量删除问答</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div class="sort">
            <el-checkbox v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <el-select v-model="sortMethodResult" placeholder="排序方式" @change="sortAction">
                <el-option
                        v-for="item in sortMethod"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                ></el-option>
            </el-select>
        </div>
        <div class="config-card-list">
            <el-checkbox-group v-model="multipleSelection">
                <div class="config-card" v-for="(knowledge,index) in knowledgeData" :key="index">
                    <div class="config-card-row">
                        <el-checkbox class="card-checkbox" :label="knowledge.id">
                             <div class="question-title">主问题</div>
                        </el-checkbox>
                        <div class="question-content">{{knowledge.questionContent}}</div>
                        <div class="right-edit-box">
                            <span class="w_icon_pen" @click="editSigleKnowledgeData(knowledge)"></span>
                            <span class="w_icon_trash" @click="handleDelItems(knowledge.id)"></span>
                        </div>
                    </div>
                    <div class="config-card-row">
                        <div class="question-title">相似问题</div>
                        <div class="question-content question-similer" v-for="(similer,index) in knowledge.questionContentOther.filter(o => o.value)" :key="index">
                            <el-tag>{{similer.value}}</el-tag>
                        </div>
                    </div>
                    <div class="config-card-row">
                        <div class="question-title" style="padding-top: 10px">回答内容</div>
                        <div class="question-content">
                            <el-tabs value="name1">
                                <el-tab-pane :label="index | formatLabel" :name="index | formatName" v-for="(content,index) in knowledge.answerContent" :key="index">
                                    <div class="answer-content">
                                        <i v-show="content.soundPath" class="iconfont icon-icon_play" @click="handleVideo(content)"></i>
                                        <!-- <div class="w_icon_play w_icon_pause"></div> -->
                                        <div class="answer-content-text">{{content.text}}</div>
                                    </div>
                                </el-tab-pane>
                                <!-- <el-tab-pane label="配置管理" name="second">
                                    <div class="answer-content">
                                        <span class="w_icon_play w_icon_pause"></span>
                                        <div class="answer-content-text">配置管理配置管理配置管理</div>
                                    </div>
                                </el-tab-pane> -->
                            </el-tabs>
                        </div>
                    </div>
                    <div class="config-card-row">
                        <div class="question-title">关键词</div>
                        <div class="question-keywords" v-for="keyWord in knowledge.keyWords" :key="keyWord">
                        <el-tag type="info">{{keyWord}}</el-tag>
                        </div>
                    </div>
                    <div class="config-card-footer">
                        <span class="primary-tag">已发布</span>
                        <span class="primary-tag">更新时间{{knowledge.editTime}}</span>
                        <span class="primary-tag">操作人: {{knowledge.editor}}</span>
                    </div>
                </div>
            </el-checkbox-group>
        </div>
        <!-- <el-card class="box-card repository-card">
            <div slot="header" class="clearfix">
                <div slot="header" class="clearfix">
                    <span>{{setknowledge}}</span>
                </div>
                <div class="repository-box-right-icon-box">

                    <el-tooltip content="导出" placement="top" effect="light">
                        <el-button icon="iconfont icon-icon_download" :disabled="!multipleSelection.length"></el-button>
                    </el-tooltip>
                    <el-tooltip content="移动" placement="top" effect="light">
                        <span class="repository-btn-move">
                            <el-button icon="iconfont icon-icon_move" :disabled="!multipleSelection.length"></el-button> -->
                            <!-- <i class="iconfont icon-icon_move blue"></i> -->
                            <!-- <el-cascader
                                v-show="multipleSelection.length"
                                :options="moveTypeOptions"
                                @active-item-change="handleMoveItemChange"
                                @change = "moveTypeChange"
                                :props="moveTypeProps"
                                :show-all-levels="false">
                            </el-cascader>
                        </span>
                    </el-tooltip>

                    <el-tooltip content="删除" placement="top" effect="light">
                        <el-button icon="iconfont icon-ico_delete" :disabled="!multipleSelection.length" @click="handleDelItems"></el-button> -->
                        <!-- <i class="iconfont icon-ico_delete blue" @click="handleDelItems" v-if="multipleSelection.length"></i> -->
                        <!-- <i class="iconfont icon-ico_delete" v-else></i> -->
                    <!-- </el-tooltip>
                    <i class="line"></i>
                    <el-tooltip content="新增" placement="top" effect="light">
                        <el-button icon="iconfont icon-icon_rep_add" @click="handleCreatFAQV"></el-button> -->
                        <!-- <i class="iconfont icon-icon_rep_add" @click="handleCreatFAQV"></i> -->
                    <!-- </el-tooltip>
                    <el-tooltip content="匹配音频" placement="top" effect="light">
                        <el-button icon="iconfont icon-icon_rep_search"></el-button> -->
                        <!-- <i class="iconfont icon-icon_rep_search"></i> -->
                    <!-- </el-tooltip>
                    <el-tooltip content="发布" placement="top" effect="light">
                        <el-button icon="iconfont icon-icon_publish" :disabled="!publishStatus" @click="publishKnowledgeGroup"></el-button> -->
                        <!-- <i class="iconfont icon-icon_publish" :class="{'is-disabled':!publishStatus}" @click="publishKnowledgeGroup"></i> -->
                    <!-- </el-tooltip>
                </div>
            </div> -->

            <!-- <div class="repository-box">
                <el-table
                stripe
                :data="knowledgeData"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
                :row-class-name="tableRowClassName"
                :height="tableHeight">
                    <el-table-column
                    type="selection"
                    class="isEdit"
                    width="55">
                    </el-table-column>
                    <el-table-column
                        prop="questionContent"
                        label="主问题">
                    </el-table-column>
                    <el-table-column
                        prop="answerContent"
                        label="回答">
                    </el-table-column>
                    <el-table-column
                        width="140"
                        sortable
                        prop="editTime"
                        label="更新时间">
                    </el-table-column>
                    <el-table-column
                        width="100"
                        sortable
                        prop="editor"
                        label="操作人">
                    </el-table-column>
                    <el-table-column
                        width="60"
                        label="音频">
                        <template slot-scope="scope">
                            <span class="w_icon_play w_icon_pause" v-show="scope.row.soundPath" @click="handleVideo(scope.row)"></span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="140" align="center">
                        <template slot-scope="scope"> -->
                            <!-- <div v-show="!scope.row.isEdit || scope.row.isEdit=='0'">
                                <el-button type="text" @click="handleEdit(scope.row.id)">编辑</el-button>
                                <el-button type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                            </div> -->
                       <!-- </template>
                    </el-table-column>
                </el-table>
            </div>-->
        <!-- </el-card> -->
        <div class="pagination">
            <el-pagination background @current-change="handleCurrentChange"
                layout="total, prev, pager, next,jumper"
                :total="pagination.total"
                :page-size="pagination.pageSize"
                >
            </el-pagination>
        </div>
        <!-- 删除 -->
        <el-dialog title="删除问答" :visible.sync="delItemsVisible" width="400px">
            <div >您确定要删除已选择的知识库吗？如果知识库正在使用中，删除后将不能在已关联的话术中正常使用。</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeKnowledgeItemList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 移动 -->
        <el-dialog title="移动问答" :visible.sync="moveItemsVisible" width="400px">
            <div >您确定要移动已选中的{{moveItemLength}}条问答对到“{{moveItemName}}”吗？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="moveItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="moveKnowledgeItem">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新建问答 -->
        <el-dialog title="新增问答" class="creat-faq-dialog" :visible.sync="creatFAQVisible" :append-to-body="true" width="800px">
            <div>
                <el-tabs v-model="activeName" >
                    <el-tab-pane label="手动输入" name="first">
                        <el-form :model="creatFAQVForm" :rules="creatFAQVRules" ref="creatFAQVForm" label-width="100px" class="demo-ruleForm">
                            <el-form-item label="主问题" prop="questionContent">
                                <el-input v-model="creatFAQVForm.questionContent" placeholder="输入主问题"></el-input>
                            </el-form-item>
                            <el-form-item
                                v-for="(item,index) in creatFAQVForm.questionContentOther"
                                :label="item.name"
                                :key="`问题${index}`">
                                <el-input v-model="item.value" placeholder="输入相似问题"></el-input>
                                <el-button v-if="index==0" icon="el-icon-plus" @click.prevent="addQuestion(item)"></el-button>
                                <el-button v-if="index>0" icon="el-icon-minus" @click.prevent="removeQuestion(item)"></el-button>
                            </el-form-item>
                                <el-row>
                                    <el-col :span="2" class="row-left">
                                        <span
                                        @click="tabAnswer(item,index)"
                                        :class="{'active':currentIndex==index}"
                                        v-for="(item,index) in creatFAQVForm.answerContent"
                                        :key="index">
                                            {{`回答${index+1}`}}
                                        </span>
                                    </el-col>
                                    <el-col :span="18" class="row-center">
                                        <el-input type="textarea" v-model="creatFAQVForm.answerContent[currentIndex].value" placeholder="输入回答内容" ></el-input>
                                        <div class="answer-bottom">
                                            您可以<span @click="handleUseAudio">使用音频</span>或
                                            <span class="btnUpload">上传音频<input type="file" multiple="multiple" class="importFile"  @change="uploadAnnexFileOfInfo()" ></span>
                                            <span class="play-btn" v-show="creatFAQVForm.answerContent[currentIndex].soundPath">
                                                <i class="iconfont icon-icon_play" @click="handleVideoAnswer()"></i>
                                                <span>{{creatFAQVForm.answerContent[currentIndex].fileName}}</span>
                                                <span @click="handleCancelPlay()">取消</span>
                                            </span>
                                        </div>
                                    </el-col>
                                    <el-col :span="2">
                                        <el-button icon="el-icon-plus" @click.prevent="addAnswer()"></el-button>
                                    </el-col>
                                </el-row>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="批量上传" name="second">
                        <div class="faqUpload">
                            <el-form :model="atchKnow" :rules="atchKnowRules" ref="atchKnow" label-width="100px" class="demo-ruleForm">
                                <div><span class="red">*</span>第一步：请下载用于填写知识问答的Excel模版文件</div>
                                <div class="updload-list-box">
                                    <el-button  @click="downloadExcelTemplate">下载模版</el-button>
                                </div>
                                <div>
                                    <span class="red">*</span>
                                    第二步：请上传已填写完成的Excel文件（建议最多不超过1000行）
                                    <el-popover
                                        placement="bottom"
                                        width="200"
                                        trigger="hover"
                                        content="填写规范：仅支持Excel文件，多个相似问题或者回答用*|*隔开，可以省略分类，问题[TAB]相似问题[TAB]回答内容<分类>">
                                        <i class="el-icon-question" slot="reference"></i>
                                    </el-popover>
                                </div>

                                <div class="updload-list-box">
                                    <el-button class="file-btn" v-show="!atchKnow.errorMessage">
                                        <el-input multiple="multiple"  v-model="atchKnow.filePath" type="file" id="file" @change="uploadAnnexFile('file')"></el-input>
                                        上传
                                    </el-button>
                                    <span class="blue">{{atchKnow.excelPathTip}}</span>
                                    <span class="red" >{{atchKnow.errorMessage}}</span>
                                </div>
                                <div v-for="(item,index) in correctArry" :key="index" v-show="item.nextUpload">
                                    <div>上传失败的问答数据已生成新的Excel文件，<a :href="item.errorFilePath">点击下载</a>后重新上传</div>
                                    <div class="updload-list-box" >
                                        <el-button class="file-btn" v-show="!item.errorMessage">
                                        <el-input multiple="multiple" v-model="item.filePath" type="file" :id="item.id" @change="uploadAnnexFile(item.id)"></el-input>
                                            上传
                                        </el-button>
                                        <span class="blue">{{item.excelPathTip}}</span>
                                        <span class="red" >{{item.errorMessage}}</span>
                                    </div>
                                </div>
                            </el-form>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="creatFAQVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAddItems">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 音频 -->
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
        <!-- 试听 -->
        <el-dialog :visible.sync="visibleSound" :fullscreen="true" :show-close="false" class="sound-dialog">
            <w-sound :from="pageFrom"/>
        </el-dialog>
        <!-- <div class="sound-content" v-show="visibleSound"> -->
            <!-- <w-sound :from="pageFrom"/> -->
        <!-- </div> -->
        <el-drawer title="编辑回答" :visible.sync="showDrawer" @close="closeEdit">
            <el-scrollbar
                    class="drawer-form-scroll"
                    wrapClass="drawer-form-scroll-warp"
                    :native="false"
                    :noresize="false"
            >
                <el-form :model="sigleKnowledgeData" :ref="sigleKnowledgeData" :rules="sigleKnowledgeDataRules">
                    <el-form-item label="主问题">
                        <el-input v-model="sigleKnowledgeData.questionContent"></el-input>
                    </el-form-item>
                    <el-form-item class="similer-question" label="相似问题" v-if="sigleKnowledgeData.questionContentOther">
                        <i class="iconfont icon-ico_add" style="color: #4E8FF9;" @click="addSimilerQuestion"></i>
                        <div class="similer-input" v-for="(item, index) in sigleKnowledgeData.questionContentOther" :key="index" >
                            <el-input v-model="item.value"></el-input>
                            <span v-if="index !== 0" class="w_icon_trash"  @click="deleteSimilerQuestion(index)"></span>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <div>回答问题</div>
                        <div class="question-content">
                            <el-tabs :value="editableTabsValue" type="card" @tab-click="tabClick" editable @edit="handleTabsEdit">
                                <el-tab-pane
                                        :label="index | formatLabel"
                                        :name="index | formatName"
                                        v-for="(item, index) in sigleKnowledgeData.editableTabs"
                                        :key="index"
                                >
                                    <!-- <div class="answer-content">
                                        <el-input type="textarea" @change="handleWords" placeholder="输入回答内容" class="answer-content-text">用户管理用户管理用户管理用户管理用户管理</el-input>
                                    </div> -->
                                    <div class="rep-edit-top">
                                    您可以<span class="link" @click="handleUseAudio(index)">使用音频</span>（使用后将自动填充对应文本)
                                    <div class="canel-box">
                                        <div v-show="item.soundPath">
                                            <i class="iconfont icon-icon_play" @click="handleVideo(item)"></i>
                                            <span>{{item.fileName}}</span>
                                            <a @click="handleCancelPlay(item,index)">取消</a>
                                        </div>
                                    </div>
                                        <textarea :disabled="!!item.soundPath" v-model="item.answerContent" class="w_textarea"></textarea>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </el-form-item>
                     <el-form-item label="关键词" class="form-item-keywords">
                         <div class="keywords">
                            <el-tag
                                :key="tag"
                                v-for="tag in sigleKnowledgeData.keyWords"
                                closable
                                :disable-transitions="false"
                                @close="handleCloseKeyword(tag)">
                                {{tag}}
                            </el-tag>
                            <el-input
                                class="input-new-tag"
                                v-if="inputVisible"
                                v-model="inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm"
                                @blur="handleInputConfirm"
                            >
                            </el-input>
                            <!-- <textarea  class="w_textarea" placeholder='关键词之间请按"enter"隔开'> -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput">+</el-button>
                            <!-- </textarea> -->
                         </div>
                     </el-form-item>
                     <div class="drawer-footer">
                        <el-button @click="showDrawer = false">取 消</el-button>
                        <el-button type="primary" @click="modifyKnowledgeItem">保 存</el-button>
                    </div>
                </el-form>
            </el-scrollbar>
        </el-drawer>
        <el-drawer class="batch-drawer" title="批量上传问答" :visible.sync="showBatchFiles">
            <BatchFiles @uploadSuccess="uploadSuccess" @closeDrawer="showBatchFiles = false"></BatchFiles>
        </el-drawer>
        <el-dialog
            :title="dialogTitle"
            :visible.sync="dialogVisible"
            width="30%">
            <span>{{dialogMessage}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <AudioMatchModal
                :visible.sync="soundMatchVisible"
                :groupId="groupId"
                @queryKnowledgeItemList="queryKnowledgeItemList()"
        ></AudioMatchModal>
    </div>
</template>

<script>
    import bus from '../../common/bus';
    import wVideo from '../base/Video';
    import wSound from '../Sound';
    import BatchFiles from './BatchFiles.vue';
    import AudioMatchModal from './AudioMatchModal';

    const initSigleKnowledgeData = {
        id: '',
        questionContent: '',
        questionContentOther: [
            {
                value: ''
            }
        ],
        editableTabs: [{
            title: `回答1`,
            name: '1',
            answerContent: '',
            fileName:'',
        }],
        keyWords: [],
    };
    export default {
        name: 'KnowledgeConfig',
        // props:['searchType','queryKey','knowledgeCurrent','knowledge'],
        data() {
            return {
                checkAll: false,
                soundMatchVisible: false,
                tableHeight:200,
                // groupId:'',
                knowledgeData:[],
                sigleKnowledgeData: {
                    id: '',
                    questionContent: '',
                    questionContentOther: [
                        {
                            value: ''
                        }
                    ],
                    editableTabs: [{
                        title: `回答1`,
                        name: '1',
                        answerContent: '',
                        fileName:'',
                        soundPath:'',
                        soundDuration:'',
                        soundSize:'',
                    }],
                    keyWords: [],
                },
                // knowledge:[],
                cur_page:1,
                queryKey:'',
                moveRepositoryMenu:[],
                multipleSelection:[],
                delItemsVisible:false,
                creatFAQVisible:false,
                activeName:'first',
                publishStatus:true,
                creatFAQVForm:{
                    questionContent:'',
                    questionContentOther: [{
                        name:'相似问题',
                        value: ''
                    }],
                    creatFAQOptions:[],
                    answerContent:[{
                        name:'回答',
                        value: '',
                        soundPath:'',
                        soundDuration:'',
                        soundSize:''
                    }],
                },
                creatFAQVRules: {
                    questionContent: [
                        { required: true, message: '请输入主问题', trigger: 'blur' }
                    ],
                    // answerContent: [
                    //     { required: true, message: '请输入回答内容', trigger: 'blur' }
                    // ]
                },
                isNewFile:false,
                atchKnow:{
                    excelPathTip:'',
                    errorMessage:'',
                    excelPath:'',
                    filePath:'',
                    filePathNew:'',
                    excelPathTipNew:'',
                    excelPathNew:'',
                },

                upload_img_index:-1,
                correctArry:[],
                atchKnowRules:{
                    filePath:[
                        { required: true, message: '请上传知识问答Excel数据！', trigger: 'change' }
                    ]
                },
                moveTypeOptions:[],
                moveTypeProps: {
                    value: 'id',
                    label:'name',
                    children: 'children'
                },
                moveItemsVisible:false,
                moveItemLength:0,
                moveItemName:'',
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                videoVisible:false,
                viewSource:'',
                viewPlaying:false,
                knowledgeCurrentData:[],
                currentIndex:0,
                visibleSound:false,
                pageFrom:'',
                showDrawer: false,
                sigleKnowledgeDataRules: {
                    questionContent: { required: true, message: '请输入主问题', trigger: 'blur' },
                },
                editableTabsValue: 'name1',
                inputVisible: false,
                inputValue: '',
                dialogVisible: false,
                dialogMessage: '',
                dialogTitle: '提示',
                showBatchFiles: false,
                sortMethod: [
                    {
                        label: '更新时间顺序排序',
                        value: 'timeAsc',
                    },
                    {
                        label: '更新时间倒序排序',
                        value: 'timeDesc',
                    },
                    {
                        label: '操作人排序',
                        value: 'operator'
                    },
                ],
                sortMethodResult: '',
                isAddForm: false,
            }
        },
        created() {
            // 计算table 高度
            var clintHeight = document.documentElement.clientHeight;
            // this.height = clintHeight - 240;
            this.tableHeight =clintHeight - 290
            // 距离头部
            bus.$emit('contentTop',true);
            bus.$on('closeSound',msg=>{
                if(msg){
                    this.visibleSound = false;
                }
            });

            bus.$on('fileName',msg=>{
                if(msg){
                    this.creatFAQVForm.answerContent[this.currentIndex]['soundPath'] = msg.soundPath;
                    this.creatFAQVForm.answerContent[this.currentIndex]['soundDuration'] = msg.soundDuration;
                    this.creatFAQVForm.answerContent[this.currentIndex]['soundSize'] = msg.soundSize;
                    this.creatFAQVForm.answerContent[this.currentIndex]['value'] = msg.soundContent;
                    this.creatFAQVForm.answerContent[this.currentIndex]['fileName'] = msg.fileName;
                    this.creatFAQVForm.answerContent[this.currentIndex]['answerContent'] = msg.soundContent;
                }
            });

            bus.$on('fileName',msg=>{
                if(msg){
                    this.sigleKnowledgeData.editableTabs[this.currentIndex]['soundPath'] = msg.soundPath;
                    this.sigleKnowledgeData.editableTabs[this.currentIndex]['soundDuration'] = msg.soundDuration;
                    this.sigleKnowledgeData.editableTabs[this.currentIndex]['soundSize'] = msg.soundSize;
                    this.sigleKnowledgeData.editableTabs[this.currentIndex]['value'] = msg.soundContent;
                    this.sigleKnowledgeData.editableTabs[this.currentIndex]['fileName'] = msg.fileName;
                    this.sigleKnowledgeData.editableTabs[this.currentIndex]['answerContent'] = msg.soundContent;
                }
            });

            this.groupId = this.$route.params.id;
            this.setknowledge = this.$store.getters.getknowledge;

            if(this.$store.getters.getKnowledgeData){
                this.knowledgeCurrentData = this.$store.getters.getKnowledgeData;
            }

            this.queryKnowledgeItemList();
            this.formatKnowledgeMoveData();
        },
        components: {
            wVideo,
            wSound,
            BatchFiles,
            AudioMatchModal,
        },
        computed: {
        },
        filters: {
            formatLabel(index) {
                return '回答' + (index + 1);
            },
            formatName(index) {
                return 'name' + (index + 1);
            },
        },
        methods: {
            handleCheckAllChange(val) {
                if (val) {
                    this.multipleSelection = this.knowledgeData.map(item => item.id);
                } else {
                    this.multipleSelection = [];
                }
            },
            uploadSuccess(){
                this.showBatchFiles = false;
                this.queryKnowledgeItemList();
            },
            sortAction(sort){
                if (sort === 'timeAsc') {
                    this.knowledgeData.sort((a, b) => {
                        return (
                            a.editTime
                            .replace(/-/g, '')
                            .replace(/:/g, '')
                            .replace(' ', '') -
                            b.editTime
                            .replace(/-/g, '')
                            .replace(/:/g, '')
                            .replace(' ', '')
                        );
                    });
                } else if(sort === 'timeDesc'){
                    this.knowledgeData.sort((a, b) => {
                        return (
                            b.editTime
                            .replace(/-/g, '')
                            .replace(/:/g, '')
                            .replace(' ', '') -
                            a.editTime
                            .replace(/-/g, '')
                            .replace(/:/g, '')
                            .replace(' ', '')
                        );
                    });
                }
            },
            closeEdit() {
                this.isAddForm = false;
            },
            handleDropdown(command) {
                switch(command) {
                    case 'upload':
                        this.showBatchFiles = true;
                        break;
                    case 'delete':
                        this.handleDelItems();
                        break;
                }
            },
            /**
             * 关键词input
             */
            showInput() {
                this.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            /**
             * 关键词编辑
             */
            handleInputConfirm() {
                let inputValue = this.inputValue;
                if (inputValue) {
                    if(this.sigleKnowledgeData.keyWords.includes(inputValue)) {
                        this.dialogTitle = '关键词冲突提示';
                        this.dialogMessage = '该关键词已存在';
                        this.dialogVisible = true;
                        return;
                    }
                    this.sigleKnowledgeData.keyWords.push(inputValue);
                }
                this.inputVisible = false;
                this.inputValue = '';
            },
            /**
             * 关闭关键词tag
             */
            handleCloseKeyword(tag) {
                this.sigleKnowledgeData.keyWords.splice(this.sigleKnowledgeData.keyWords.indexOf(tag), 1);
            },
            // 修改知识库
			modifyKnowledgeItem() {
				let flag = true;
				if (!this.sigleKnowledgeData.questionContent) {
					this.$message.error('请添加主问题！');
					return false;
				}
				if (!this.sigleKnowledgeData.questionContentOther.length) {
					this.$message.error('请添加相似问题！');
					return false;
				}
				if (!this.sigleKnowledgeData.editableTabs.map(item => item.answerContent).join().trim()) {
					this.$message.error('请添加回答！');
					return false;
				}

				let questionContentOther = [];
				this.sigleKnowledgeData.questionContentOther.forEach(el => {
					questionContentOther.push(el.value);
				});

				let answerContent = this.sigleKnowledgeData.editableTabs.map((item) => {
					if (item.answerContent) {
						return {
							text: item.answerContent,
							soundPath: item.soundPath || '',
							soundDuration: item.soundDuration || '',
							soundSize: item.soundSize || '',
						}
					} else {
						flag = false;
						this.$message.error('答案内容不能为空！');
						return false;
					};
				});

				if (flag) {
					let baseData = {
						questionContent: this.sigleKnowledgeData.questionContent,
						questionContentOther: JSON.stringify(this.sigleKnowledgeData.questionContentOther.map(v => v.value).filter(o => o)),
                        answerContent: JSON.stringify(answerContent),
                        keyWords: this.sigleKnowledgeData.keyWords ? this.sigleKnowledgeData.keyWords.join('|') : ''
                    };

                    // 是新增问答
                    if(this.isAddForm) {
                        const addData = { ...baseData, groupId: this.groupId }
                        this.addKnowledge(addData);
                        return;
                    }

                    const data = { ...baseData,  id: this.sigleKnowledgeData.id };
					$.post(this.$baseUrl + 'knowledge/modifyKnowledgeItem.json', JSON.stringify(data)).then((res) => {
						if (res.resultMessageEnum == '0000') {
							this.$message.success('保存成功！');
                            this.showDrawer = false;
                            this.queryKnowledgeItemList();
						} else {
							this.$message.error(res.errorInfoList[0].errorMessage);
						}
					})
				};
            },
            /**
             * 新增问答
             */
            addKnowledge(addData){
                $.post(this.$baseUrl+'knowledge/addKnowledgeItem.json',JSON.stringify(addData)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('新增成功');
                        this.showDrawer = false;
                        this.queryKnowledgeItemList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 新增/编辑问答抽屉“回答问题”
             */
            handleTabsEdit(targetName, action) {
				if (action === 'add') {
					let newTabName = 'name' + (this.sigleKnowledgeData.editableTabs.length + 1);
                    this.creatFAQVForm.answerContent.push({
                        soundPath: '',
                        soundDuration: '',
                        soundSize: '',
                        value: '',
                        fileName: '',
                        answerContent: '',
                    });

					this.sigleKnowledgeData.editableTabs.push({
						title: '回答' + newTabName,
						name: newTabName,
						content: ''
					});
                    this.currentIndex = this.sigleKnowledgeData.editableTabs.length - 1;
					this.editableTabsValue = newTabName;
				}

				if (action === 'remove') {
					if (this.sigleKnowledgeData.editableTabs.length < 2) {
						return;
                    }

                    const index = targetName.replace(/[^\d]/g, '') - 1;
                    this.sigleKnowledgeData.editableTabs.splice(index, 1);
                    this.creatFAQVForm.answerContent.splice(index, 1);
                    this.currentIndex = this.sigleKnowledgeData.editableTabs.length - 1;
					this.editableTabsValue = 'name' + this.sigleKnowledgeData.editableTabs.length;
				}
			},
            handleWords() {

            },
            addSimilerQuestion() {
                this.sigleKnowledgeData.questionContentOther.push({
                    value: ''
                })
            },
            deleteSimilerQuestion(index) {
                this.sigleKnowledgeData.questionContentOther.splice(index, 1);
            },
            /**
             * 编辑/新增问答
             */
            editSigleKnowledgeData(knowledge) {
                if(knowledge) {
                    // 是编辑问答
                    this.sigleKnowledgeData = JSON.parse(
                        JSON.stringify({
                            ...this.sigleKnowledgeData,
                            ...knowledge,
                            editableTabs: knowledge.answerContent.map((v, i) => {
                                return {
                                    title: `回答${i}`,
                                    name: i.toString(),
                                    answerContent: v.text,
                                    fileName:'',
                                    soundPath: v.soundPath,
                                    soundDuration:v.soundDuration,
                                    soundSize: v.soundSize,
                                }
                            })
                        })
                    );
                } else {
                    // 是新增问答
                    this.sigleKnowledgeData = JSON.parse(JSON.stringify(initSigleKnowledgeData));
                    this.isAddForm = true;
                }
                this.showDrawer = true;
            },
            handleUseAudio(editTabIndex){
                this.currentIndex = editTabIndex;
                this.pageFrom = 'knowledgeConfig';
                this.visibleSound = true;
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryKnowledgeItemList();
            },
            // 确定删除多个列表
            handleDelItems(id){
                // 删除单个
                if(id) {
                    this.multipleSelection = [id];
                    this.delItemsVisible = true;
                }else if(this.multipleSelection.length){
                    this.delItemsVisible = true;
                }else{
                    this.$message.error('请选择要删除的问答!');
                }
            },
            goBack1(){
                this.$router.go(-1);
                // bus.$emit('contentTop',true);
                // bus.$emit('knowledgeSteps',1);
            },
            search() {
                this.cur_page=1;
                this.pagination.total = 0;
                this.queryKnowledgeItemList();
            },
            searchChange(val){
                if(!val){
                    this.queryKnowledgeItemList();
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
                this.queryKnowledgeItemList();
            },
            handleCommand(){

            },
            handleVideo(item){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =item.soundPath;
                })
            },
            handleVideoAnswer(){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =this.creatFAQVForm.answerContent[this.currentIndex].soundPath;
                })
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            handleDelete(index,row){
                this.delItemsVisible = true;
                this.deleId = row.id;
            },
            handleCreatFAQV(){

                this.creatFAQVisible = true;
                this.creatFAQVForm.creatFAQOptions = this.repositoryMenu;

            },
            handleMoveItemChange(val){

                let obj = this.knowledgeCurrentData.find((res)=>{
                    return val==res.id
                })

                this.queryKnowledgeGroupListOfPage(obj.id).then((res)=>{
                    if(res){
                        let newRes = res.map((a,i)=>{
                            return {label:a.groupName,value:a.id};
                        })
                        this.knowledgeItemListData = res;
                        this.moveTypeOptions.forEach((item,index)=>{
                            if(obj.id == item.id){
                                item.children = newRes;
                            }
                        })
                    }
                })
            },
            moveTypeChange(val){

                if(this.multipleSelection.length){
                    let obj = this.knowledgeItemListData.find((res)=>{
                        return val[1]==res.id
                    });

                    this.newGroupId = obj.id;

                    this.moveItemsVisible = true;
                    this.moveItemLength = this.multipleSelection.length;
                    this.moveItemName = obj && obj.groupName;

                    let data = [];
                    this.knowledgeItemIdList = this.multipleSelection.map(el=>{
                        return el.id;
                    })

                }else{
                    this.$message.error('请选择要移动的问答!');
                }
            },
            tabAnswer(item, index){
                this.currentIndex = index;
            },
            tabClick(instance, event) {
                const child = event.target;
                const parent = child.parentNode;
                this.currentIndex = Array.prototype.indexOf.call(parent.childNodes, child);
            },
            handleCancelPlay() {
                this.sigleKnowledgeData.editableTabs[this.currentIndex].soundPath='';
                this.sigleKnowledgeData.editableTabs[this.currentIndex].soundDuration='';
                this.sigleKnowledgeData.editableTabs[this.currentIndex].soundSize='';
                this.sigleKnowledgeData.editableTabs[this.currentIndex].answerContent = '';
                this.creatFAQVForm.answerContent[this.currentIndex].soundPath='';
                this.creatFAQVForm.answerContent[this.currentIndex].soundDuration='';
                this.creatFAQVForm.answerContent[this.currentIndex].soundSize='';
                this.creatFAQVForm.answerContent[this.currentIndex].answerContent = '';
            },
            // 添加相似问答
            addQuestion(){
                let item = {
                        name:'',
                        value:''
                    };
                if(this.creatFAQVForm.questionContentOther.length<2){
                    this.creatFAQVForm.questionContentOther.push(item);
                }else{
                    this.creatFAQVForm.questionContentOther.splice(1,0,item)
                }
            },
            addAnswer(){
                let item = {
                        name:'回答',
                        value: '',
                        soundPath:'',
                        soundDuration:'',
                        soundSize:''
                    };
                this.creatFAQVForm.answerContent.push(item);
                this.tabAnswer(item,this.currentIndex+1);

            },
            // 删除相思问答
            removeQuestion(item){
                var index = this.creatFAQVForm.questionContentOther.indexOf(item)
                if (index !== -1) {
                    this.creatFAQVForm.questionContentOther.splice(index, 1)
                }
            },
            formatKnowledgeMoveData(){
                this.knowledgeCurrentData.forEach((item,index)=>{
                    let list = {};
                    list.children=[];
                    list.name = item.typeName;
                    list.id = item.id;
                    this.moveTypeOptions.push(list)
                });

            },
            // 新增问答
            handleAddItems(formName){
                if(this.activeName=='first'){
                    this.$refs['creatFAQVForm'].validate((valid) => {
                        if (valid) {
                            this.addKnowledgeItem();
                        } else {
                            console.log('error submit!!');
                            return false;
                        }
                    });
                }else{
                    this.saveBatchKnowledgeItem('atchKnow');
                }
            },
            handleEdit(id){
                this.$router.push('/repository/edit/'+id);
            },
            // 移动知识库明细
            moveKnowledgeItem(){
                let params={
                    newGroupId:this.newGroupId,
                    knowledgeItemIdList:this.knowledgeItemIdList
                }
                $.post(this.$baseUrl+'knowledge/moveKnowledgeItem.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.moveItemsVisible = false;
                        this.queryKnowledgeItemList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 下载Excel模版
            downloadExcelTemplate(){
                window.location.href= this.$baseUrl+'common/downloadExcelTemplate.html?excelTemplateType=2';
            },
            // 新增知识库明细
            addKnowledgeItem(){
                let flag = true;
                let questionContentOther = [];
                this.creatFAQVForm.questionContentOther.forEach((item)=>{
                    questionContentOther.push(item.value);
                });
                let answerContents=[];

                this.creatFAQVForm.answerContent.forEach((item)=>{
                    if (item.value){
                        answerContents.push({
                            text:item.value,
                            soundPath:item.soundPath,
                            soundDuration:item.soundDuration,
                            soundSize:item.soundSize
                        })
                    } else {
                        flag = false;
                        this.$message.error('答案内容不能为空！');
                        return false;
                    };
                });
                if (flag) {
                    let data={
                        questionContent:this.creatFAQVForm.questionContent,
                        groupId:this.groupId,
                        questionContentOther:JSON.stringify(questionContentOther),
                        answerContent:JSON.stringify(answerContents)
                    }

                    $.post(this.$baseUrl+'knowledge/addKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            this.creatFAQVisible = false;
                            this.queryKnowledgeItemList();
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                };
            },
            tableRowClassName({row,rowIndex}){
                if(row.isEdit && row.isEdit*1>0){
                    return 'row-not-edit';
                }
            },
            //知识库发布
            publishKnowledgeGroup(e){
                if(e.target.className.indexOf('is-disabled')>-1){
                    return;
                }
                $.post(this.$baseUrl+'knowledge/publishKnowledgeGroup.json?groupId='+this.groupId).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.publishStatus = false;
                        this.$message.success('发布成功');

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            queryKnowledgeGroupListOfPage(id){
                return new Promise((resolve,reject)=>{
                    let params={
                        searchType:2,
                        typeId:id
                    }
                    $.post(this.$baseUrl+'knowledge/queryKnowledgeGroupListOfPage.json',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            let data = res.returnObject && res.returnObject.recordList;
                            if(data){
                                resolve(data)
                            }
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                        resolve()
                    })
                })
            },
            //查询知识库明细列表
            queryKnowledgeItemList(){
                let params={
                    groupId:this.groupId,
                    searchType:2,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }


                let queryKey = this.queryKey;
                if(queryKey){
                    params.queryKey=queryKey;
                }
                if(this.sortList){
                    params.sortList =this.sortList;
                }

                $.post(this.$baseUrl+'knowledge/queryKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject && res.returnObject.recordList;
                        if(data){
                            data.forEach((item,index)=>{
                                item.answerContent = JSON.parse(item.answerContent);
                                item.questionContentOther = JSON.parse(item.questionContentOther).map(item => {
                                    return { value: item }
                                })
                                if (item.questionContentOther.length === 0) {
                                    item.questionContentOther = [{
                                        name:'相似问题',
                                        value: ''
                                    }];
                                }

                                // if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                //     answerContent.forEach((list,num)=>{
                                //         let newList = {
                                //             questionContent:num==0?item.questionContent:'',
                                //             answerContent:list.text,
                                //             editTime:num==0?item.editTime:'',
                                //             editor: num==0?item.editor:'',
                                //             editorId: item.editorId,
                                //             id: item.id,
                                //             soundPath:list.soundPath,
                                //             soundDuration:list.soundDuration,
                                //             soundSize:list.soundSize,
                                //             isEdit:num,
                                //             questionContentOther: questionContentOther,
                                //         }
                                //         newAnswerContent.push(newList);
                                //     })
                                // }else{
                                //     newAnswerContent.push(item);
                                // }
                            });
                            data && data.forEach(item => {
                                if(item.keyWords) {
                                    item.keyWords = item.keyWords.split('|')
                                }
                            });

                            this.knowledgeData = data;

                            // this.knowledgeData = newAnswerContent;
                        }

                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            //删除知识库明细列表
            removeKnowledgeItemList(item){
                let params = [];
                if(this.deleId){
                    params.push(this.deleId)
                }else{
                    this.multipleSelection.forEach(id=>{
                        params.push(id);
                    })
                }

                $.post(this.$baseUrl+'knowledge/removeKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('删除成功！');
                        this.delItemsVisible = false;
                        this.multipleSelection = [];
                        this.deleId = '';
                        this.queryKnowledgeItemList();
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
             // 2.1.6.检查上传文件
            checkAnnexFile(){
                // this.atchKnow.excelPathTip = '检测中...';
                let data = {
                    excelTemplateType:2
                }
                if(this.upload_img_index>-1){
                    data.filePath=this.correctArry[this.upload_img_index].excelPath;
                }else{
                    data.filePath = this.atchKnow.excelPath;
                }

                $.post(this.$baseUrl+'common/checkAnnexFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let list= {};
                        if(!res.returnObject.correctFlag){
                            let msg = `${res.returnObject.rowNumber-res.returnObject.exceptionRowNumber}条上传成功，剩余${res.returnObject.exceptionRowNumber}条上传失败！`
                            if(this.correctArry.length>0){
                                this.correctArry[this.upload_img_index].errorMessage = msg
                            }else{
                                this.atchKnow.errorMessage = msg;
                            }
                            var iTemp = (~~(Math.random()*100000)).toString();
                            list = {
                                nextUpload:true,
                                correctFilePath:res.returnObject.correctFilePath,
                                errorFilePath:this.$baseUrl+'file/downloadFile.html?filePath='+res.returnObject.errorFilePath,
                                id:`file_${iTemp}`
                            }
                        }else{
                            list = {
                                nextUpload:false,
                                correctFilePath:res.returnObject.correctFilePath,
                            }
                        }
                        this.correctArry.push(list);
                        this.upload_img_index++;
                    }else{
                        // this.atchKnow.errorMessage = res.errorInfoList[0].errorMessage;
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            uploadAnnexFile(id){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#'+id)[0].files[0]);
                $.ajax({
                    url: this.$baseUrl+'common/uploadAnnexFile.json',
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
                        if(self.upload_img_index>-1){
                            self.correctArry[self.upload_img_index].excelPathTip=self.correctArry[self.upload_img_index].filePath;
                            self.correctArry[self.upload_img_index].excelPath=res.returnObject;
                        }else{
                            self.atchKnow.excelPathTip = self.atchKnow.filePath;
                            self.atchKnow.excelPath = res.returnObject;
                        }
                        self.checkAnnexFile();
                    }else{
                        self.$message.error('上传失败！');
                    }
                }).fail(function(res) {

                });
            },
            // 2.6.14.批量保存知识库明细（上传Excel后保存）
            saveBatchKnowledgeItem(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            id:this.groupId
                        }
                        if(this.correctArry.length){
                            let list = [];
                            this.correctArry.forEach((item)=>{
                                item.correctFilePath && list.push(item.correctFilePath);
                            });
                            data.correctFilePathList=list;
                        }else{
                            data.filePath = this.atchKnow.excelPath;
                        }
                        $.post(this.$baseUrl+'knowledge/saveBatchKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                this.creatFAQVisible = false;
                                this.queryKnowledgeItemList();
                            }else{
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },
            uploadAnnexFileOfInfo(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 103);
                oMyForm.append("file", $('.importFile')[this.currentIndex].files[0]);
                $('.importFile').eq(this.currentIndex).val('');
                $.ajax({
                    url: this.$baseUrl+'common/uploadAnnexFileOfInfo.json',
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
                        let data = res.returnObject;

                        self.creatFAQVForm.answerContent[self.currentIndex]['soundPath'] = data.filePath;
                        self.creatFAQVForm.answerContent[self.currentIndex]['soundDuration'] = data.soundDuration;
                        self.creatFAQVForm.answerContent[self.currentIndex]['soundSize'] = data.fileSize;

                    }else{
                        self.$message.error('上传失败！');
                    }

                }).fail(function(res) {

                });
            },
        },
        watch:{
            creatFAQVisible(val){
                if(!val){
                    this.$refs['creatFAQVForm'].resetFields();
                    this.$refs['atchKnow'].resetFields();
                    this.upload_img_index=-1;
                    this.atchKnow.errorMessage ='';
                    this.atchKnow.excelPathTip = '';
                    this.atchKnow.excelPath = '';
                    this.atchKnow.filePath = '';
                    this.atchKnow.excelPathNew = '';
                    this.atchKnow.filePathNew = '';
                    this.atchKnow.excelPathTipNew='';
                    this.isNewFile = false;
                    this.creatFAQVForm.questionContentOther = [{
                        name:'相似问题',
                        value: ''
                    }]
                    this.creatFAQVForm.answerContent=[{
                        name:'回答',
                        value: '',
                        soundPath:'',
                        soundDuration:'',
                        soundSize:''
                    }],
                    this.correctArry=[];
                }
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
            },
            queryKey(val){
                this.queryKey = val;
                this.queryKnowledgeItemList();
            }
        }
    }

</script>

<style scoped lang="less">
    .drawer-form-scroll {
        position: absolute;
        top: 75px;
        bottom: 0;
        right: 0;
        left: 0;
    }

    .handle-input {
        width:240px;
        display: inline-block;
    }
    .faqUpload{
        padding:30px 20px;
        .el-icon-question{
            font-size: 18px;
            color: #919FA9;
        }
        .red{
            color: #ff0000;
        }
        .blue{
            color: #1890FF;
        }
        .updload-list-box{
            padding: 40px 0 30px 40px;
        }
        .el-button{
            width: 88px;
            // margin:40px 0 30px 40px;
        }
    }
    .pagination{
        padding: 20px 0 10px;
    }
    .repository-menu{
        width: 100%;
        overflow-y: auto;
        position: absolute;
        top: 46px;
        bottom:10px;
    }
    .link{
        display: inline-block;
        cursor: pointer;
        color: #4e8ff9;
    }
    .repository-box-right-icon-box{
        i{
            font-size: 18px;
            &.icon-icon_rep_add,
            &.icon-icon_rep_search,
            &.icon-icon_publish{
                color: #4e8ff9;
            }
            &.is-disabled{
                color: #909399;
                cursor: not-allowed;
            }
            &.line{
                display: inline-block;
                position: relative;
                top: 2px;
                width: 1px;
                height:16px;
                background-color: #909399;
            }
        }
    }
    .w_icon_play{
        cursor: pointer;
    }
    .creat-faq-dialog .el-input, .creat-faq-dialog .el-textarea{
        width: 500px;
    }
    .row-left{
        width:100px;
        span{
            display:block;
            padding-left:44px;
            color:#303133;
            padding-bottom: 5px;
            cursor: pointer;
            &.active{
                color: #1890FF;
            }
        }
    }
    .sound-content{
        position:fixed;
        z-index:5000;
        background-color:#fff;
        left:0;
        width:100%;
        top:0;bottom:0
    }
    .btnUpload{
        // display: inline-block;
        position: relative;
        overflow: hidden;
        input{
            width: 52px;
            position: absolute;
            left: 0;
            opacity: 0;
        }
    }

    .canel-box {
        a {
            cursor: pointer;
        }
    }

    .right-edit-box {
        span {
            cursor: pointer;
        }
    }

    .icon-icon_play {
        cursor: pointer;
        color: #1890FF;
    }

    .config-card-list {
        .config-card {
            position: relative;
            background: #fff;
            margin-bottom: 20px;
            padding: 20px;
            .config-card-row {
                display: flex;
                margin-bottom: 10px;
                .question-title {
                    margin-left: 20px;
                    width: 90px;
                    color: #999;
                }
                .question-content {
                    flex-grow: 1;
                    .answer-content {
                        background: #f6f6f6;
                        padding: 20px 10px 40px;
                    }
                    .answer-content {
                        display: flex;
                        .answer-content-text {
                            margin-left: 10px;
                        }
                    }
                }
                .question-keywords {
                    margin-left: 5px;
                }
                .question-similer {
                    flex-grow: 0;
                    margin-right: 5px;
                }
            }
            .config-card-footer {
                text-align: right;
                .primary-tag {
                    color: #999;
                    margin-left: 5px;
                    font-size: 12px;
                }
            }
        }
    }
    .drawer-form-scroll {
        .similer-input {
            position: relative;
            margin-top: 10px;
        }
        .w_icon_trash {
            position: absolute;
            right: -30px;
            top: 8px;
        }
        .similer-question {
            position: relative;
        }
        .question-content {
                    flex-grow: 1;
                    .answer-content {
                        display: flex;
                        .answer-content-text {
                            margin-left: 10px;
                        }
                    }
                }
        .el-tag + .el-tag {
            margin-left: 10px;
        }
        .button-new-tag {
            margin-left: 10px;
            height: 32px;
            line-height: 30px;
            padding-top: 0;
            padding-bottom: 0;
        }
        .input-new-tag {
            width: 90px;
            margin-left: 10px;
            vertical-align: bottom;
        }
        .keywords{
            width: 100%;
            height: 100px;
            border: 1px solid #DEE2E6;
            padding: 10px;
            border-radius: 10px;
            box-sizing: border-box;
        }
    }
    // .textarea-wrapper {
        // border: 1px solid #dcdfe6;
        // height: 125px;
        // position: relative;
        // .rep-edit-top {
        //     position: absolute;
        //     bottom: 0px;
        // }
        .w_textarea {
                box-sizing: border-box;
                width: 100%;
                height: 100px;
                padding: 10px;
                border: 1px solid #DEE2E6;
                font-size: 14px;
                color: #303133;
                outline: none;
                border-radius: 10px;
                // border-bottom:1px solid #ebeef5;
        }
    // }

    .knowledge-header {
        display: flex;
        margin-bottom: 10px;
        .right-menu-box {
            margin-left: auto;
            .right-menu-item {
                display: inline-block;
            }
            .el-icon--right {
                margin-left: 0;
            }
        }
    }
    .sort {
        margin-bottom: 5px;
    }
</style>

<style lang="less">
    .drawer-form-scroll-warp {
        padding: 24px 40px 24px 24px;
    }
    .drawer-form-scroll {
        .el-textarea__inner {
            min-height: 100px!important;
        }
        .form-item-keywords {
            .el-form-item__label{
                float: none;
            }
        }
    }
    .batch-drawer {
        .el-drawer{
            padding: 0 20px;
        }
    }
    .config-card-list {
        .el-checkbox__input {
            position: unset;
        }
        .el-checkbox__inner {
            position: absolute;
            top: 3px;
            left: 0px;
        }
    }

    .config-card-list {
        .el-checkbox-group {
            font-size: unset;
        }
    }

    .config-card {
        .el-checkbox__label{
            padding-left: 0;
        }
    }
</style>