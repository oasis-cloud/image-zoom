

interface previewDefault {
    _class: string
    pos?: string
}
interface magnifierDefault {
    _class: string
}
interface MagnifierDefaults {
    zoom: number
    debug: boolean
    src: string
    trigger: string
    effect: string
    onShow(): void
    onHide(): void
    onMove(): void
    magnifier: magnifierDefault
    preview: previewDefault
}
const DEFAULTS: MagnifierDefaults = {
    zoom: 1,
    src: '',
    trigger: 'mousemove',
    effect: 'aside',
    debug: false,
    onShow: () => {},
    onHide: () => {},
    onMove: () => {},
    magnifier: {
        _class: 'magnifier',
    } as magnifierDefault,
    preview: {
        _class: 'magnifier',
        pos: 'left'
    } as previewDefault
}
export class Magnifier  {
    static NAME: string = 'Magnifier'
    static VERSION: string = '1.0.0'

    bigImgWidth:number = 0
    bigImgHeight:number = 0

    $img: ZeptoCollection = $(null)
    $container: ZeptoCollection = $(null)
    $magnifier: ZeptoCollection = $(null)
    $bigImg: ZeptoCollection = $(null)
    $preview: ZeptoCollection = $(null)

    // static one(_selector: string | HTMLElement, options?: MagnifierDefaults) {
    //     return new Magnifier(_selector, options)
    // }

    constructor(_selector: string | HTMLElement, options?: MagnifierDefaults) {
        // super(_selector, DEFAULTS, options)
        this.$el = $(_selector)
        
        this.setup()
        this.bindEvent()
    }

    setup() {
        console.dir(this)
        console.dir(this.cfg)
        this.$container = this.$el
        this.$img = this.$el.find('img')
        this.setWarpStyle()
        this.createMagnifier()
        this.loadBigPic()
    }
    setWarpStyle() {
        this.$container.css('position', 'relative')
    }
    createMagnifier() {
        let magnifierClass: string = this.cfg.magnifier._class
        let createMagnifier: any = {
            'mousemove': () => {
                this.$magnifier = $(`<div data-magnifier style="display:none;position:absolute;top:0;left:0"></div>`)
                this.$container.append(this.$magnifier)
            },
            'doubleclick': () => {}
        }
        createMagnifier[this.cfg.trigger].call(this)
    }
    loadBigPic() {
        let $bigImg:HTMLImageElement = document.createElement('img')
        $bigImg.onload = () => {
            // 加载
            console.log('big img loaded!')
            this.$bigImg = $($bigImg)
            this.bigImgWidth = $bigImg.width
            this.bigImgHeight = $bigImg.height
            $($bigImg).css('position', 'absolute')
            // 绑定事件
            this.bindEvent()
            // 构建预览
            this.buildPreview()
        }
        $bigImg.onerror = function() {
            // 加载失败 不执行后面的放大效果
            throw 'big img load error'
        }
        $bigImg.src = this.cfg.src
    }

