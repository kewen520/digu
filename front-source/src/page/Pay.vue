<template>
    <div>
        <div class="w-container log-form">
            <div id ="alipayContent">加载中...</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'baseform',
        data: function(){
            return {
                payVisible:false,
                htmlContent:'',
            }
        },
        created(){
            var id = this.$route.params.id;
            $.get(this.$baseUrl+'order/queryHtmlContent.json?cashOrderId='+id).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        $('#alipayContent').html(res.returnObject);
                        
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
        },
        methods: {
            
        }
    }
</script>
<style scoped>
.w-container{
    height: 400px;
    text-align: center;
    padding:60px 0;
}
</style>