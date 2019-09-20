<template>
    <el-scrollbar
            class="node-list"
            wrapClass="node-list-scroll"
            :native="false"
            :noresize="false"
    >
        <ul>
            <li
                    v-for="(item, index) in flowRobotNodes"
                    :class="index === tabIndex ? 'active' : ''"
                    @click="tabHander(index)"
            >
                {{item.label}}
            </li>
        </ul>
    </el-scrollbar>
</template>

<script>
    export default {
        props: {
            flowRobotNodes: {
                type: Array,
                default: () => {
                    return [];
                }
            },

            tabIndex: {
                type: Number,
                default: 0,
            },
        },

        methods: {
            tabHander(index) {
                this.$emit('tabNodeList', index);
            }
        },
    }
</script>

<style lang="less" scoped>
    .node-list {
        ul {
            padding: 12px 0;
            color: #647184;
            text-align: center;
            font-size: 14px;
            li {
                width: 110px;
                height: 30px;
                line-height: 30px;
                margin-left: 21px;
                list-style: none;
                display: block;
                text-align: center;
                cursor: pointer;
                border-radius: 4px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                &.active {
                    background: #F8AF2B;
                    color: white;
                }
            }
        }
    }
</style>

<style lang="less">
    .node-list-scroll {
        overflow-x: hidden;
    }
</style>
