<template>
    <div class="help-box">
        <p class="h1">云知声外呼协议</p>
    </div>
</template>

<script>

    export default {
        name: 'protocol',
        data() {
            return {
                
            }
        },

        created() {
            
        },
        computed: {
        },
        methods: {
            
        },
        destroyed(){
            
        }
    }

</script>

<style scoped lang="less">
    .help-box{
        background-color: #fff;
        padding:0px 80px 40px;
        line-height: 1.8;
        .h1{
            font-size: 24px;
            font-weight: bold;
            margin-bottom:20px;
            padding-top:40px;
        }
        .tit{
            font-size: 14px;
            font-weight: bold;
            padding-bottom: 10px;
        }
        .list{
            padding:10px 0 10px 18px;

        }
        .table{
            margin: 20px 0;
            border: 1px solid #ebeef5;
            th{
                text-align: left;
                padding: 10px 10px 10px;
                border-right:1px solid #ebeef5;
                border-bottom: 1px solid #ebeef5;
            }
            td{
                padding:8px 10px;
                border-right:1px solid #ebeef5;
                border-bottom: 1px solid #ebeef5;
            }
        }
        .red{
            color:#F56C6C;
        }
        .foot{
            line-height: 2.4;
        }
    }
</style>
