var winOpener = window.opener;
const soundConfigGroupType = {
		'speech':1,
		'knowledge':2,
};
var soundVue = new Vue({
	el: '#_soundEl',
	data: {
        select_word:'',
        filePath:'',
        importFile:'',
        disabled:true,
        videoVisible:false,
        viewSource:'',
        viewPlaying:false,
        viewPlayValue:0,
        videoPlay:true,
        soundPath:'',
        currentMusic:{
            duration:0,
            currentTime:0,
            durationShow:true
        },
        removeSoundVisible:false,
        uploadVisible:false,
        removeSoundInfo:{
            name:''
        },
        height:500,
        cur_page:1,
        itemActive:0,
        delVisible:false,
        del_disabled:true,
        multipleSelection:[],
        configGroupMenu:[],
        configGroupIdData:[],
        videoStatus:false,
        pagination: {
            show: true,
            total: 0,
            pageIndex: 1,
            pageSize: 10
        },	
        useVisible:false,
        useRow:null,
        speechMenu:[],
        knowledgeMenu:[],
        activeGroupType:'speech',
        openeds:['1']
	},
	created: function(){
        // 计算table 高度
        var clintHeight = document.documentElement.clientHeight;
        this.height = clintHeight - 230;
        this.querySoundConfigGroupList();
	},
    computed: {
        fileName(){
            return this.$store.getters.getFile
        }
     },
     beforeRouteEnter(to,form,next){
         next();
     },			
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
         // 返回
         goBack(){
        	 window.close();
         },
		showUseConfirmDialog(row){
			this.useVisible = true;
			this.useRow = row;
		},
		setActiveGroupType(type){
			this.activeGroupType = type;
		},
         // 使用音频
         use(){
			let row = this.useRow;
			// 知识库设置
			if (winOpener.$.utils._dialogVue.knowledgeVisible) {
				let content = (typeof row.soundContent != 'undefined' ? row.soundContent : '') + '{' + row.fileName + '}';
				winOpener.$.utils._dialogVue.knowledgeForm.hungupSpeechcraftContent += content;
				let jqobj = winOpener.$('#hungup-speechcraft-content').children('.' + winOpener._style);
				soundVue.configGroupIdData.forEach(element => {
					if(element.id === row.id){
						jqobj.insertArCaret(jqobj, winOpener.$.utils.createRemovableTag(element));
						return false;
					}
				});
				winOpener.richEditor.bindEvent(winOpener._style);						
			}
			// 话术编辑器
			else {
			 	winOpener.$.utils._speechcraftContent[winOpener.$.utils._flowTypeName].forEach((elem) => {
			 		let flowTypeName = winOpener.$.utils._flowTypeName;
			 		let editableTabsName = winOpener.$.utils._speechcraftContentVue.editableTabsName;
					if(elem.name === editableTabsName){
						let content = (typeof row.soundContent != 'undefined' ? row.soundContent : '') + '{' + row.fileName + '}';
						elem.content += content;
						let id = '_' + flowTypeName + '-' + editableTabsName;
						let jqobj = winOpener.$('#' + id).children('.' + winOpener._style);
						jqobj.insertArCaret(jqobj, winOpener.$.utils.createRemovableTag(row));
						winOpener.richEditor.bindEvent(winOpener._style, winOpener.$.utils._speechcraftContentVue.isDisabled);
					} 
				});							
			}
			this.goBack();
         },
         uploadBtn(){
        	 this.uploadVisible = true;
         },
         draggableStart(type){
        	 this.activeGroupType = type;
             this.oldConfigGroupMenu = this.configGroupMenu;
         },
         // 移动结束
         draggableEnd(param){
             let sortData = [];
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
            	 this.querySoundConfigItemList(this.configGroupMenu[this.itemActive],this.itemActive);

             });        	 
         },
         // 排序
         sortSoundConfigGroup(list){
            var dtd = $.Deferred();
			$.ajax({
				type : 'POST',
				url : _baseUrl + '/services/sound/sortSoundConfigGroup.json',
				dataType : 'json',
				contentType : 'application/json',
				data : JSON.stringify(list),
				async: false
			}).then((res) => {
					if (res.resultMessageEnum == "0000") {
						dtd.resolve();														
					} else if(res.resultMessageEnum == "0001"){
						soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
					}
			});	                 
            return dtd;
         },
         // 查询录音文件夹列表
         querySoundConfigGroupList(){
             $.get(_baseUrl + '/services/sound/querySoundConfigGroupList.json').then((res)=>{
                 if(res.resultMessageEnum=='0000'){
                     let newData = res.returnObject;
                     if(newData && newData.length){
                         newData.forEach(el => {
                             el.isEdit = false;
                             el.show = false;
                         });
                         soundVue.configGroupMenu = newData;
                         newData.forEach((item,index)=>{
                             item.index = index;
                             if(item.soundConfigGroupType==1){
                            	 soundVue.speechMenu.push(item)
                             }else{
                            	 soundVue.knowledgeMenu.push(item);
                             }
                         })                         
                         soundVue.querySoundConfigItemList(newData[0],0);
                     }
                     
                 }else{
                     soundVue.$message.error(res.errorInfoList[0].errorMessage);
                 }
             })
         },  
         //添加录音配置文件明细列表
         modifySoundConfigGroup(item,index){
             if(!item.configGroupName){
                 if(item.newAdd){
                	 /*this.configGroupMenu.splice(index,1);*/
                 }else{
                	 this.removeSoundVisible = true;
                	 this.removeSoundInfo=item;
                	 this.removeSoundInfo.index = index;
                 }
                 this.$message.warning('请输入文件夹名称！');
                 return false;
             }
             // 如果为新添加的
             if(item.newAdd){
                 let data={
                     configGroupName:item.configGroupName,
                     soundConfigGroupType:soundConfigGroupType[soundVue.activeGroupType]
                 }
				$.ajax({
					type : 'POST',
					url : _baseUrl + '/services/sound/addSoundConfigGroup.json',
					dataType : 'json',
					contentType : 'application/json',
					data : JSON.stringify(data),
					async: false
				}).then((res) => {
						if (res.resultMessageEnum == "0000") {
                             soundVue.configGroupMenu[item.index].newAdd = false;
                             soundVue.configGroupMenu[item.index].show = false;
                             soundVue.configGroupMenu[item.index].isEdit = false;
                             soundVue.configGroupMenu[item.index].id = res.returnObject;
                             if(soundVue.configGroupMenu.length==1){
                                 soundVue.querySoundConfigItemList(soundVue.configGroupMenu[0],0);
                             }
                             soundVue.$message.success('添加成功！');													
						} else if(res.resultMessageEnum == "0001"){
							soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
						}
				});	                     
             }else{
             // 否则为修改
                 let data={
                     id:item.id,
                     configGroupName:item.configGroupName
                 }
				$.ajax({
					type : 'POST',
					url : _baseUrl + '/services/sound/modifySoundConfigGroup.json',
					dataType : 'json',
					contentType : 'application/json',
					data : JSON.stringify(data),
					async: false
				}).then((res) => {
						if (res.resultMessageEnum == "0000") {
                             soundVue.configGroupMenu[item.index].show = false;
                             soundVue.configGroupMenu[item.index].isEdit = false;
                             soundVue.$message.success('修改成功！');												
						} else if(res.resultMessageEnum == "0001"){
							soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
						}
				});	                 
             }
         },
         deletSound(item,index){
        	 this.removeSoundVisible = true;
        	 this.removeSoundInfo=item;
        	 this.removeSoundInfo.index = index;
         },
         // 新建分类
         addGroup(){
             let item = {
                     newAdd:true,
                     isEdit:true,
                     show:true,
                     configGroupName:''
                 }

             if(this.activeGroupType=='speech'){
                 this.speechMenu.push(item);
             }
             if(this.activeGroupType=='knowledge'){
                 this.knowledgeMenu.push(item);
             }

             this.configGroupMenu = this.speechMenu.concat(this.knowledgeMenu);
             this.setIndex()        	 
             soundVue.$nextTick(() => {
		    		$('.repository-menu-box').getNiceScroll().resize();       	    			
	    		});             
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
         // 删除分类
         removeSoundConfigGroup(){
        	 this.removeGroupId = this.removeSoundInfo.id;
        	 this.removeGroupIndex = this.removeSoundInfo.index; 
             let data={
                 soundConfigGroupId:this.removeGroupId
             }
             $.post(_baseUrl + '/services/sound/removeSoundConfigGroup.json?soundConfigGroupId='+data.soundConfigGroupId).then((res)=>{
                 if(res.resultMessageEnum=='0000'){
                     if(this.activeGroupType=='speech'){
                         soundVue.speechMenu.splice(soundVue.removeGroupIndex,1);
                     }
                     if(this.activeGroupType=='knowledge'){
                         soundVue.knowledgeMenu.splice(soundVue.removeGroupIndex,1);
                     }
                     soundVue.$message.success('删除成功！');
                     soundVue.removeSoundVisible = false;
                     if(soundVue.removeGroupIndex==soundVue.itemActive){
                         soundVue.querySoundConfigItemList(soundVue.configGroupMenu[0],0);
                     }
                 }else{
                     soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
                 }
             });
         },

         // 查询录音配置文件明细列表
         querySoundConfigItemList(item,index,type){
             // unclassified 未分类
             let data={
                 currentPage:this.cur_page-1,
                 pageSize:this.pagination.pageSize
             };
             if(item && item.id){
                 data.configGroupId = item.id
             }else{
                 data.configGroupId = this.activeGroupId;
             }
             if(this.select_word){
                 data.queryKey=this.select_word;
             }
             if (type) {
            	 this.activeGroupType = type;
			}
			$.ajax({
				type : 'POST',
				url : _baseUrl + '/services/sound/querySoundConfigItemList.json',
				dataType : 'json',
				contentType : 'application/json',
				data : JSON.stringify(data),
				async: false
			}).then((res) => {
					if (res.resultMessageEnum == "0000") {
                         let data = res.returnObject.recordList;
                         if(typeof index != 'undefined'){
                             soundVue.itemActive=index;
                         }
                         // 记录当前分类数据
                         if(item){
                             soundVue.activeGroupId = item.id;
                             soundVue.activeGroupName = item.groupName;
                         }
                         if(data.length){
                             soundVue.disabled = false;
                             data.forEach((list,index)=>{
                                 list.edit= false;
                             });
                         }else{
                             soundVue.disabled = true;
                         }
                         soundVue.configGroupIdData = data;
                         soundVue.pagination.total = res.returnObject.totalNumber;	
                         soundVue.$nextTick(() => {
        		    		// 设置文件夹滚动条
        		    		$('.el-table__body-wrapper').niceScroll({cursorcolor: '#CCC',cursorborder:'0px',zindex:"auto",autohidemode:true});
        		    		// 设置音频列表滚动条
        		    		$('.repository-menu-box').niceScroll({cursorcolor: '#CCC',cursorborder:'0px',zindex:"auto",autohidemode:true});        	    			
        	    		});			                         
					} else if(res.resultMessageEnum == "0001"){
						soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
					}
			});		                 
         },
         search() {
             if(!this.select_word){
            	 this.$message.error("请输入音频名称或文本！");
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
         },
         // .修改录音文件明细
         modifySoundConfigItem(index, row){
             let data={
                 id:row.id,
             }
             if(this.configGroupIdData[index].soundContent){
                 data.soundContent = this.configGroupIdData[index].soundContent
             }
			$.ajax({
				type : 'POST',
				url : _baseUrl + '/services/sound/modifySoundConfigItem.json',
				dataType : 'json',
				contentType : 'application/json',
				data : JSON.stringify(data),
				async: false
			}).then((res) => {
					if (res.resultMessageEnum == "0000") {
                         soundVue.configGroupIdData[index].edit = false;
                         soundVue.$message.success('修改成功！');												
					} else if(res.resultMessageEnum == "0001"){
						soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
					}
			});	                 
         },
         // 删除录音文件明细列表
         removeSoundConfigItemList(){
             let data = [];
             this.multipleSelection.forEach(item=>{
                 data.push(item.id);
             })
			$.ajax({
				type : 'POST',
				url : _baseUrl + '/services/sound/removeSoundConfigItemList.json',
				dataType : 'json',
				contentType : 'application/json',
				data : JSON.stringify(data),
				async: false
			}).then((res) => {
					if (res.resultMessageEnum == "0000") {
                         soundVue.delVisible = false;
                         soundVue.querySoundConfigItemList();
                         soundVue.$message.success('删除成功！');												
					} else if(res.resultMessageEnum == "0001"){
						soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
					}
			});		                 
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
         // 批量上传录音文件
         uploadSoundFileList(){
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
                 if(ext!=".wav"){
                     this.$message.error('文件格式错误,重新选择！');
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
                 url: _baseUrl + '/services/sound/uploadSoundFileList.json',
                 type: 'POST',
                 cache: false,
                 data:oMyForm,
                 dataType: "json",
                 headers : {'Content-Type':'multipart/form-data'},
                 processData: false,
                 contentType: false,
                 async: false
             }).then((res) => {
                 if(res.resultMessageEnum=='0000'){
                	 soundVue.$message.success('上传成功！');
                	 soundVue.querySoundConfigItemList(soundVue.configGroupMenu[soundVue.itemActive],soundVue.itemActive);
                 }else{
                	 this.$message.error('上传失败！');
                 }
             });

             
         },
         changeFileType(){
             $('#file').val('');
         },
         // 创建录音Excel下载文件
         createSoundConfigItemExcelFile(){
             var data={
                 soundConfigGroupId:this.activeGroupId
             }
			$.ajax({
				type : 'POST',
				url : _baseUrl + '/services/file/createSoundConfigItemExcelFile.json',
				dataType : 'json',
				contentType : 'application/json',
				data : JSON.stringify(data),
				async: false
			}).then((res) => {
					if (res.resultMessageEnum == "0000") {
                         window.location.href = _baseUrl + '/services/file/downloadFile.html?filePath='+res.returnObject.filePath;
                         soundVue.$message.success('下载成功！');												
					} else if(res.resultMessageEnum == "0001"){
						soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
					}
			});		                 
         },
         // 上传录音Excel文件
         importSoundConfigItemExcelFile(){
             let self = this;
             var oMyForm = new FormData();
             oMyForm.append("configGroupId", this.activeGroupId);
             oMyForm.append("file", $('#importFile')[0].files[0]);
             this.changeExcelFile();
             $.ajax({
                 url: _baseUrl + '/services/file/importSoundConfigItemExcelFile.json',
                 type: 'POST',
                 cache: false,
                 data:oMyForm,
                 dataType: "json",
                 headers : {'Content-Type':'multipart/form-data'},
                 processData: false,
                 contentType: false,
                 async: false
             }).then((res) => {
                 if(res.resultMessageEnum=='0000'){
                	 soundVue.$message.success('上传成功！');
                	 soundVue.uploadVisible = false;
                	 soundVue.querySoundConfigItemList(soundVue.configGroupMenu[soundVue.itemActive],soundVue.itemActive);                     
                 }else if(res.resultMessageEnum == "0001"){
                	 soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
                 }
                 
             });
         },
         changeExcelFile(){
             $('#importFile').val('');
         },
         handleVideo(index,row){
        	 this.videoVisible=true;
        	 this.$nextTick(() => {
        		 this.soundPath = row.soundPath;
        		 this.viewSource = _baseUrl + '/services/file/downloadFile.html?filePath=' + row.soundPath;
             });
         },
         //得到文件播放时长
         getFilePlayDuration(){
             return $.get(_baseUrl + '/services/file/getFilePlayDuration.json?filePath=' + this.soundPath).then((res)=>{
                 if(res.resultMessageEnum=='0000'){
                     return res;
                 }else if(res.resultMessageEnum == "0001"){
                	 soundVue.$message.error(winOpener.$.utils.getErrorMessage(res.errorInfoList));
                 }
             });
         },         
         handlePlaying(){
             if(!this.viewSource){
                 this.$message.error('请选择要播放的节点！');
                 return false;
             }
             if(this.videoPlay){
                 this.videoPlay = false;
                 this.percentMusic();
                 setTimeout(()=>{
                     this.percentMusic();
                 },200);
                 this.$refs.w_audio.play();
             }else{
                 this.videoPlay = true;
                 this.$refs.w_audio.pause();
             }             
         },
          percentMusic(){
             let duration = this.$refs.w_audio.duration;
             let currentTime = this.$refs.w_audio.currentTime;

             this.getFilePlayDuration().then((res)=>{
                 if(res.returnObject){
                     duration = res.returnObject;
                 }

                 if(parseFloat(duration) && duration !='Infinity'){
                     this.currentMusic.duration = duration;
                 }else{
                     this.currentMusic.durationShow = false; 
                 }

                 this.$refs.w_audio.ontimeupdate = () => {
                	 let lduration = duration;
                     if (lduration <= 2) {
                    	 lduration = lduration / 2;
                     }
                     this.currentMusic.currentTime = this.$refs.w_audio.currentTime;
                     var value = this.currentMusic.currentTime && lduration ? this.currentMusic.currentTime / lduration*100 : 0;
                     this.viewPlayValue = value;

                 };
                 this.$refs.w_audio.onended = () => {
                     this.videoPlay = true;
                 }
                 
             })
         },
         barDown(val){
             this.$refs.w_audio.pause();
         },
         changeSlider(time){
             if(this.$refs.w_audio){
                 this.viewPlayValue = time;
                 this.currentMusic.currentTime = this.$refs.w_audio.currentTime = time*this.$refs.w_audio.duration/100;
                 this.$refs.w_audio.play();
             }
         },
         //批量使用音频
         batchUse(){
            console.log(this.multipleSelection)
             if (this.multipleSelection.length<=0){
                this.$message.error("使用异常");
             }
             winOpener.$.utils._speechcraftContent[winOpener.$.utils._flowTypeName].forEach((elem) => {
                 let flowTypeName = winOpener.$.utils._flowTypeName;
                 let editableTabsName = winOpener.$.utils._speechcraftContentVue.editableTabsName;
                 if(elem.name === editableTabsName){
                     for (var i in this.multipleSelection ){
                         let row = this.multipleSelection[i]
                         let content = (typeof row.soundContent != 'undefined' ? row.soundContent : '') + '{' + row.fileName + '}';
                         elem.content += content;
                         let id = '_' + flowTypeName + '-' + editableTabsName;
                         let jqobj = winOpener.$('#' + id).children('.' + winOpener._style);

                         jqobj.insertArCaret(jqobj, winOpener.$.utils.createRemovableTag(row));
                     }
                     winOpener.richEditor.bindEvent(winOpener._style, winOpener.$.utils._speechcraftContentVue.isDisabled);
                 }
             });
             this.goBack();
         }
     },
     filters: {
         //时间格式化
         format(value) {
             let minute = Math.floor(value / 60);
             let second = Math.floor(value % 60);
             return `${addZero(minute)}:${addZero(second)}`
         },
         formatDuration(value) {

             let other = value % 3600;
             let minutes = Math.floor(other / 60);
             let seconds = Math.floor(other % 60);
             return addZero(minutes) + ':' + addZero(seconds)
         }
     },     
     destroyed(){
     },
     props:{
     },
     mounted(){
     },     
     watch:{
         videoVisible(curVal){
             if(!curVal){
            	 this.videoPlay = true;
                 this.$refs.w_audio.pause();
             }
         },
     },
});
function addZero(val){
    if(val){
        return val = val <10?`0${val}`:val;
    }else{
        return '00';
    }
}