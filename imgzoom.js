var _defaultSettings = {
    // 缩放倍数
    'zoom': '1',
    'bigUrl': 'https://img12.360buyimg.com/n0/jfs/t1/752/16/3914/75219/5b99cbf9Eaf5e4069/fe59a5713cb36eb2.jpg',
    // 用于触发放大的事件
    'zoomTrigger':'mousemove', // doubleckick
    // 'zoomTrigger':'doubleclick', // doubleckick
    // 使用什么类型的放大镜
    // 'effectType':'aside', // magnifier| aside
    'effectType':'magnifier', // magnifier|aside|cover
    // 'effectType':'cover', // magnifier|aside|cover
    // 开始放大
    'onShow': null,
    // 放大中
    'onMove':null,
    // 放大结束
    'onHide': null,
    // 放大镜框的设置
    'magnifier': {
        '_class': 'magnifier'
    },
    // 预览容器设置
    'preview': {
        '_class': 'preview',
        'pos': 'left' // effectType aside 模式下生效
    }
}



// $el 图片元素

function ImageZoom($el, options) {
    this.settings = options;
    
    this.smallImgConWidth = null
    this.smallImgConHeight = null

    this.magnifierWidth = null
    this.magnifierHeight = null

    this.$el = $el
    this.$container = this.$el.parentNode

    this.$bigImg = null
    this.$preview = null
    this.$magnifier = null
    this.init()    
}

ImageZoom.setClassName = function($el, name) {
    var classNames = $el.className ? $el.className.split(' ') : []
    var temp = classNames.filter(function(item) {
        return item != name
    })
    $el.className = temp.length ? temp.join(' ') : name
}

ImageZoom.setStyle = function($el, style) {
    for(var i in style) {
        $el.style[i] = style[i]
    }
}

ImageZoom.prototype.init = function() {
    // 设置图片父容器的样式
    this.setContainerStyle()
    // 创建放大镜
    this.buildMagnifier()
    // 加载大图，并构建预览框
    this.loadBigImg()
}

ImageZoom.prototype.setContainerStyle = function() {
    this.$container.style.position = 'relative'
}

// 根据事件构建放大镜
ImageZoom.prototype.buildMagnifier = function() {
    this.buildMagnifier[this.settings.zoomTrigger].call(this)
}
ImageZoom.prototype.buildMagnifier.mousemove = function() {
    var $div = null
    // 普通的移动放大
    $div = document.createElement('div')
    ImageZoom.setClassName($div, this.settings.magnifier._class)
    ImageZoom.setStyle($div,{
        top:0,
        left:0,
        position:'absolute',
        display: 'none'
    })
    this.$container.appendChild($div)
    this.$magnifier = $div
}
ImageZoom.prototype.buildMagnifier.doubleclick = function() {
    this.$magnifier = null
}

// 加载大图
ImageZoom.prototype.loadBigImg = function() {
    var _this = this
    var $bigImg = document.createElement('img')
    $bigImg.style.position = 'absolute'
    $bigImg.onload = function() {
        // 加载
        _this.$bigImg = $bigImg
        // 绑定事件
        _this.bindEvent()
        // 构建预览
        _this.buildPreview()
    }
    $bigImg.onerror = function() {
        // 加载失败 不执行后面的放大效果
        throw 'big img load error'
    }
    $bigImg.src = this.settings.bigUrl
}

// 绑定事件

ImageZoom.prototype.bindEvent = function() {
    var _this = this
    var handleEnter = function() {
        ImageZoom.setStyle(this.$preview, {
            display: 'block'
        })
        ImageZoom.setStyle(this.$magnifier, {
            display: 'block'
        })
        this.settings.onShow && this.settings.onShow.call(this)
    }
    var handleLeave = function() {
        ImageZoom.setStyle(this.$preview, {
            display: 'none'
        })
        ImageZoom.setStyle(this.$magnifier, {
            display: 'none'
        })
        this.settings.onHide && this.settings.onHide.call(this)
    }
    this.$container.addEventListener('mouseenter', function(e){
        handleEnter.call(_this)
    }, false)
    this.$container.addEventListener('touchstart', function(e){
        e.preventDefault()
        handleEnter.call(_this)
    }, false)

    this.$container.addEventListener('mouseleave', function(e){
        handleLeave.call(_this)
    }, false)
    this.$container.addEventListener('touchend', function(e){
        e.preventDefault()
        handleLeave.call(_this)
    }, false)
    // 适配指定的事件
    this.compatibleEvent()

}

