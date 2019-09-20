<template>
   <div class="container-admin">
       <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>资源管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{resourceTxt}}</el-breadcrumb-item>
                <el-breadcrumb-item>{{soundTxt}}</el-breadcrumb-item>
            </el-breadcrumb>
            <keep-alive>
                <el-tabs v-model="resourceActiveName" @tab-click="tabHandleClick">
                    <el-tab-pane label="音频库" name="first"></el-tab-pane>
                </el-tabs>
            </keep-alive>
        </div>
        <div class="admin-body">
            <div v-if="resourceActiveName=='first'" class="speech-tab-pane">
                <!--二级导航-->
                <el-tabs v-model="ypkActiveName" @tab-click="ypkHandleClick">
                        <el-tab-pane label="通用音频库"  name="ypkFirst"></el-tab-pane>
                        <el-tab-pane label="用户音频库"  name="ypkSecond"></el-tab-pane>
                </el-tabs>
                <!--操作按钮-->
                <el-row>
                    <el-col>
                        <el-form :inline="true" ref="searchForm" :model="searchForm" class="w-form-inline">
                            <el-form-item label="关键词：">
                                <el-input clearable v-model="searchForm.queryKey" @change="searchChange"
                                          :placeholder="ypkActiveName=='ypkFirst'?'音频名称/文本内容':'创建用户'"  @keyup.native.13="onSearch"></el-input>
                            </el-form-item>
                            <!--<el-form-item label="文件夹：" v-if="ypkActiveName=='ypkFirst'">
                                <el-select clearable v-model="searchForm.configGroup" value-key="id" placeholder="请选择">
                                    <el-option v-for="(item,index) in configGroupMenu" :key="item.id" :label="item.configGroupName" :value="item"></el-option>
                                </el-select>
                            </el-form-item>-->
                            <el-form-item>
                                <el-button type="primary" @click="onSearch">搜索</el-button>
                            </el-form-item>
                            <!--<el-form-item v-if="ypkActiveName=='ypkFirst'">
                                <el-button @click="onHandleReset">重置</el-button>
                            </el-form-item>-->
                        </el-form>
                    </el-col>
                </el-row>
                <el-row style="padding-bottom:20px;" v-if="ypkActiveName=='ypkFirst'">
                    <el-col>
                        <el-button type="primary" :disabled="delDisabled" @click="delVisible = true" >删除</el-button>
                        <el-button type="primary" :disabled="expDisabled" @click="exportSoundZipFile">下载音频</el-button>
                        <el-button type="primary" :disabled="downDisabled" @click="downloadSoundConfigItemExcelFile" >下载表格</el-button>
                        <el-button type="primary" :disabled="uploadDisabled" @click="uploadVisible=true" >上传表格</el-button>
                        <el-button type="primary" :disabled="uploadDisabled" class="upload-btn-sound">上传音频
                            <input :disabled="uploadDisabled" multiple="multiple" ref="upload_input" type="file" id="file" @change="uploadSoundFileList" ></el-button>
                    </el-col>
                </el-row>
                <!-- 左侧菜单树-->
                <el-row class="first-row" v-if="ypkActiveName=='ypkFirst'">
                    <el-col :span="5" class="repository-menu-box" :style="{height:height+'px'}">
                        <div class="repository-menu-top">文件夹<i class="el-icon-circle-plus" @click="addGroup"></i></div>
                        <div class="repository-menu sound-menu">
                            <!-- <keep-alive> -->
                            <el-menu class="repository-menu" :unique-opened="true" :default-openeds="openeds" @open="handleOpen">
                                <el-submenu index="1" >
                                    <template slot="title">话术音频</template>
                                    <draggable v-model="speechMenu" @end="draggableEnd" @start="draggableStart('speech')">
                                        <el-menu-item 
                                        :index="`1-${index}`"
                                        class="repository-menu-item"
                                        :class="{active:item.index==itemActive,edit:item.isEdit}" 
                                        v-for="(item,index) in speechMenu" 
                                        :key="`${index}`">
                                            <div class="duplicate" v-if="item.duplicateFlag == 1">用户</div>
                                            <div class="repository-menu-input-box" v-show="item.show">
                                                <el-input v-model="item.configGroupName" v-if="item.type!=1&&item.type!=2"></el-input>
                                            </div>
                                            <span v-show="!item.show" class="groupName" @click="handleQuerySoundConfigItemList(item,index)">{{item.configGroupName}}</span>
                                            <div class="repository-icon-box edit-box">
                                                <i class="el-icon-check" @click="modifySoundConfigGroup(item,index)"></i>
                                                <i class="el-icon-close" @click="cancelEdit(item,index)"></i>
                                            </div>
                                            <div class="repository-icon-box hover-box" v-if="item.groupFlag!=1&&item.groupFlag!=0">
                                                <i class="iconfont icon-ico_move-sort"></i>
                                                <i class="iconfont icon-ico_edit-content" @click="editConfigGroupMenu(item,'speech')"></i>
                                                <i class="iconfont icon-ico_delete" @click="deleteSound(item,index)"></i>
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
                                            <div class="repository-menu-input-box" v-show="item.show">
                                                <el-input v-model="item.configGroupName" v-if="item.type!=1&&item.type!=2"></el-input>
                                            </div>
                                            <span v-show="!item.show" class="groupName" @click="querySoundConfigItemList(item,index)">{{item.configGroupName}}</span>
                                            <div class="repository-icon-box edit-box">
                                                <i class="el-icon-check" @click="modifySoundConfigGroup(item,index)"></i>
                                                <i class="el-icon-close" @click="cancelEdit(item,index)"></i>
                                            </div>
                                            <div class="repository-icon-box hover-box" v-if="item.groupFlag!=1&&item.groupFlag!=0">
                                                <i class="iconfont icon-ico_move-sort"></i>
                                                <i class="iconfont icon-ico_edit-content" @click="editConfigGroupMenu(item,'knowledge')"></i>
                                                <i class="iconfont icon-ico_delete" @click="deleteSound(item,index)"></i>
                                            </div>
                                        </el-menu-item>
                                    </draggable>
                                </el-submenu>
                            </el-menu>
                        </div>
                    </el-col>
                    <el-col :span="19">
                        <el-table stripe :data="configGroupItemData"
                            class="table tb-edit sound-table" 
                            id="configGroupItemData" 
                            :height="height" 
                            ref="configGroupItemData" 
                            @selection-change="handleSelectionChange"
                            @sort-change="sortChange">
                            <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable"></el-table-column>
                            <el-table-column label="音频名称" prop="fileName" width="140" sortable></el-table-column>
                            <el-table-column label="文本内容" prop="soundContent" >
                                <template slot-scope="scope" >
                                    <div class="video-edit-box">
                                        <i class="iconfont icon-icon_play" @click="handleVideo(scope.$index, scope.row)"></i>
                                        <el-input type="textarea" class="tb-edit-input" v-if="!scope.row.edit"
                                                  placeholder="输入文本内容" v-model="scope.row.soundContent"
                                                  @change="modifySoundConfigItem(scope.$index, scope.row)">></el-input>
                                        <span v-else class="video-edit-box-text">{{scope.row.soundContent}}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="更新时间" prop="editTime" width="140" sortable></el-table-column>
                            <el-table-column label="操作人"  prop="operator" width="140"></el-table-column>
                            <el-table-column label="状态" prop="useFlag" :formatter="soundUseStatus" width="60"></el-table-column>
                        </el-table>
                    </el-col>
                </el-row>
                <!--用户音频库-->
                <el-row v-else>
                    <el-table stripe @sort-change="sortChange" :data="memberData" style="width: 100%;border-left:1px solid #ebeef5;">
                        <el-table-column prop="userName" label="创建用户"></el-table-column>
                        <el-table-column sortable prop="latestApplyTime" width="140" label="更新时间"></el-table-column>
                        <el-table-column width="50" label="操作">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleView(scope.row,scope.$index)">查看</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <!--分页导航-->
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
       <!--  删除音频库分类 -->
         <el-dialog title="删除音频库文件夹" :visible.sync="removeSoundVisible" width="400px" :append-to-body="true">
            <div >您确定要删除音频库文件夹<span v-show="removeSoundInfo.configGroupName">“{{removeSoundInfo.configGroupName}}”</span>吗？删除后相关音频也会被删除。</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="removeSoundVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeSoundConfigGroup">确 定</el-button>
            </span>
        </el-dialog>
       <!-- 删除音频提示框 -->
       <el-dialog title="删除音频" :visible.sync="delVisible" width="400px" :append-to-body="true">
           <div >您确定要删除{{this.multipleSelection.length}}个所选音频吗？删除后将不可恢复。</div>
           <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeSoundConfigItemList">确 定</el-button>
            </span>
       </el-dialog>
        <!-- 音频播放 -->
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px" :append-to-body="true">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
       <!-- 上传提示框 -->
       <el-dialog title="上传确认" :visible.sync="uploadVisible" width="400px" :append-to-body="true">
           <div >上传内容可能会覆盖相关已有文本内容！</div>
           <span slot="footer" class="dialog-footer">
                <el-button type="primary" class="upload-btn-sound">确 定
                    <input type="file" id="importFile"  @change="uploadSoundConfigItemExcelFile" >
                </el-button>
            </span>
       </el-dialog>
   </div>
