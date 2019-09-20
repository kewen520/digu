<template>
    <span
            class="audio-tag"
            contentEditable="false"
    >
        {{value.soundContent}}{{"{" + value.fileName + "}"}}
        <i class="el-icon-close" @click.stop="deleteTag"></i>
    </span>
</template>

<script>
    export default {
        props: {
            value: {
                type: Object,
                default: () => {
                    return {
                        id: '',
                        fileName: '',
                        soundPath: '',
                        soundContent: '',
                        duration: '',
                    };
                }
            },
        },

        methods: {
            deleteTag() {
                this.$emit('destroy', this.$el)
            }
        },
    }
</script>

<style lang="less" scoped>
    .audio-tag {
        position: relative;
        display: inline-block;
        line-height: 30px;
        border: 1px #4B8FFF solid;
        border-radius:3px;
        color: #4B8FFF;
        padding: 0 33px 0 10px;
        margin: 0 10px;
        word-break:break-all;
        user-modify: read-only;
        user-select: none;
        background: #F5F9FF;
    }

    .el-icon-close {
        position: absolute;
        right: 11px;
        top: 9px;
        cursor: pointer;
    }
</style>
