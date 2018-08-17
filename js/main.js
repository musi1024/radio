!function(){
    var EventCenter = {
        on: function(type, handler){
            $(document).on(type, handler)
        },
        fire: function(type, data){
            $(document).trigger(type, data)
        }
    }

    var footer = {
        itemWidth: null,
        ulWidth: null,
        ulPosition: null,
        init: function() {
            this.$footer = $('footer')
            this.$box = $('.box')
            this.$ul = this.$footer.find('ul') 
            this.canRight = true
            this.canLeft = false
            this.render()
            this.bind()
        },
        render: function() {
            $.getJSON('http://api.jirengu.com/fm/getChannels.php')
                .done((e) => {
                    this.renderFooter(e.channels)
                })
        },
        renderFooter: function(channels) {
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
            this.$ul.html(html)
            this.itemWidth = this.$ul.find('li').outerWidth(true)  
            this.setStyle()   
            this.ulWidth = parseFloat(this.$ul.css('width'))
            this.ulPosition = parseFloat(this.$ul.css('left'))
        },
        setStyle: function() {
            var number = this.$ul.find('li').length
            this.$ul.css({
                width: number * this.itemWidth 
            }) 
        },
        bind: function() {
            $('.right').on('click', () => {
                var rowCount = Math.floor(this.$box.width()/this.itemWidth) 
                if (this.canRight) {
                    this.canRight = false
                    this.$ul.animate({  
                        left: '-=' + rowCount * this.itemWidth
                    },rowCount*100,() => {
                        this.ulPosition = parseFloat(this.$ul.css('left')) 
                        this.canLeft = true
                        if(this.$box.width()-this.ulWidth >= this.ulPosition) {
                            this.canRight = false
                        } else {
                            this.canRight = true
                        }
                    })
                }                  
            })
            $('.left').on('click', () => { 
                var rowCount = Math.floor(this.$box.width()/this.itemWidth) 
                if(this.canLeft) {
                    this.canLeft = false
                    this.$ul.animate({
                        left: '+=' + rowCount * this.itemWidth
                    },rowCount*100,() => {
                        this.ulPosition = parseFloat(this.$ul.css('left')) 
                        this.canRight = true  
                        console.log(this.ulPosition)
                        if(this.ulPosition >= -1) {
                            this.canLeft = false
                        } else {
                            this.canLeft = true
                        }
                    })
                }
                
            })
            this.$footer.on('click', 'li', function(){
                $(this).addClass('active')
                  .siblings().removeClass('active')
                EventCenter.fire('select-albumn',{
                    cannelId: $(this).attr('data-channel-id'),
                    channelName: $(this).attr('data-channel-name')  
                })          
            })
        },  
    }

    var fm = {
        channel_id: '',
        channelName: '随机播放',
        init: function() {
            this.view = $('main')
            this.audio = new Audio()
            this.audio.autoplay = true

            this.render()
            this.bind()
        },
        render: function() {
            this.loadMusic()
        },
        bind: function() {
            EventCenter.on('select-albumn', (e, channelObj) => {
                this.cannelId = channelObj.cannelId
                this.channelName = channelObj.channelName
                console.log(this.cannelId, this.channelName)
                this.loadMusic()
            })
            $('.btn-play').on('click', () => {
                $('.btn-play').addClass('none')
                $('.btn-pause').removeClass('none')
                this.audio.play()
            })
            $('.btn-pause').on('click', () => {
                this.audio.pause()
                $('.btn-pause') .addClass('none')
                $('.btn-play').removeClass('none')
            })
            $('.btn-next').on('click', () => {
                this.loadMusic()
            })
        },
        loadMusic: function() {
            var url = 'http://api.jirengu.com/fm/getSong.php?channel=' + this.cannelId
            $.getJSON(url).done((song) =>{
                this.song = song.song[0]
                this.setMusic()
            })
        },
        setMusic: function() {
            this.audio.src = this.song.url
            $('.bg-picture').css('background-image', 'url(' + this.song.picture + ')')
            this.view.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')')
            this.view.find('.detail h1').text(this.song.title)
            this.view.find('.detail .author').text(this.song.artist)
            this.view.find('.detail .tag').text(this.channelName)
            this.view.find('.btn-play').addClass('none')
            this.view.find('.btn-pause').removeClass('none')
        },
    }

    footer.init()
    fm.init()
}()