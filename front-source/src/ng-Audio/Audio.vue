<template>
    <div>
        <a
                v-if="disabled"
                :class="showSlider ? 'audio-icon' : 'audio-icon-no-float'"
                :style="!showSlider && iconSize ? `font-size:${iconSize}` : ''"
                class="audio-icon-disable el-icon-video-play"
        ></a>
        <a
                v-else-if="paused"
                :class="showSlider ? 'audio-icon' : 'audio-icon-no-float'"
                :style="!showSlider && iconSize ? `font-size:${iconSize}` : ''"
                class="el-icon-video-play"
                @click="play()"
        ></a>
        <a
                v-else
                :class="showSlider ? 'audio-icon' : 'audio-icon-no-float'"
                :style="!showSlider && iconSize ? `font-size:${iconSize}` : ''"
                class="el-icon-video-pause"
                @click="pause()"
        ></a>
        <span v-if="showSlider" class="time-info">
            <span>{{currentTime}}</span>
            <em>/</em>
            <em>{{duration}}</em>
        </span>
        <el-slider
                v-if="showSlider"
                class="slider"
                v-model="progress"
                @input="changeHandler"
                @change="changeHandler"
                :max="totalDuration"
                :format-tooltip="formatTooltip"
                :disabled="disabled"
        ></el-slider>
        <audio
                v-bind:id="playerId"
                :loop="innerLoop"
                ref="audiofile"
                :src="asyncFile || file"
                preload="auto"
                style="display:none;"
        ></audio>
    </div>
</template>

