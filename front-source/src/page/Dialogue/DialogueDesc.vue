<template>
    <div>
        <p class="bread-crumbs">
            <el-link class="return-back" :underline="false" type="primary" @click="$emit('return-back')">任务列表</el-link>
            <em>/</em>
            <span>任务详情</span>
        </p>
        <div class="recording-outer">
            <section>
                <h3>识别详情</h3>
                <div class="dialogue-recording recording-box">
                    <header>对话录音</header>
                    <div class="recording-box-main dialogue-recording-bfc">
                        <div class="recording-left">
                            <p>
                                <span>当前状态：</span>
                                <span class="play-status">{{channelStatus}}</span>
                            </p>
                            <div>
                                <a class="btn seat-btn" @click="channelSwitch('seat')" :disabled="!channel.seat.enable">坐席通道</a>
                                <a class="btn client-btn" @click="channelSwitch('client')" :disabled="!channel.client.enable">客户通道</a>
                            </div>
                        </div>
                        <div class="recording-right">
                            <Audio class="audio" :file="playAudioSource"></Audio>
                        </div>
                    </div>
                </div>
                <div class="dialogue-list recording-box">
                    <header>对话录音</header>
                    <div class="recording-box-main">
                        <ul class="dialogue-list-data">
                            <template v-for="item in recognitionContent">
                                <li v-if="item.role === 'Agent'" class="seat-dialogue">
                                    <i class="icon icon-robot"></i>
                                    <span class="tip">{{item.text}}</span>
                                </li>
                                <li v-else-if="item.role === 'User'" class="client-dialogue">
                                    <i class="icon icon-user"></i>
                                    <span class="tip">{{item.text}}</span>
                                </li>
                            </template>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
    import bus from '../../common/bus';
    import Audio from '../../ng-Audio/Audio.vue';

    export default {
        props: [
            'dialogueDesc',
        ],

        components: {
            Audio,
        },

        data() {
            return {
                recognitionContent: [],
                playAudioSource: '',
                viewPlaying: false,
                channelStatus: '',
                channel: {
                    dual: {
                        source: '',
                    },
                    seat: {
                        enable: true,
                        source: '',
                    },
                    client: {
                        enable: true,
                        source: '',
                    },
                },
                showPlayer: true,
            };
        },

        methods: {
            channelSwitch(type = '') {
                this.viewPlaying = false;
                if (type) {
                    this.channel[type].enable = !this.channel[type].enable;
                }

                this.showPlayer = true;
                if (this.channel.seat.enable && this.channel.client.enable) {
                    this.playAudioSource = this.channel.dual.source;
                    this.channelStatus = '双声道开启';
                    return;
                }

                if (this.channel.seat.enable) {
                    this.playAudioSource = this.channel.seat.source;
                    this.channelStatus = '仅打开坐席声道';
                    return;
                }

                if (this.channel.client.enable) {
                    this.playAudioSource = this.channel.client.source;
                    this.channelStatus =  '仅打开客户声道';
                    return;
                }

                this.showPlayer = false;
                this.playAudioSource = null;
                this.channelStatus = '暂无开启声道';
            }
        },

        created() {
            this.channel.dual.source = this.dialogueDesc.allSoundPath;
            this.channel.seat.source = this.dialogueDesc.agentSoundPath;
            this.channel.client.source = this.dialogueDesc.userSoundPath;
            this.recognitionContent = JSON.parse(this.dialogueDesc.recognitionContent);
            this.channelSwitch();
        }
    }
</script>

<style scoped lang="less">
    @font-color: #647184;
    @border-style: 1px solid rgba(222,226,230,1);

    .bread-crumbs {
        font-size: 14px;
        .return-back {
            vertical-align: baseline;
            line-height: 64px;
        }
        em {
            margin: 0 3px;
        }

        span {
            color: @font-color;
        }
    }

    .recording-outer {
        background: white;
        box-shadow: 1px 2px 5px 0 rgba(199,202,208,0.32);
        border-radius: 4px;
        section {
            padding-bottom: 30px;
        }
    }

    h3 {
        color: @font-color;
        font-size: 16px;
        padding: 16px 0 0 22px;
        font-weight: normal;
    }

    .recording-box {
        padding: 0 26px;
        margin-top: 48px;
        header {
            line-height: 45px;
            display: block;
            background: rgba(243,244,246,1);
            border-radius: 4px 4px 0 0;
            border: @border-style;
            font-size: 16px;
            color: @font-color;
            text-indent: 20px;
        }

        .recording-box-main {
            padding: 16px 20px;
            border-left: @border-style;
            border-right: @border-style;
            border-bottom: @border-style;
        }
    }

    .dialogue-recording {
        .dialogue-recording-bfc {
            height: 150px;
        }

        .recording-left {
            float: left;
            width: 180px;
            .btn {
                display: block;
                margin-left: 0;
                margin-top: 20px;
                width: 90px;
                height: 30px;
                color: white;
                text-align: center;
                line-height: 30px;
                border-radius: 4px;
                cursor: pointer;
                user-select: none;
                &[disabled] {
                    background: #C9D0D8;
                }
            }

            .play-status {
                color: #66b1ff;
            }

            .seat-btn {
                background: #F8AF2B;
            }

            .client-btn {
                background: #63A0FF;
            }
        }

        .recording-right {
            overflow: hidden;
            height: 100%;
            padding: 60px 105px 0 0;
        }
    }

    .dialogue-list {
        .dialogue-list-data {
            li {
                list-style: none;
                line-height: 36px;
                margin-top: 16px;
                height: 36px;
                span {
                    vertical-align: top;
                    margin-left: 8px;
                    max-width: 500px;
                    word-break:break-all;
                    color: #647184;
                }
                padding: 0;
            }
        }

        .icon {
            width: 32px;
            height: 32px;
            display: inline-block;
            border-radius: 4px;
            background-repeat: no-repeat;
            background-position: 5px;
        }

        .icon-user {
            background-image: url("/common-static/img/icons/icon_user.png");
            background-color: #4E8FF9;
        }

        .icon-robot {
            background-image: url("/common-static/img/icons/icon_robot.png");
            background-color: #F8AF2B;
        }

        .tip{
            line-height: 16px;
            position: relative;
            background: gray;
            display: inline-block;
            border-radius: 4px;
            padding: 8px 6px;
            &::before{
                position: absolute;
                left: -20px;
                top: 8px;
                content: '';
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
                border-left: 12px solid transparent;
                border-right: 12px solid gray;
            }
        }

        .seat-dialogue {
            .tip {
                background: #FEF7E9;
                &::before{
                    border-right: 12px solid #FEF7E9;
                }
            }
        }

        .client-dialogue {
            .tip {
                background: #EDF3FE;
                &::before{
                    border-right: 12px solid #EDF3FE;
                }
            }
        }
    }
</style>