// 适配事件
ImageZoom.prototype.compatibleEvent = function() {
    var _this = this
    var zoomTrigger = this.settings.zoomTrigger

    switch (zoomTrigger) {
        case '':
        case 'mousemove':
            this.$container.addEventListener('mousemove', function(e){
                _this.compatibleEvent[zoomTrigger].call(_this, e)
                _this.settings.onMove && _this.settings.onMove.call(_this)
            },false)
            this.$container.addEventListener('touchmove', function(e){
                e.preventDefault()
                var touch = e.targetTouches[0];
                e.clientX = touch.pageX
                e.clientY = touch.pageY
                _this.compatibleEvent[zoomTrigger].call(_this, e)
                _this.settings.onMove && _this.settings.onMove.call(_this)
            },false)
        break
        case 'doubleclick':
            this.$container.addEventListener('doubleclick', function(e){
                _this.compatibleEvent[zoomTrigger].call(_this, e)
                _this.settings.onMove && _this.settings.onMove.call(_this)
            },false)
            this.$container.addEventListener('doubletap', function(e){
                _this.compatibleEvent[zoomTrigger].call(_this, e)
                _this.settings.onMove && _this.settings.onMove.call(_this)
            },false)
        break
    }
    
}

// 移动方式放大
ImageZoom.prototype.compatibleEvent.touchmove = ImageZoom.prototype.compatibleEvent.mousemove = function(e) {
    this.$container.style.cursor = 'move'
    var moveType = {
        aside: function(e) {
            var offsetLeft = this.$container.offsetLeft
            var offsetTop = this.$container.offsetTop

            // 计算出正确的坐标位置 0,0 . 基于 $wrap 的坐标系
            var clientX = e.clientX - offsetLeft
            var clientY = e.clientY - offsetTop

            // 边界校验
            var dampingClientX = clientX - this.$magnifier.clientWidth/2
            var dampingClientY = clientY - this.$magnifier.clientHeight/2

            var moveLeft = clientX - this.$magnifier.clientWidth/2;
            var moveTop = clientY - this.$magnifier.clientHeight/2;

            // spin 不能超越 父元素的边界
            if(dampingClientX <= 0) moveLeft = 0
            if(dampingClientX >= this.$container.clientWidth - this.$magnifier.clientWidth) moveLeft = this.$container.clientWidth - this.$magnifier.clientWidth

            if(dampingClientY <= 0) moveTop = 0
            if(dampingClientY >= this.$container.clientHeight - this.$magnifier.clientHeight) moveTop = this.$container.clientHeight - this.$magnifier.clientHeight

            // 移动 spin
            ImageZoom.setStyle(this.$bigImg, {
                left: moveLeft + "px",
                top: moveLeft + "px"
            })

            // 移动图片
            var bigImgWidth = this.$bigImg.clientWidth
            var bigImgHeight = this.$bigImg.clientHeight
            // 计算比例
            var rateX = moveLeft / this.$container.clientWidth
            var rateY = moveTop / this.$container.clientHeight

            // 根据比例移动图片
            ImageZoom.setStyle(this.$bigImg, {
                left: -rateX * bigImgWidth + 'px',
                top: -rateY * bigImgHeight + 'px'
            })
            
        },
        magnifier:function(e) {
            // 放大镜模式
            var offsetLeft = this.$container.offsetLeft
            var offsetTop = this.$container.offsetTop

            // 计算出正确的坐标位置 0,0 . 基于 $wrap 的坐标系
            var clientX = e.clientX - offsetLeft
            var clientY = e.clientY - offsetTop

            // 边界校验
            var dampingClientX = clientX
            var dampingClientY = clientY

            var moveLeft = clientX - this.$preview.clientWidth/2;
            var moveTop = clientY - this.$preview.clientHeight/2;

            // spin 不能超越 父元素的边界
            if(dampingClientX <= 0) moveLeft = -this.$preview.offsetWidth / 2
            if(dampingClientX >= this.$container.clientWidth) moveLeft = this.$container.clientWidth - this.$preview.clientWidth/2

            if(dampingClientY <= 0) moveTop = -this.$preview.offsetHeight / 2
            if(dampingClientY >= this.$container.clientHeight) moveTop = this.$container.clientHeight - this.$preview.clientHeight/2

            

            // 移动图片
            var bigImgWidth = this.$bigImg.clientWidth
            var bigImgHeight = this.$bigImg.clientHeight
            // 计算比例
            var rateX = clientX / this.$container.clientWidth
            var rateY = clientY / this.$container.clientHeight

            // 根据比例移动图片
            ImageZoom.setStyle(this.$bigImg, {
                left: -rateX * bigImgWidth + this.$preview.offsetWidth/2 + 'px',
                top: -rateY * bigImgHeight + this.$preview.offsetHeight/2 + 'px'
            })

            ImageZoom.setStyle(this.$preview, {
                left: moveLeft + "px",
                top: moveTop + "px"
            })
        },
        cover: function(e) {
            moveType.magnifier.call(this, e)
        }
    }
    
    moveType[this.settings.effectType].call(this, e)

}

