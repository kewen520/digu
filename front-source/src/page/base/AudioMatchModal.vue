<template>
    <div>
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
        <el-dialog title="匹配音频" :visible.sync="soundMatchVisible" >
            <span style="color: #409EFF">
                <i class="el-icon-search primary"></i>
            </span>已检测到音库中有<span style="color: #409EFF">{{tableSoundData.length}}条</span>音频可以匹配给相应回答<br>
            <span style="font-size: smaller">已选<span style="color:#E6A23C">{{matchSoundList.length}}条</span></span>
            <el-table
                    ref="multipleMatchTable"
                    :data="tableSoundData"
                    style="width: 100%"
                    @selection-change="handleMatchSelectionChange"
            >
                <el-table-column
                        type="selection"
                        width="55">
                </el-table-column>
                <el-table-column label="音频">
                    <template slot-scope="scope">
                        <span class="w_icon_play w_icon_pause" v-show="scope.row.soundPath" @click="handleVideo(scope.row)"></span>
                        <span>{{scope.row.soundContent}}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="ansewrText"
                        label="回答"
                >
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="soundMatchVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="matchButtonDisabled" @click="matchSoundConfirm">匹 配</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../../common/bus';
    import wVideo from '../base/Video';

    export default {
        data() {
            return {
                matchAllKnoledgeItemList: [],
                tableSoundData: [],
                matchButtonDisabled: false,
                matchSoundList: [],
                soundMatchVisible: false,
                videoVisible: false,
                viewSource: '',
                viewPlaying:false,
            }
        },

        components: {
            wVideo,
        },

        props: {
            visible: false,
            groupId: '',
        },

        watch: {
            soundMatchVisible(newVal) {
                if (newVal) {
                    this.matchSound();
                }
                this.$emit('update:visible', newVal);
            },

            visible(newVal) {
                this.soundMatchVisible = newVal;
            },

            videoVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            },
        },

        methods: {
            matchSound:function () {
                this.soundMatchVisible = true
                var ledgeParams={
                    groupId:this.groupId,
                    searchType:2,
                    currentPage:0,
                    pageSize:5000
                }
                //获取到了knoledge表的数据
                var contentParams = []
                var answerList = []
                //查询当前知识库下面的所有的问题得到回到列表
                $.post(this.$baseUrl + 'knowledge/queryKnowledgeItemList.json',JSON.stringify(ledgeParams)).then((res)=> {
                    if (res.resultMessageEnum == '0000') {
                        let knoledge = res.returnObject.recordList;
                        this.matchAllKnoledgeItemList = knoledge;
                        if (knoledge!= "" && knoledge.length>0){
                            for (var i in knoledge){
                                let answerContent;
                                try{
                                    answerContent = JSON.parse(knoledge[i].answerContent);
                                }catch(e){
                                    answerContent = item.answerContent;
                                }
                                if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                    answerContent.forEach((list,num)=>{
                                        //如果list.soundPath为空需要匹配，不为空的不需要匹配
                                        if (list.text!="" && list.text!="undefined" && !list.hasOwnProperty("soundPath") || list.soundPath == ""){
                                            contentParams.push(list.text)
                                            answerList.push({
                                                ansewrText:list.text,
                                                knoledgeItemId:knoledge[i].id
                                            })
                                        }
                                    })
                                }
                            }

                            var soundShowList = [];
                            //查询音频表
                            $.post(this.$baseUrl+ 'sound/querySoundConfigItemListBySoundContent.json',JSON.stringify(contentParams)).then((soundRes)=>{
                                if (soundRes.resultMessageEnum == '0000') {
                                    var soundObject = soundRes.returnObject;
                                    soundObject.forEach((list,num)=>{
                                        answerList.forEach((alist,anum) => {
                                            if (alist.ansewrText == list.soundContent){
                                                list.ansewrText = alist.ansewrText
                                                list.knoledgeItemId = alist.knoledgeItemId
                                                soundShowList.push(list)
                                            }
                                        })
                                    })
                                    this.tableSoundData = soundShowList

                                }else {
                                    this.$message.error(res.errorInfoList[0].errorMessage);
                                }
                            });
                        }

                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });

            },

            handleMatchSelectionChange:function (item) {
                var knoledgeLists = []
                let noticeFlag = false;
                item.forEach((item) =>{
                    if(knoledgeLists.indexOf(item.knoledgeItemId + item.ansewrText) < 0){
                        knoledgeLists.push(item.knoledgeItemId + item.ansewrText)
                    }else {
                        //this.$refs.multipleMatchTable.clearSelection()
                        if (!noticeFlag) {
                            this.$message.error("注意,同一回答选择了多条音频,默认取最后一条");
                            noticeFlag = true;
                        }
                    }
                });
                this.matchSoundList = item;
            },

            handleVideo(item){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =item.soundPath;
                })
            },

            matchSoundConfirm:function () {
                this.matchButtonDisabled = true
                //循环匹配的音频数组
                //记录需要更新的item的Id
                var updateParamsItemId = []
                this.matchSoundList.forEach((msoundList)=>{
                    //循环匹配的答对
                    this.matchAllKnoledgeItemList.forEach((itemList,itemIndex)=>{
                        //如果音频的knoledgeItemId 等于答对的id 说明要改的数据就是这条数据
                        if (msoundList.knoledgeItemId == itemList.id){
                            let answerContent ;
                            //精确匹配到具体点问题
                            try{
                                answerContent = JSON.parse(itemList.answerContent)
                            }catch(e){
                                answerContent = itemList.answerContent;
                            }
                            if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                answerContent.forEach((awerList,index)=>{
                                    if (awerList.text == msoundList.ansewrText){
                                        awerList.soundPath = msoundList.soundPath
                                        //有时候没有soundDuration 不给默认值就没有这个key
                                        awerList.soundDuration = msoundList.soundDuration
                                        awerList.soundSize = msoundList.soundSize
                                        answerContent[index] = awerList
                                    }
                                })
                                this.matchAllKnoledgeItemList[itemIndex].answerContent = JSON.stringify(answerContent)
                                if (updateParamsItemId.indexOf(itemList.id) <  0 ){
                                    updateParamsItemId.push(itemList.id)
                                }
                            }
                        }
                    })
                })

                var success = 0
                var fair = 0
                var comm = updateParamsItemId.length
                for (var i in updateParamsItemId){
                    this.matchAllKnoledgeItemList.forEach((item,index)=>{
                        if (updateParamsItemId[i] == item.id){
                            let data = {}
                            data.id = item.id
                            data.answerContent = item.answerContent
                            $.post(this.$baseUrl + 'knowledge/modifyKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                                if(res.resultMessageEnum=='0000'){
                                    success += 1
                                    comm -= 1
                                    if(comm == 0){
                                        this.$message.error(`匹配成功${success}条`);
                                        this.soundMatchVisible = false
                                        this.matchButtonDisabled = false
                                        this.$emit('queryKnowledgeItemList');
                                    }
                                }else {
                                    fair +=1
                                    comm -=1
                                    if(comm == 0){
                                        this.$message.error(`匹配失败${fair}条`);
                                        this.soundMatchVisible = false
                                        this.matchButtonDisabled = false
                                        this.$emit('queryKnowledgeItemList');
                                    }
                                }
                            });
                        }
                    });
                }
            },
        },
    }
</script>

<style scoped lang="less">
    .w_icon_play{
        cursor: pointer;
    }
</style>