</template>

<script>
    import bus from '../common/bus';
    import common from '../common/common';
    import wVideo from './base/Video';
    import draggable from 'vuedraggable';
    export default {
        name: 'basetable',
        components: {
            wVideo,
            draggable
        },
        data() {
            return {
                /*导航相关*/
                resourceActiveName: 'first', // 资源库活动一级导航标识。first-音频库
                ypkActiveName: 'ypkFirst', // 音频库活动二级导航标识。ypkFirst-通用音频库，ypkSecond-用户音频库
                resourceTxt: '音频库',
                soundTxt: '通用音频库',
                /*搜索相关*/
                searchForm: {
                    configGroup: null,
                    queryKey: ''
                },
                /*对话框显示相关*/
                delVisible: false, // 删除音频文件
                uploadVisible: false, // 上传音频文件
                removeSoundVisible: false, // 删除音频文件夹
                /*按钮禁用相关*/
                delDisabled: true,
                expDisabled: true,
                downDisabled: true,
                uploadDisabled:true,
                /*左侧菜单树相关*/
                configGroupMenu: [],
                configGroupItemData: [],
                itemActive: 0, // 活动菜单index
                speechMenu: [],
                knowledgeMenu: [],
                activeGroupType: 'speech', // 活动文件夹类型。speech-话术音频，knowledge-知识库音频
                openeds: ['1'], // 当前打开的sub-menu的index的数组
                removeSoundInfo: {
                    name: ''
                },
                /*复选相关*/
                multipleSelection: [],
                selectable:false,
                /*排序相关*/
                sortList: [],
                /*分页导航相关*/
                cur_page: 1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                /*音频播放相关*/
                videoVisible: false,
                viewSource: '',
                viewPlaying: false,
                /*用户音频库相关*/
                memberData: [],
                /*杂项*/
                height: 400,
            }
        },
        created() {
            this.type = this.$route.query.type || 1;
            this.active = this.$route.query.active || '1';
            // 一级导航
            switch (this.type) {
                case '1':
                    this.resourceActiveName = 'first';
                    this.resourceTxt = '音频库';
                    break;
            }
            // 二级导航
            switch (this.active) {
                case '1':
                    this.ypkActiveName = 'ypkFirst';
                    this.soundTxt = '通用音频库';
                    break;
                case '2':
                    this.ypkActiveName = 'ypkSecond';
                    this.soundTxt = '用户音频库';
                    break;
            }
            if (this.resourceActiveName == 'first') {
                if (this.ypkActiveName == 'ypkFirst') {
                    this.querySoundConfigGroupList();
                } else {
                    this.queryMemberList();
                }
            }
        },
        computed: {},
        methods: {
            /*导航相关*/
            /**
             * 一级导航tab点击
             * @param type
             */
            tabHandleClick(type) {
                let n,
                    statusText;

                switch (type.name) {
                    case 'first':
                        n = '1';
                        statusText = '音频库';
                        break;
                }

                this.$router.push({query: {type: n}})

                if (this.resourceActiveName == 'second') {
                    if (this.ypkActiveName == 'ypkFirst') {
                        this.querySoundConfigItemList();
                        this.queryValidIndustryList();
                    } else {
                        this.queryMemberList();
                    }

                }

                this.resourceTxt = statusText;

            },
            /**
             * 二级导航tab点击
             * @param type
             */
            ypkHandleClick(type) {
                this.pagination.pageSize = 10;
                if (this.ypkActiveName == 'ypkFirst') {
                    this.configGroupItemData = [];
                    this.speechMenu = [];
                    this.knowledgeMenu = [];
                    this.soundTxt = '通用音频库';
                    this.$router.push(`/resource`);
                    this.querySoundConfigGroupList();
                } else {
                    this.soundTxt = '用户音频库';
                    this.queryMemberList();
                }
            },

            /*左侧菜单树相关*/
            /**
             * 查询音频文件夹列表
             */
            querySoundConfigGroupList() {
                $.get(this.$baseUrl + 'services/sound/querySoundConfigGroupList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        let newData = res.returnObject;
                        if (newData && newData.length) {
                            newData.forEach(el => {
                                el.isEdit = false;
                                el.show = false;
                            });

                            this.configGroupMenu = newData;

                            newData.forEach((item, index) => {
                                item.index = index;
                                if (item.soundConfigGroupType == 1) {
                                    this.speechMenu.push(item)
                                } else {
                                    this.knowledgeMenu.push(item);
                                }
                            })

                            this.querySoundConfigItemList(newData[0], 0);
                        }

                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            /**
             * 新建分类
             */
            addGroup() {

                let item = {
                    newAdd: true,
                    isEdit: true,
                    show: true,
                    configGroupName: ''
                }

                if (this.activeGroupType == 'speech') {
                    item.soundConfigGroupType = 1;
                    this.speechMenu.push(item);
                }
                if (this.activeGroupType == 'knowledge') {
                    item.soundConfigGroupType = 2;
                    this.knowledgeMenu.push(item);
                }

                this.configGroupMenu = this.speechMenu.concat(this.knowledgeMenu);

                this.setIndex()

            },
            /**
             * 打开文件夹
             * @param val
             * @param b
             */
            handleOpen(val, b) {
                if (val == '1') {
                    this.activeGroupType = 'speech'
                } else if (val == '2') {
                    this.activeGroupType = 'knowledge'
                }
            },
            /**
             * 移动开始
             * @param type
             */
            draggableStart(type) {
                this.activeGroupType = type;
                this.oldConfigGroupMenu = this.configGroupMenu;
            },
            /**
             * 移动结束
             * @param param
             */
            draggableEnd(param) {
                let sortData = [];
                if (this.activeGroupType == 'speech') {
                    this.speechMenu.forEach((item) => {
                        sortData.push(item.id);
                    });
                    sortData.concat(this.knowledgeMenu);
                }

                if (this.activeGroupType == 'knowledge') {

                    sortData.concat(this.speechMenu);

                    this.knowledgeMenu.forEach((item) => {
                        sortData.push(item.id);
                    });

                }

                this.configGroupMenu = this.speechMenu.concat(this.knowledgeMenu);

                this.configGroupMenu.forEach((item, index) => {
                    item.index = index;
                })

                this.sortSoundConfigGroup(sortData).then(res => {
                    this.querySoundConfigItemList(this.configGroupMenu[this.itemActive], this.itemActive);

                });
            },
            /**
             * 排序文件夹
             * @param list
             * @returns {*|jQuery|{}}
             */
            sortSoundConfigGroup(list) {
                var dtd = $.Deferred();
                $.post(this.$baseUrl + 'services/sound/sortSoundConfigGroup.json?', JSON.stringify(list)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        dtd.resolve();
                    } else {
                        this.configGroupMenu = this.oldConfigGroupMenu;
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                return dtd;
            },
            /**
             * 编辑左侧分类
             * @param item
             * @param type
             */
            editConfigGroupMenu(item, type) {
                this.configGroupMenu[item.index].oldConfigGroupName = item.configGroupName;
                this.configGroupMenu[item.index].show = true;
                this.configGroupMenu[item.index].isEdit = true;
            },
            /**
             * 取消编辑左侧分类
             * @param item
             * @param index
             */
            cancelEdit(item, index) {
                if (this.configGroupMenu[item.index].oldConfigGroupName) {
                    this.configGroupMenu[item.index].show = false;
                    this.configGroupMenu[item.index].isEdit = false;
                    this.configGroupMenu[item.index].configGroupName = this.configGroupMenu[item.index].oldConfigGroupName;
                } else {
                    if (item.newAdd) {
                        this.configGroupMenu.splice(item.index, 1);
                    } else {
                        this.removeSoundVisible = true;
                        this.removeSoundInfo = item;
                        this.removeSoundInfo.index = item.index;
                    }
                }
                this.initGroupMenu()
            },
            /**
             * 确认修改左侧分类
             * @param item
             * @param index
             * @returns {boolean}
             */
            modifySoundConfigGroup(item, index) {
                index = item.index;
                if (!item.configGroupName) {
                    if (item.newAdd) {
                        this.configGroupMenu.splice(item.index, 1);
                    } else {
                        this.removeSoundVisible = true;
                        this.removeSoundInfo = item;
                        this.removeSoundInfo.index = item.index;
                    }
                    return false;
                }
                // 如果为新添加的
                if (item.newAdd) {
                    let data = {
                        configGroupName: item.configGroupName,
                        soundConfigGroupType: this.activeGroupType == 'speech' ? 1 : 2
                    }
                    $.post(this.$baseUrl + 'services/sound/addSoundConfigGroup.json', JSON.stringify(data)).then((res) => {

                        if (res.resultMessageEnum == '0000') {
                            this.configGroupMenu[index].newAdd = false;
                            this.configGroupMenu[index].show = false;
                            this.configGroupMenu[index].isEdit = false;
                            this.configGroupMenu[index].id = res.returnObject;
                            if (this.configGroupMenu.length == 1) {
                                this.querySoundConfigItemList(this.configGroupMenu[0], 0);
                            }
                            this.$message.success('添加成功！');
                        } else {
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                } else {
                    // 否则为修改
                    let data = {
                        id: item.id,
                        configGroupName: item.configGroupName
                    }
                    $.post(this.$baseUrl + 'services/sound/modifySoundConfigGroup.json', JSON.stringify(data)).then((res) => {
                        if (res.resultMessageEnum == '0000') {

                            this.configGroupMenu[index].show = false;
                            this.configGroupMenu[index].isEdit = false;
                            this.$message.success('修改成功！');

                        } else {
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                }

                this.initGroupMenu();
            },
            setIndex() {
                this.configGroupMenu.forEach((item, index) => {
                    item.index = index;
                })
            },
            initGroupMenu() {
                this.speechMenu = [];
                this.knowledgeMenu = [];
                this.configGroupMenu.forEach((item, index) => {
                    item.index = index;
                    if (item.soundConfigGroupType == 1) {
                        this.speechMenu.push(item)
                    } else {
                        this.knowledgeMenu.push(item);
                    }
                })
            },

            /*按钮操作相关*/
            /**
             * 重置
             */
            onHandleReset() {
                this.searchForm = {};
                this.$refs['searchForm'].resetFields();
            },
            /**
             * 搜索
             * @returns {boolean}
             */
            onSearch() {
                if (!this.searchForm.queryKey && !this.searchForm.configGroup) {
                    this.$message.error("请输入关键词！");
                    return false;
                }
                this.cur_page = 1;
                if (this.resourceActiveName == 'first') {
                    if (this.ypkActiveName == 'ypkFirst') {
                        this.querySoundConfigItemList();
                    } else {
                        this.queryMemberList();
                    }
                }


            },
            /**
             * 删除音频文件
             * @param item
             * @param index
             */
            deleteSound(item, index) {
                this.removeSoundVisible = true;
                this.removeSoundInfo = item;
                this.removeSoundInfo.index = item.index;
            },
            /**
             * 删除分类
             */
            removeSoundConfigGroup() {
                this.removeGroupId = this.removeSoundInfo.id;
                this.removeGroupIndex = this.removeSoundInfo.index;
                let data = {
                    soundConfigGroupId: this.removeGroupId
                }
                $.post(this.$baseUrl + 'services/sound/removeSoundConfigGroup.json?soundConfigGroupId=' + data.soundConfigGroupId).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.configGroupMenu.splice(this.removeGroupIndex, 1);
                        this.$message.success('删除成功！');
                        this.removeSoundVisible = false;
                        if (this.removeGroupIndex == this.itemActive) {
                            this.querySoundConfigItemList(this.configGroupMenu[0], 0);
                        }

                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    this.initGroupMenu();
                });

            },
            /**
             * 点击左侧文件夹查询音频文件明细列表
             * @param item
             * @param index
             */
            handleQuerySoundConfigItemList(item, index) {
                this.onHandleReset();
                this.querySoundConfigItemList(item, index);
            },
            /**
             * 查询音频文件明细列表
             * @param item
             * @param index
             */
            querySoundConfigItemList(item, index) {
                if (item) {
                    if (item.duplicateFlag == 1){
                        this.selectable = false;
                        this.uploadDisabled = true;
                    }else {
                        this.selectable = true;
                        this.uploadDisabled = false;
                    };
                };
                let data = {
                    currentPage: this.cur_page - 1,
                    pageSize: this.pagination.pageSize
                };
                if (this.searchForm.configGroup) {
                    data.configGroupId = this.searchForm.configGroup.id;
                } else {
                    if (item && item.id) {
                        data.configGroupId = item.id
                    } else {
                        data.configGroupId = this.activeGroupId;
                    }
                }
                if (this.searchForm.queryKey) {
                    data.queryKey = this.searchForm.queryKey;
                }
                if (this.sortList.length) {
                    data.sortList = this.sortList;
                }
                $.post(this.$baseUrl + 'services/sound/querySoundConfigItemList.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        let data = res.returnObject.recordList;


                        if (typeof index != 'undefined') {

                            this.itemActive = item.index;
                        }
                        // 记录当前分类数据
                        if (item) {
                            this.activeGroupId = item.id;
                            this.activeGroupName = item.configGroupName;
                        }
                        if (data.length) {
                            this.disabled = false;
                            data.forEach((list, index) => {
                                list.edit = false;
                            });
                        } else {
                            this.disabled = true;
                        }

                        this.configGroupItemData = data;

                        this.pagination.total = res.returnObject.totalNumber;

                    } else {

                    }
                });
            },
            /**
             * 修改音频文本内容
             * @param index
             * @param row
             */
            modifySoundConfigItem(index, row) {
                let data = {
                    id: row.id,
                }
                if (this.configGroupItemData[index].soundContent) {
                    data.soundContent = this.configGroupItemData[index].soundContent
                }
                $.post(this.$baseUrl + 'services/sound/modifySoundConfigItem.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.configGroupItemData[index].edit = false;
                        this.$message.success('修改成功！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 删除音频文件
             */
            removeSoundConfigItemList() {
                let data = [];
                this.multipleSelection.forEach(item => {
                    data.push(item.id);
                })
                $.post(this.$baseUrl + 'services/sound/removeSoundConfigItemList.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.delVisible = false;
                        this.$message.success('删除成功！');
                        this.querySoundConfigItemList();
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 上传音频文件
             * @returns {boolean}
             */
            uploadSoundFileList() {
                let self = this;
                var oMyForm = new FormData();
                let data = [];
                oMyForm.append("configGroupId", this.activeGroupId);
                let files = $('#file')[0].files;

                let size = 5242880;

                for (var i = 0; i < files.length; i++) {
                    if (files[i].size > size) {
                        this.$message.error('请选择5M以内的文件！');
                        this.changeFileType();
                        return false;
                    }
                    let ext = files[i].name.substr(files[i].name.lastIndexOf(".")).toLowerCase();
                    // if(ext!=".mp3"&&ext!=".wma"&&ext!=".wav"&&ext!=".amr"){
                    if (ext != ".wav") {
                        self.$message.error('文件格式错误,重新选择！');
                        this.changeFileType();
                        return false;
                    }
                    oMyForm.append("file", files[i]);
                }
                this.changeFileType();
                if (!this.configGroupMenu.length) {
                    this.$message.error('请先创建文件夹分类！');
                    return false;
                }
                if (!this.activeGroupId) {
                    this.$message.error('请选择文件夹！');
                    return false;
                }
                $.ajax({
                    url: this.$baseUrl + 'services/sound/uploadSoundFileList.json',
                    type: 'POST',
                    cache: false,
                    data: oMyForm,
                    dataType: "json",
                    headers: {'Content-Type': 'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function (res) {
                    if (res.resultMessageEnum == '0000') {
                        self.$message.success('上传成功！');
                        self.querySoundConfigItemList();
                    } else {
                        self.$message.error('上传失败！');
                    }
                }).fail(function (res) {

                });


            },
            /**
             * 清空文件列表
             */
            changeFileType() {
                $('#file').val('');
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
            /**
             * 上传音频Excel文件
             */
            uploadSoundConfigItemExcelFile() {
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("configGroupId", this.activeGroupId);
                oMyForm.append("file", $('#importFile')[0].files[0]);
                this.changeExcelFile();
                $.ajax({
                    url: this.$baseUrl + 'services/file/importSoundConfigItemExcelFile.json',
                    type: 'POST',
                    cache: false,
                    data: oMyForm,
                    dataType: "json",
                    headers: {'Content-Type': 'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function (res) {
                    if (res.resultMessageEnum == '0000') {
                        self.$message.success('上传成功！');
                        self.uploadVisible = false;
                        self.querySoundConfigItemList();
                    } else {
                        self.$message.error('上传失败！');
                    }

                }).fail(function (res) {

                });
            },
            /**
             * 清空excel文件列表
             */
            changeExcelFile() {
                $('#importFile').val('');
            },
            /**
             * 搜索框内容改变
             * @param val
             */
            searchChange(val) {
                if (!val) {
                    if (this.ypkActiveName == 'ypkFirst') {
                        this.querySoundConfigItemList();
                    } else {
                        this.queryMemberList();
                    }
                }
            },
            /**
             * 列排序
             * @param column
             */
            sortChange(column) {
                let flag = true;
                if (column.prop) {
                    if (column.order == 'ascending') {
                        flag = true;
                    } else {
                        flag = false;
                    }
                    this.sortList = [{
                        propertyName: column.prop,
                        ascendingFlag: flag
                    }];

                } else {
                    this.sortList = '';
                }
                if (this.ypkActiveName == 'ypkFirst') {
                    this.querySoundConfigItemList();
                } else {
                    this.queryMemberList();
                }
            },
            /*复选相关*/
            /**
             * 复选
             * @param val
             */
            handleSelectionChange(val) {
                if (this.ypkActiveName == 'ypkFirst') {
                    this.multipleSelection = [];
                    this.multipleSelection = val;
                    if (this.multipleSelection.length) {
                        this.delDisabled = false;
                        this.expDisabled = false;
                        this.downDisabled = false;
                    } else {
                        this.delDisabled = true;
                        this.expDisabled = true;
                        this.downDisabled = true;
                    }
                } else {
                    val.forEach((row, index) => {
                        if (index === val.length - 1) return;
                        this.$refs.multipleTable.toggleRowSelection(row, false);
                    })
                    this.multipleSelection = val;
                }
            },
            /**
             * 复选框禁用控制
             * @param row
             * @param index
             */
            checkSelectable(row, index){
                return this.selectable;
            },
            /*音频播放相关*/
            /**
             * 音频播放
             * @param index
             * @param row
             */
            handleVideo(index, row) {
                this.videoVisible = true;
                this.$nextTick(() => {
                    this.viewSource = row.soundPath;
                })
            },

            /*用户音频库相关*/
            /**
             *查询会员列表
             */
            queryMemberList() {
                let params = {
                    currentPage: this.cur_page - 1,
                    pageSize: this.pagination.pageSize
                };

                if (this.searchForm.queryKey) {
                    params.queryKey = this.searchForm.queryKey;
                }
                if (this.sortList.length) {
                    params.sortList = this.sortList;
                }

                $.post(this.$baseUrl + 'services/member/queryMemberList.json', JSON.stringify(params)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.pagination.total = res.returnObject.totalNumber;
                        this.memberData = res.returnObject.recordList;
                        this.memberData.filter((item) => {
                            item.userName = item.enterpriseName || item.accountName;
                        })
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查看用户音频文件夹列表
             * @param row
             * @param index
             */
            handleView(row, index) {
                this.$router.push(`/sound/yh/${row.memberId}`);
            },

            /*分页导航相关*/
            /**
             * 当前页改变
             * @param val
             */
            handleCurrentChange(val) {
                this.cur_page = val;
                if (this.ypkActiveName == 'ypkFirst') {
                    this.querySoundConfigItemList();
                } else {
                    this.queryMemberList();
                }
            },
            /**
             * 每页显示条数改变
             * @param val
             */
            handleSizeChange(val) {
                this.pagination.pageSize = val;
                if (this.ypkActiveName == 'ypkFirst') {
                    this.querySoundConfigItemList();
                } else {
                    this.queryMemberList();
                }
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
        watch: {
            videoVisible(curVal) {
                if (!curVal) {
                    bus.$emit('viewPlaying', true);
                }
            }
        }
    };


</script>

<style scoped lang="less">
    .admin-body{
        padding-top: 10px;
    }
    .industry{
        .el-radio--medium.is-bordered{
            margin-left: 0;
            margin-right: 10px;
            margin-bottom:10px;
        }
        .el-select{
            width: 350px;
        }
    }
    
    .first-row{
        .el-table{
            border-left: 1px solid #ebeef5;
        }
    }
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