// 双击方式放大
ImageZoom.prototype.compatibleEvent.doubleclick = function(e) {
    var offsetLeft = this.$container.offsetLeft
    var offsetTop = this.$container.offsetTop

    // 计算出正确的坐标位置 0,0 . 基于 $wrap 的坐标系
    var clientX = e.clientX - offsetLeft
    var clientY = e.clientY - offsetTop

    var moveLeft = clientX;
    var moveTop = clientY;

    // 移动图片
    var bigImgWidth = this.$bigImg.clientWidth
    var bigImgHeight = this.$bigImg.clientHeight
    
    // 计算比例
    var rateX = moveLeft / this.$container.clientWidth
    var rateY = moveTop / this.$container.clientHeight


    // 根据比例移动图片
    this.$bigImg.style.left = -rateX * bigImgWidth + 'px'
    this.$bigImg.style.top = -rateY * bigImgHeight + 'px'
}

// 不同类型的预览模式
ImageZoom.prototype.buildPreview = function() {
    var $div = document.createElement('div')
    var $previewDiv = document.createElement('div')

    this.$preview = $div

    ImageZoom.setClassName($div, this.settings.preview._class)
    ImageZoom.setStyle($div, {
        position : 'absolute',
        top : '0',
        left : '0',
        display: 'none'
    })
    ImageZoom.setStyle($previewDiv, {position : 'relative'})
    
    $previewDiv.appendChild(this.$bigImg)

    $div.appendChild($previewDiv)

    this.buildPreview[this.settings.zoomTrigger][this.settings.effectType].call(this)
    
}


ImageZoom.prototype.buildPreview.touchmove = ImageZoom.prototype.buildPreview.mousemove = {
    // 预览容器 magnifier 模式
    magnifier : function() {
        // 隐藏 spin
        ImageZoom.setStyle(this.$magnifier, {display: "none"})
        ImageZoom.setStyle(this.$preview, {left: '0px', top:'0px'})
        this.$container.appendChild(this.$preview)
    },
    // 预览容器 cover 模式
    cover : function() {
        ImageZoom.setStyle(this.$magnifier, {display: "none"})
        ImageZoom.setStyle(this.$container, {overflow: 'hidden'})
        ImageZoom.setStyle(this.$preview, {
            width: this.$bigImg.offsetWidth + 'px',
            Height: this.$bigImg.offsetHeight + 'px',
            left: this.$container.offsetLeft + 'px',
            top: this.$container.offsetTop + 'px'
        })
        this.$container.appendChild(this.$preview)
    },
    // 预览容器 aside 模式
    aside: function() {

        switch(this.settings.preview.pos) {
            case '':
            case 'left':
            case undefined:
                ImageZoom.setStyle(this.$preview, {
                    top: this.$container.offsetTop + 'px',
                    left: this.$container.offsetLeft + this.$container.offsetWidth + 'px'
                })
            break
            case 'top':
                ImageZoom.setStyle(this.$preview, {
                    top: this.$container.offsetTop - this.$preview.offsetHeight + 'px',
                    left: this.$container.offsetLeft + 'px'
                })
            break
            case 'right':
                ImageZoom.setStyle(this.$preview, {
                    top: this.$container.offsetTop + 'px',
                    left: this.$container.offsetLeft - this.$preview.offsetLeft + 'px'
                })
            break
            case 'bottom':
                ImageZoom.setStyle(this.$preview, {
                    top: this.$container.offsetTop + this.$container.offsetHeight + 'px',
                    left: this.$container.offsetLeft + 'px'
                })
            break
        }
        document.body.appendChild(this.$preview)
    }
}

ImageZoom.prototype.buildPreview.doubletap = ImageZoom.prototype.buildPreview.doubleclick = {
    // 预览容器 magnifier 模式
    magnifier : function() {
        ImageZoom.setStyle(this.$preview, {left: '0px', top:'0px'})
    },
    // 预览容器 cover 模式
    cover : function() {
        ImageZoom.setStyle(this.$preview, {
            width: this.$container.offsetWidth + 'px',
            Height: this.$container.offsetHeight + 'px',
            left: this.$container.offsetLeft + 'px',
            top: this.$container.offsetTop + 'px'
        })
    },
    // 预览容器 aside 模式
    aside: function() {
        return this
    }
}


ImageZoom.prototype.udpate = function() {

}

ImageZoom.prototype.destroy = function() {
    
}


var z = new ImageZoom(document.querySelector('#demo'), _defaultSettings)