    compatibleEvent() {
        let zoomTrigger: string = this.cfg.trigger

        let handleEvent:any = {
            mousemove: function (e:any) {
                let moveType:any = {
                    aside: (e:any, callback) => {
                        // 计算出正确的坐标位置 0,0 . 基于 $wrap 的坐标系
                        let clientX:number = e.pageX - this.$container.offset().left
                        let clientY:number = e.pageY - this.$container.offset().top
            
                        // 边界校验            
                        let moveLeft:number = clientX - this.$magnifier.width()/2;
                        let moveTop :number= clientY - this.$magnifier.height()/2;
            
                        // spin 不能超越 父元素的边界
                        if(moveLeft <= 0) moveLeft = 0
                        if(moveLeft >= this.$container.width() - this.$magnifier.width()) moveLeft = this.$container.width() - this.$magnifier.width()
            
                        if(moveTop <= 0) moveTop = 0
                        if(moveTop >= this.$container.height() - this.$magnifier.height()) moveTop = this.$container.height() - this.$magnifier.height()
            
                        // 移动 spin
                        this.$magnifier.css({
                            left: moveLeft + "px",
                            top: moveTop + "px"
                        })
            
                        // 移动图片
                        // 计算比例
                        let rateX:number = moveLeft / (this.$container.width() - this.$magnifier.width())
                        let rateY:number = moveTop / (this.$container.height() - this.$magnifier.height())
            
                        // 根据比例移动图片
                        this.$bigImg.css({
                            left: -rateX * (this.bigImgWidth - this.$preview.width()) + 'px',
                            top: -rateY * (this.bigImgHeight - this.$preview.height()) + 'px'
                        })

                        callback && callback.call(this, moveLeft, moveTop)
                        
                    },
                    magnifier: (e:any) => {
                        console.log('mouse move ....')
                        this.$magnifier.css({display:'none'})
                        // 计算出正确的坐标位置 0,0 . 基于 $container 的坐标系
                        let clientX:number = e.pageX - this.$container.offset().left
                        let clientY:number = e.pageY - this.$container.offset().top
            
                        // 边界校验            
                        let lensX:number = e.pageX - this.$preview.width()/2
                        let lensY :number= e.pageY - this.$preview.height()/2
                        
                        // 移动图片
                        // 计算比例
                        let zoomX:number = -clientX / (this.$container.width()) * (this.bigImgWidth - this.$preview.width()/2)
                        let zoomY:number = -clientY / (this.$container.height()) * (this.bigImgHeight - this.$preview.height()/2)

                        // this.$preview.css({
                        //     left: lensX+'px',
                        //     top: lensY+'px'
                        // })
                        // this.$bigImg.css({
                        //     left: zoomX+'px',
                        //     top: zoomY+'px'
                        // })
                    },
                    cover: (e:any) => {
                        
                    }
                }
                moveType[this.cfg.effect].call(this, e)
            },
            doubleclick: function(e:any) {

            }
        }
        let $container:HTMLElement = this.$container.get(0)
        switch (zoomTrigger) {
            case '':
            case 'mousemove':
                $container.addEventListener('mousemove', ()=>{
                    console.log('addEventListener mousemove ....')
                }, false)
                this.$container.mousemove((e:any) => {
                    console.log('mousemove .............')
                    console.log(this)
                    console.dir(this)
                    handleEvent[zoomTrigger].call(this, e)
                    this.cfg.onMove && this.cfg.onMove.call(this)
                })
            break
            case 'doubleclick':
                $container.addEventListener('doubleclick', (e:any) => {
                    handleEvent[zoomTrigger].call(this, e)
                    this.cfg.onMove && this.cfg.onMove.call(this)
                }, false)
            break
        }
    }
    bindEvent() {
        let $container:HTMLElement = this.$container.get(0)

        this.$container.mouseenter(() => {
            this.$preview.css('display', 'block')
            this.$magnifier.css('display', 'block')
            this.cfg.onShow && this.cfg.onShow.call(this)
        })

        this.$container.mouseleave((e) => {
            console.log(e.target)
            console.log(e.currentTarget)
            console.log('mouse leave ....')
            this.$preview.css('display', 'none')
            this.$magnifier.css('display', 'none')
            this.cfg.onHide && this.cfg.onHide.call(this)
        })
        // 适配指定的触发事件
        this.compatibleEvent()
    }
    buildPreview() {
        let previewType: any = {
            mousemove: {
                // 预览容器 magnifier 模式
                magnifier : () => {
                    // 隐藏 spin
                    this.$magnifier.css('display', 'none')
                    this.$preview.css({left: '0px', top:'0px'})
                    $('body').append(this.$preview)
                },
                // 预览容器 cover 模式
                cover : () => {
                    this.$magnifier.css('display', 'none')
                    this.$container.css({overflow: 'hidden'})
                    this.$preview.css({
                        width: this.bigImgWidth + 'px',
                        Height: this.bigImgHeight + 'px',
                        left: this.$container.offset().left + 'px',
                        top: this.$container.offset().top + 'px'
                    })
                    this.$container.append(this.$preview)
                },
                // 预览容器 aside 模式
                aside: () => {
                    switch(this.cfg.preview.pos) {
                        case '':
                        case 'left':
                        case undefined:
                            this.$preview.css({
                                top: this.$container.offset().top + 'px',
                                left: this.$container.offset().left + this.$container.width() + 'px'
                            })
                        break
                        case 'top':
                            this.$preview.css({
                                top: this.$container.offset().top - this.$preview.height() + 'px',
                                left: this.$container.offset().left + 'px'
                            })
                        break
                        case 'right':
                            this.$preview.css({
                                top: this.$container.offset().top + 'px',
                                left: this.$container.offset().left - this.$preview.width() + 'px'
                            })
                        break
                        case 'bottom':
                            this.$preview.css({
                                top: this.$container.offset().top + this.$container.height() + 'px',
                                left: this.$container.offset().left + 'px'
                            })
                        break
                    }
                    $('body').append(this.$preview)
                }
            },
            doubleclick: {
                magnifier: () => {},
                cover: () => {},
                aside: () => {}
            }
        }
        console.log('start build preview')
        console.log(this.$bigImg)

        this.$preview = $('<div data-preview style="display:none;position:absolute;top:0;left:0;"><div data-preview-img style="position:relative"></div></div>')
        this.$preview.find('[data-preview-img]').append(this.$bigImg)
        previewType[this.cfg.trigger][this.cfg.effect].call(this)
    }
}