<script>
    export const baseVolumeValue = 7.5;
    let audio, uuid;

    export const prefixCls = 'vue-sound';

    export const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function (c) {
            let v, r;
            r = Math.random() * 16 | 0; v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
    };

    export const convertTimeHHMMSS = (val) => {
        let hhmmss = new Date(val * 1000).toISOString().substr(11, 8);
        return (hhmmss.indexOf('00:') === 0) ? hhmmss.substr(3) : hhmmss;
    };

    export default {
        name: 'vue-audio',
        props: {
            file: {
                type: String,
                default: null
            },
            autoPlay: {
                type: Boolean,
                default: false
            },
            loop: {
                type: Boolean,
                default: false
            },
            showSlider: {
                type: Boolean,
                default: true,
            },
            iconSize: {
                type: String,
                default: null,
            },
            asyncModeHandler: {
                type: Function,
                default: null
            },
        },

        computed: {
            duration: function () {
                return this.audio ? convertTimeHHMMSS(this.totalDuration) : ''
            },
            playerId: function () {
                return 'player-' + this.uuid
            },
            classes: function () {
                return prefixCls
            },
        },

        created() {
            if (this.asyncModeHandler) {
                this.disabled = false;
            }
        },

        watch: {
            file: function(val, oldValue) {
                if (val !== oldValue) {
                    this.stop();
                }
                if (!val) {
                    this.disabled = true;
                    this.totalDuration = 0;
                }
            },

            asyncFile: function(val, oldValue) {
                if (val !== oldValue && this.asyncFileList.length === 0) {
                    this.stop();
                }
                if (!val) {
                    this.disabled = true;
                    this.totalDuration = 0;
                }
            },

            asyncFileList: function(val, oldValue) {
                if (JSON.stringify(val) !== JSON.stringify(oldValue)) {
                    this.stop();
                }
                if (!val) {
                    this.disabled = true;
                    this.totalDuration = 0;
                }
            }
        },

        data () {
            return {
                isMuted: false,
                loaded: false,
                playing: false,
                paused: true,
                progress: 0,
                currentTime: '00:00',
                uuid: '0',
                innerLoop: undefined,
                audio: undefined,
                totalDuration: 0,
                hideVolumeSlider: false,
                volumeValue: baseVolumeValue,
                disabled: true,
                asyncFile: '',
                asyncFileList: [],
                asyncFileListIndex: 0,
            }
        },

        methods: {
            formatTooltip: function(val) {
                return convertTimeHHMMSS(val);
            },

            changeHandler: function(val) {
                if (parseInt(this.audio.currentTime, 10) !== val) {
                    this.audio.currentTime = val;
                }
            },

            setPosition: function name (e) {
                let tag = e.target;
                if (this.paused) return;

                if (e.target.tagName === 'SPAN') {
                    return;
                }
                const pos = tag.getBoundingClientRect();
                const seekPos = (e.clientX - pos.left) / pos.width;
                this.audio.currentTime = parseInt(this.audio.duration * seekPos);
            },

            updateVolume: function () {
                this.hideVolumeSlider = false;
                this.audio.volume = this.volumeValue / 100;
                if (this.volumeValue / 100 > 0) {
                    this.isMuted = this.audio.muted = false;
                }

                if (this.volumeValue / 100 === 0) {
                    this.isMuted = this.audio.muted = true;
                }
            },

            toggleVolume: function () {
                this.hideVolumeSlider = true;
            },

            stop: function () {
                this.playing = false;
                this.paused = true;
                this.audio.pause();
                this.audio.currentTime = 0;
            },

            play: async function () {
                if (this.playing && !this.paused) return;
                if (this.asyncModeHandler) {
                    const newFile = await this.asyncModeHandler();
                    if (newFile.length === 0) {
                        return;
                    }
                    if (this.asyncFile && JSON.stringify(newFile) === JSON.stringify(this.asyncFileList)) {
                        this.paused = false;
                    }
                    let asyncFile = '';
                    if (Array.isArray(newFile)) {
                        this.asyncFileList = newFile;
                        asyncFile = this.asyncFileList[this.asyncFileListIndex]
                    } else {
                        asyncFile = newFile;
                    }

                    if (asyncFile !== this.asyncFile) {
                        // 触发watch
                        this.asyncFile = asyncFile;
                        return;
                    }
                } else {
                    this.paused = false;
                }

                this.audio.play();
                this.playing = true;
            },

            pause: function () {
                this.paused = !this.paused;
                (this.paused) ? this.audio.pause() : this.audio.play();
            },

            changeLoop: function () {
                this.innerLoop = !this.innerLoop;
            },

            download: function () {
                this.stop();
                const file = this.asyncFile || this.file;
                if (file) {
                    window.open(this.asyncFile || this.file, 'download');
                }
            },

            mute: function () {
                this.isMuted = !this.isMuted;
                this.audio.muted = this.isMuted;
                this.volumeValue = this.isMuted ? 0 : 75;
            },

            _handleLoaded: function () {
                if (this.audio.readyState >= 2) {
                    if (this.autoPlay && !this.asyncFile) this.play();
                    this.loaded = true;
                    this.totalDuration = parseInt(this.audio.duration);
                    this.disabled = false;
                    if (this.asyncFile) {
                        this.audio.play();
                        this.playing = true;
                        this.paused = false;
                    }
                } else {
                    this.disabled = true;
                    throw new Error('Failed to load sound file');
                }
            },

            _handlePlayingUI: function (e) {
                let currTime = parseInt(this.audio.currentTime);
                this.progress = currTime;
                this.currentTime = convertTimeHHMMSS(currTime);
            },

            _handlePlayPause: function (e) {
                if (e.type === 'pause' && this.playing === false) {
                    this.progress = 0;
                    this.currentTime = '00:00';
                    this.paused = true;
                }
            },

            _handleStop: function(e) {
                if (e.type === 'ended') {
                    this.currentTime = '00:00';
                    if (this.asyncFileList.length > 0) {
                        if (this.asyncFileList.length > this.asyncFileListIndex + 1) {
                            this.asyncFileListIndex++;
                            this.asyncFile = this.asyncFileList[this.asyncFileListIndex];
                        } else {
                            this.asyncFileListIndex = 0;
                            this.paused = true;
                        }
                    } else {
                        this.paused = true;
                    }
                }
            },

            _handleError: function(e) {
                if (this.asyncFileList.length > 0) {
                    if (this.asyncFileList.length > this.asyncFileListIndex + 1) {
                        console.warn(`${this.asyncFile} can not play`);
                        this.asyncFileListIndex++;
                        this.asyncFile = this.asyncFileList[this.asyncFileListIndex];
                        return;
                    }
                }

                throw e;
            },

            init: function () {
                this.audio.addEventListener('timeupdate', this._handlePlayingUI);
                this.audio.addEventListener('loadeddata', this._handleLoaded);
                this.audio.addEventListener('pause', this._handlePlayPause);
                this.audio.addEventListener('play', this._handlePlayPause);
                this.audio.addEventListener('error', this._handleError);
                this.audio.addEventListener('ended', this._handleStop);
            },

            getAudio: function () {
                return this.$el.querySelectorAll('audio')[0];
            }
        },

        mounted: function () {
            this.uuid = generateUUID();
            this.audio = this.getAudio();
            this.innerLoop = this.loop;
            this.init()
        },

        beforeDestroy: function () {
            this.audio.removeEventListener('timeupdate', this._handlePlayingUI);
            this.audio.removeEventListener('loadeddata', this._handleLoaded);
            this.audio.removeEventListener('pause', this._handlePlayPause);
            this.audio.removeEventListener('play', this._handlePlayPause);
            this.audio.removeEventListener('ended', this._handleStop);
        }

    }
</script>

<style lang="less" scoped>
    .audio-icon {
        cursor: pointer;
        font-size: 30px;
        float: left;
        margin-top: 4px;
    }

    .audio-icon-no-float {
        cursor: pointer;
        font-size: 30px;
    }

    .audio-icon-disable {
        opacity: 0.3;
        cursor: not-allowed
    }

    .slider {
        margin: 0 130px 0 60px;
    }

    .time-info {
        color: #647184;
        float: right;
        margin-top: 10px;
        em {
            font-style: normal;
        }
    }

</style>
