<template>
  <div class="block">
    <div class="batch-group">
      <div class="title">
        <span class="circle">1</span>
        <p class="title-text">下载模版</p>
      </div>
      <div class="content-group">
        <div class="column"></div>
        <div class="content">
          <div class="content-item">请下载用于填写知识库问答的Excel模版文件</div>
          <div class="content-item">
            <el-button type="primary" plain class="download-button" @click="downloadTemplate">下载模板</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="batch-group">
      <div class="title">
        <span class="circle">2</span>
        <p class="title-text">上传文件</p>
      </div>
      <div class="content-group">
        <!-- <div class="column"></div> -->
        <div class="content">
          <div class="content-item">请上传已填写完成的Excel文件（建议最多不超过1000行）</div>
          <el-form ref="uploadForm">
            <el-form-item>
              <el-button class="file-btn" v-show="!atchKnow.errorMessage">
                <el-input
                        multiple="multiple"
                        v-model="atchKnow.filePath"
                        type="file"
                        id="file"
                        @change="uploadAnnexFile('file')"
                ></el-input>
                <span class="upload-span">上传</span>
              </el-button>
            </el-form-item>
          </el-form>
          <span class="blue">{{atchKnow.excelPathTip}}</span>
          <span class="red" >{{atchKnow.errorMessage}}</span>
        </div>
      </div>
    </div>
    <div class="batch-footer">
      <el-button @click="close" class="batch-footer-button">取消</el-button>
      <el-button @click="uploadFile" type="primary" class="batch-footer-button">保存</el-button>
    </div>
  </div>
</template>
<script>
    import axios from 'axios';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../../common/enums';
import { parse } from 'url';

    export default {
        name: 'BatchFiles',
        data() {
            return {
                fileList: [],
                extraData: null,
                correctArry:[],
                atchKnow:{
                    excelPathTip:'',
                    errorMessage:'',
                    excelPath:'',
                    filePath:'',
                    filePathNew:'',
                    excelPathTipNew:'',
                    excelPathNew:'',
                },
            };
        },
        computed: {
            groupId() {
                if (this.$route.path) {
                    const pathArr = this.$route.path.split('/');
                    return pathArr[pathArr.length - 1];
                }
                return '';
            },
        },
        methods: {
            close() {
                this.$emit('closeDrawer');
            },
            async uploadFile() {
                const param = {
                    id: this.groupId,
                    sourceType: 102,
                    excelTemplateType: 2,
                    filePath: this.atchKnow.excelPath,
                };

                if (!param.filePath) {
                    this.$message.error('必须上传文件');
                    return;
                }

                const { data } = await axios.post(`${this.$baseUrl}knowledge/saveBatchKnowledgeItem.json`, param);
                if (data.resultMessageEnum !== API_SUCCESS_CODE) {
                    this.$message.error('保存失败');
                    return;
                }
                this.$emit('uploadSuccess')
            },

            downloadTemplate() {
                window.location.href = `${baseHost}/download-static-file/knowledgeItemTemplate.xlsx`;
            },

            uploadAnnexFile(id){
                const oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#'+id)[0].files[0]);
                $.ajax({
                    url: this.$baseUrl + 'common/uploadAnnexFile.json',
                    type: 'POST',
                    cache: false,
                    data: oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false,
                }).done((res) => {
                    if(res.resultMessageEnum === '0000'){
                        if(this.upload_img_index >- 1){
                            this.correctArry[this.upload_img_index].excelPathTip = this.correctArry[self.upload_img_index].filePath;
                            this.correctArry[this.upload_img_index].excelPath = res.returnObject;
                        }else{
                            this.atchKnow.excelPathTip = this.atchKnow.filePath;
                            this.atchKnow.excelPath = res.returnObject;
                        }
                        this.checkAnnexFile();
                    }else{
                        this.$message.error('上传失败！');
                    }
                }).fail(function(res) {

                });
            },

            checkAnnexFile(){
                let data = {
                    excelTemplateType:2
                };
                if(this.upload_img_index>-1){
                    data.filePath=this.correctArry[this.upload_img_index].excelPath;
                }else{
                    data.filePath = this.atchKnow.excelPath;
                }

                $.post(this.$baseUrl+'common/checkAnnexFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        let list= {};
                        if(!res.returnObject.correctFlag){
                            let msg = `${res.returnObject.rowNumber-res.returnObject.exceptionRowNumber}条上传成功，剩余${res.returnObject.exceptionRowNumber}条上传失败！`
                            if(this.correctArry.length>0){
                                this.correctArry[this.upload_img_index].errorMessage = msg
                            }else{
                                this.atchKnow.errorMessage = msg;
                            }
                            const iTemp = (~~(Math.random()*100000)).toString();
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
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
        },
    };
</script>

<style lang="less" scope>
  .red{
    color: #ff0000;
  }
  .blue{
    color: #1890FF;
  }

  .block {
    .batch-group {
      margin-top: 10px;
      .title {
        display: flex;
        align-items: center;
        .circle {
          width: 32px;
          height: 32px;
          background-color: #5292f6;
          border-radius: 16px;
          color: #fff;
          line-height: 32px;
          text-align: center;
          font-size: 20px;
        }
        .title-text {
          margin-left: 10px;
        }
      }
      .content-group {
        display: flex;
        padding-bottom: 50px;
        position: relative;
        .column {
          height: calc(100% - 10px);
          width: 2px;
          border-radius: 5px;
          background: #5292f6;
          position: absolute;
          margin: 10px 0 0 16px;
        }
        .content-item {
          margin-left: 30px;
        }
        .download-button {
          margin-top: 20px;
        }
      }
    }
    .batch-footer-button:nth-of-type(2) {
      margin-left: 5px;
    }
  }
</style>

<style lang="less">
.el-form-item__content{
  .file-btn {
    position: relative;
    width: 88px;
    padding: 0 15px;
    margin: 20px 0 0 30px;
    background: rgb(236, 245, 255);


    #file{
      position:absolute;
      width: 100%;
      height: 100%;
      left:0;
      top:0;
      opacity: 0;
    }

    .el-input {
      height: 33px;
      z-index: 9;
    }

    .upload-span {
        position: absolute;
        left: 32px;
        top: 13px;
        color: #409EFF;
    }
  }
}
</style>