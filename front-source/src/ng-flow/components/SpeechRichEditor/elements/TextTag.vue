<template>
    <span
            contentEditable="false"
    >
        <span
                contentEditable="true"
                v-on="listeners"
                class="text-tag"
                @blur="blurHandler"
        ></span>
    </span>
</template>

<script>
    export default {
        computed: {
            listeners() {
                return { ...this.$listeners, input: this.onInput };
            }
        },

        mounted() {
            this.$el.childNodes[0].innerText = this.value.text;
        },

        watch: {
            value(newValue) {
                if (this.$el.childNodes[0].innerText !== newValue.text) {
                    this.$el.childNodes[0].innerText = newValue.text;
                }
            },
        },

        props: {
            value: {
                type: Object,
                default: () => {
                    return {
                        text: '',
                    };
                }
            },
        },

        methods: {
            onInput(e) {
                this.$emit("input", {
                    text: e.target.innerText,
                });
            },

            blurHandler() {
                if (this.value.text === '') {
                    this.$emit('destroy', this.$el);
                }
            },
        },
    }
</script>

<style lang="less" scoped>
    .text-tag {
        display: inline-block;
        line-height: 30px;
        outline-color: #a5cbff;
    }
</style>
