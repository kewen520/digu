<template>
    <ul v-if="isShow && (showDeleteButton || showAppendButton)">
        <li v-if="showDeleteButton" @click="$emit('deleteSpeech')">删除分话术</li>
        <li v-if="showAppendButton" @click="$emit('appendSpeech')">新增分话术</li>
    </ul>
</template>

<script>
    export default {
        props: {
            showDeleteButton: {
                type: Boolean,
                default: true,
            },
            showAppendButton: {
                type: Boolean,
                default: true,
            }
        },

        data() {
            return {
                isShow: false,
            };
        },

        methods: {
            toggle() {
                this.isShow = !this.isShow;
            },

            close() {
                this.isShow = false;
            }
        }
    }
</script>

<style lang="less" scoped>
    ul {
        width: 98px;
        background: rgba(255,255,255,1);
        box-shadow: 1px 2px 5px 0 rgba(199,202,208,0.44);
        border-radius: 4px;
        border: 1px solid rgba(222,226,230,1);
        line-height: 32px;

        li {
            list-style: none;
            &:hover {
                color: #4B8FFF;
            }
        }
    }
</style>
