<template>
    <div>
        <div class="rich-editor-outer" :disabled="!!disabled">
            <div
                    class="rich-editor"
                    :class="onDragging ? 'on-dragging' : ''"
                    :style="`min-height:${height};` "
                    v-on="listeners"
                    @paste="pastedHandler"
                    @click="clickHandler"
                    @keydown.space.prevent
                    @keydown.enter.prevent
                    @keydown="keyDownHandler"
                    @drop="dropHandler"
                    @dragover.prevent
                    @dragover="dragOver"
                    @dragenter="onDragging = true"
                    @dragleave="dragLeave"
                    ref="richEditor"
            >
                <component
                        v-for="(item, index) in value"
                        v-model="value[index].data"
                        v-bind:key="index"
                        class="rich-tag-component"
                        :is="item.component"
                        @destroy="(ele) => componentDestroy(item, ele)"
                >
                </component>
            </div>
        </div>
    </div>
</template>

<script>
    import AudioTag from './elements/AudioTag';
    import TextTag from './elements/TextTag';
    import { pastedJustAllowText, filterDomSpaceWrap, redrawZwnj, keepLastIndex } from './utils';
    import Vue from 'vue';

    export default {
        props: {
            height: {
                type: String,
                default: '100px',
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            value: {
                type: Array,
                default: () => {
                    return [];
                },
            }
        },

        components: {
            AudioTag,
            TextTag,
        },

        data() {
            return {
                onDragging: false,
                dragTimer: null,
            };
        },

        watch: {
            value: {
                handler(newValue) {
                    this.$emit('input', newValue);
                    this.$nextTick(() => {
                        this.mergeNearTextComponent();
                        redrawZwnj(this.$refs.richEditor);
                    })
                },
                immediate: true,
                deep: true
            }
        },

        computed: {
            listeners() {
                return { ...this.$listeners, input: this.onInput };
            }
        },

        methods: {
            mergeNearTextComponent() {
                for (let i = this.value.length - 1; i >= 0; i--) {
                    const item = this.value[i];
                    const nextItem = this.value[i - 1];
                    if (item.component === 'TextTag' && nextItem && nextItem.component === 'TextTag') {
                        Vue.set(this.value[i - 1], 'data', {
                            text: nextItem.data.text + item.data.text}
                        );

                        // 如果右侧出现控文本，需要直接把光标放到最右边
                        if (item.data.text === '') {
                            this.$nextTick(() => {
                                const childNodes = this.$refs.richEditor.childNodes;
                                const textComponent = Array.from(childNodes)
                                    .filter(node => node.nodeType === Node.ELEMENT_NODE)[i - 1]
                                    .childNodes[0];
                                keepLastIndex(textComponent);
                            })
                        }

                        this.value.splice(i, 1);
                    }
                }
            },

            /**
             * 组织在根节点的键盘事件
             */
            keyDownHandler(e) {
                if (e.target === this.$refs.richEditor) {
                    e.preventDefault();
                }
            },

            /**
             * 拖拽事件
             */
            dropHandler(e) {
                let message = e.dataTransfer.getData('message');
                if (!message) return;
                message = JSON.parse(message);
                switch (message.command) {
                    case 'appendComponent':
                        switch (message.data.component) {
                            case 'AudioTag':
                                this.appendAudioTag(message.data.data);
                                break;
                            default:
                        }
                        break;
                    default:
                }
                this.onDragging = false;
            },

            dragLeave() {
                this.dragTimer =  setTimeout(() => this.onDragging = false, 100)
            },

            dragOver() {
                clearTimeout(this.dragTimer);
            },

            /**
             * 点击事件
             */
            clickHandler() {
                const sel = window.getSelection();
                const baseNode = sel.baseNode;
                const ele = this.$refs.richEditor;
                // 如果点击是更根节点
                const innerHtml = (ele.innerHTML || '').trim();
                if (innerHtml === '' || (baseNode && baseNode.parentNode === ele)) {
                    // 获取点击位置在整体组件的位置
                    let componentIndex = 0;
                    let tmpNode = baseNode;
                    while((tmpNode = tmpNode.previousSibling) !== null) {
                        if (tmpNode.nodeType !== Node.TEXT_NODE) {
                            componentIndex++;
                        }
                    }

                    this.value.splice(componentIndex, 0, {
                        component: 'TextTag',
                        data: {
                            text: '',
                        },
                    });

                    const childNodes = ele.childNodes;
                    this.$nextTick(() => {
                        Array.from(childNodes)
                            .filter(node => node.nodeType === Node.ELEMENT_NODE)[componentIndex]
                            .childNodes[0]
                            .focus();
                    });
                }
            },

            /**
             * 输入触发事件
             */
            onInput() {
                filterDomSpaceWrap(this.$refs.richEditor);;
            },

            /**
             * 黏贴剪贴板事件
             */
            pastedHandler(e) {
                pastedJustAllowText(e);
            },

            /**
             * 销毁富文本组件
             */
            componentDestroy(currentItem, ele) {
                for (const [index, item] of this.value.entries()) {
                    if (item === currentItem) {
                        this.value.splice(index, 1);
                        break;
                    }
                }
            },

            /**
             * 像编辑器推入音频文件
             */
            appendAudioTag(data) {
                this.value.push({
                    component: 'AudioTag',
                    data: {
                        id: data.id,
                        fileName: data.fileName,
                        soundPath: data.soundPath,
                        soundContent: data.soundContent,
                        duration: data.duration,
                    },
                });
            },

            /**
             * 像编辑器推入text
             * @param data
             */
            appendTextTag(data) {
                this.value.push({
                    component: 'TextTag',
                    data: {
                        text: data.text,
                    },
                })
            }
        },
    }
</script>

<style lang="less" scoped>
    .rich-editor-outer {
        box-sizing: content-box;
        &[disabled]:before {
            position: absolute;
            content: "";
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin: 6px 66px 6px 10px;
            border-radius: 4px;
            background: black;
            display: block;
            opacity: 0.08;
        }
    }

    .rich-editor {
        box-sizing: border-box;
        padding: 5px 16px;
        line-height: 38px;
        border-radius:4px;
        border:1px solid #DEE2E6;
        word-break:break-all;

        &.on-dragging {
            border: 1px #4B8FFF solid;
        }
    }
</style>
