! function () {
    var EventCenter = {
        on: function (type, handler) {
            $(document).on(type, handler)
        },
        fire: function (type, data) {
            $(document).trigger(type, data)
        }
    }

    var footer = {
        itemWidth: null,
        ulWidth: null,
        ulPosition: null,
        init: function () {
            this.$footer = $('footer')
            this.$box = $('.box')
            this.$ul = this.$footer.find('ul')
            this.canRight = true
            this.canLeft = false
            this.render()
            this.bind()

        },
        render: function () {
            $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php')
                .done((e) => {
                    this.renderFooter(e.channels)
                })
        },
        renderFooter: function (channels) {
            var html = ''
            channels.forEach(channel => {
                html = html + `
                <li data-channel-id='${channel.channel_id}' 
                data-channel-name='${channel.name}'>
                    <div class="cover"  
                    style="background-image:url(${channel.cover_small})"></div>
                    <h3>${channel.name}</h3>
                </li>  
                `
            })
            this.$ul.append(html)
            this.itemWidth = this.$ul.find('li').outerWidth(true)
            this.setStyle()
            this.ulWidth = parseFloat(this.$ul.css('width'))
            this.ulPosition = parseFloat(this.$ul.css('left'))
        },
        setStyle: function () {
            var number = this.$ul.find('li').length
            this.$ul.css({
                width: number * this.itemWidth
            })
        },
        bind: function () {
            $('.right').on('click', () => {
                if (this.canRight) {
                    this.canRight = false
                    this.$ul.animate({
                        left: '-=' + 3 * this.itemWidth
                    }, 400, () => {
                        this.ulPosition = parseFloat(this.$ul.css('left'))
                        this.canLeft = true
                        if (this.$box.width() - this.ulWidth >= this.ulPosition) {
                            this.canRight = false
                        } else {
                            this.canRight = true
                        }
                    })
                }
            })
            $('.left').on('click', () => {
                if (this.canLeft) {
                    this.canLeft = false
                    this.$ul.animate({
                        left: '+=' + 3 * this.itemWidth
                    }, 400, () => {
                        this.ulPosition = parseFloat(this.$ul.css('left'))
                        this.canRight = true
                        if (this.ulPosition >= -1) {
                            this.canLeft = false
                        } else {
                            this.canLeft = true
                        }
                    })
                }

            })
            this.$footer.on('click', 'li', function () {
                $(this).addClass('active')
                    .siblings().removeClass('active')
                EventCenter.fire('select-albumn', {
                    channelId: $(this).attr('data-channel-id'),
                    channelName: $(this).attr('data-channel-name')
                })
            })
        },
    }

    var fm = {
        loves: {},
        channelId: '',
        channelName: '随机播放',
        lyricObj: null,
        init: function () {
            this.view = $('main')
            this.audio = new Audio()
            this.audio.autoplay = true
            this.loves = JSON.parse(localStorage.getItem('Loves'))
            if (this.loves !== null && !$.isEmptyObject(this.loves)) {
                this.channelId = 'mylove'
                this.channelName = 'MyLove'
                $('.btn-heart').addClass('like')
            }
            this.bind()
            this.render()
        },
        render: function () {
            this.loadMusic()
        },
        bind: function () {
            var _this = this
            EventCenter.on('select-albumn', (e, channelObj) => {
                if (channelObj.channelId === 'mylove') {
                    if (this.loves !== null && !$.isEmptyObject(this.loves)) {
                        this.channelId = channelObj.channelId
                        this.channelName = channelObj.channelName
                        $('.btn-heart').addClass('like')
                        this.loadMusic()
                        $('.btn-play').addClass('none')
                        $('.btn-pause').removeClass('none')
                    }
                } else {
                    this.channelId = channelObj.channelId
                    this.channelName = channelObj.channelName
                    $('.btn-heart').removeClass('like')
                    this.loadMusic()
                    $('.btn-play').addClass('none')
                    $('.btn-pause').removeClass('none')
                }
            })
            $('.btn-heart').on('click', () => {
                if (this.loves === null) {
                    this.loves = {}
                }
                if (this.loves.hasOwnProperty(this.song.sid)) {
                    delete this.loves[this.song.sid]
                    var data = JSON.stringify(this.loves)
                    window.localStorage.setItem('Loves', data)
                } else {
                    this.loves[this.song.sid] = this.song
                    var data = JSON.stringify(this.loves)
                    window.localStorage.setItem('Loves', data)
                }
                $('.btn-heart').toggleClass('like')
            })
            $('.btn-play').on('click', () => {
                this.audio.play()
                $('.btn-play').addClass('none')
                $('.btn-pause').removeClass('none')
            })
            $('.btn-pause').on('click', () => {
                this.audio.pause()
                $('.btn-pause').addClass('none')
                $('.btn-play').removeClass('none')
            })
            $('.btn-next').on('click', () => {
                this.loadMusic()
                $('.btn-play').addClass('none')
                $('.btn-pause').removeClass('none')
            })
            $('.bar').on('click', function (e) {
                var barLeft = $('.bar').offset().left
                var clientX = e.clientX
                var barWidth = this.offsetWidth
                var newPosition = (clientX - barLeft) / barWidth * 100
                $('.bar-progress').css('width', newPosition + '%')
                _this.audio.currentTime = newPosition / 100 * _this.audio.duration
                _this.updateStatus()
            })

            this.audio.addEventListener('play', () => {
                clearInterval(this.statusClock)
                this.statusClock = setInterval(() => {
                    this.updateStatus()
                }, 1000)
            })
            this.audio.addEventListener('pause', () => {
                clearInterval(this.statusClock)
            })
            this.audio.addEventListener('ended', () => {
                this.loadMusic()
            })
        },
        loadMusic: function () {
            if (this.channelId === 'mylove') {
                var song = []
                for (let key in this.loves) {
                    if (this.loves.hasOwnProperty(key)) {
                        song.push(this.loves[key])
                    }
                }
                this.index = Math.floor(Math.random() * (song.length))
                this.song = song[this.index]
                if (this.song) {
                    $('.btn-heart').addClass('like')
                    this.setMusic()
                    this.loadLyric()
                }
            } else {
                var url = 'https://jirenguapi.applinzi.com/fm/getSong.php?channel=' + this.channelId
                $.getJSON(url)
                    .done((song) => {
                        if (!song.url) {
                            $('.btn-heart').removeClass('like')
                            this.song = song.song[0]
                            this.setMusic()
                            this.loadLyric()
                        }
                    })
            }
        },
        setMusic: function () {
            this.audio.src = this.song.url
            $('.bg-picture').css('background-image', 'url(' + this.song.picture + ')')
            this.view.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')')
            this.view.find('.detail h1').text(this.song.title)
            this.view.find('.detail .author').text(this.song.artist)
            this.view.find('.detail .tag').text(this.channelName)
        },
        updateStatus() {
            var min = Math.floor(this.audio.currentTime / 60) + ''
            var second = Math.floor(this.audio.currentTime % 60) + ''
            second = second.length === 2 ? second : '0' + second
            this.view.find('.current-time').text(min + ':' + second)
            this.view.find('.bar-progress').css(
                'width', this.audio.currentTime / this.audio.duration * 100 + '%'
            )
            if (this.lyricObj) {
                var showingLyric = this.lyricObj['0' + min + ':' + second]
                if (showingLyric) {
                    this.view.find('.lyric > p').text(showingLyric)
                }
            } else {
                this.view.find('.lyric > p').text('暂无此歌曲歌词')
            }
        },
        loadLyric() {
            var url = 'https://jirenguapi.applinzi.com/fm/getLyric.php?&sid=' + this.song.sid
            this.lyricObj = null
            $.getJSON(url).done((lyric) => {
                var lyric = lyric.lyric
                var lyricObj = {}
                lyric.split('\n').forEach(function (line) {
                    var times = line.match(/\d{2}:\d{2}/g)
                    var str = line.replace(/\[.+?\]/g, '')
                    if (Array.isArray(times)) {
                        times.forEach(function (time) {
                            lyricObj[time] = str
                        })
                    }
                })
                this.lyricObj = lyricObj
            })
        },
    }
    footer.init()
    fm.init()
}()